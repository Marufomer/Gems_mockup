/**
 * Netlify Serverless Function: manage-reports
 * Handles fetching reports and updating report statuses for the Admin Dashboard.
 *
 * Security:
 * - GITHUB_TOKEN is only read on the server side via process.env.
 * - Requires admin password authentication header ("x-admin-password").
 * - Handles SHA conflicts with automatic retry when updating status.
 */

const MAX_RETRIES = 4;
const ALLOWED_STATUSES = ['Pending', 'Reviewed', 'Resolved', 'Rejected'];

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Content-Type': 'application/json',
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function verifyAdminAuth(event) {
  const configuredPassword = (process.env.ADMIN_PASSWORD || 'admin123').trim();
  const headers = event.headers || {};
  const incomingPassword = String(
    headers['x-admin-password'] ||
    headers['X-Admin-Password'] ||
    headers['X-ADMIN-PASSWORD'] ||
    event.queryStringParameters?.adminPassword ||
    ''
  ).trim();

  return Boolean(incomingPassword) && incomingPassword === configuredPassword;
}

export const handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Verify Admin authorization
  if (!verifyAdminAuth(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Invalid admin credentials.' }),
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Marufomer';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'Gems_mockup';
  const GITHUB_REPORT_PATH = process.env.GITHUB_REPORT_PATH || 'reports/reports.json';

  if (!GITHUB_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: GITHUB_TOKEN is not set in environment variables.',
      }),
    };
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_REPORT_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Gems-Mockup-Report-System',
  };

  // GET: Fetch all reports
  if (event.httpMethod === 'GET') {
    try {
      const getRes = await fetch(apiUrl, {
        method: 'GET',
        headers: ghHeaders,
      });

      if (getRes.status === 404) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ reports: [] }),
        };
      }

      if (!getRes.ok) {
        const errorText = await getRes.text();
        return {
          statusCode: getRes.status,
          headers,
          body: JSON.stringify({ error: `GitHub API error: ${errorText}` }),
        };
      }

      const fileData = await getRes.json();
      const contentStr = Buffer.from(fileData.content, 'base64').toString('utf8');
      let reports = [];
      try {
        const parsed = JSON.parse(contentStr);
        if (Array.isArray(parsed)) reports = parsed;
      } catch {
        reports = [];
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reports, sha: fileData.sha }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  // PATCH or POST: Update a report's status
  if (event.httpMethod === 'PATCH' || event.httpMethod === 'POST') {
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON body in request.' }),
      };
    }

    const { reportId, status } = body || {};

    if (!reportId || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing reportId or status in body.' }),
      };
    }

    // Normalize status casing: Pending, Reviewed, Resolved, Rejected
    const normalizedStatus =
      ALLOWED_STATUSES.find((s) => s.toLowerCase() === String(status).toLowerCase()) || null;

    if (!normalizedStatus) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}`,
        }),
      };
    }

    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        const getRes = await fetch(apiUrl, {
          method: 'GET',
          headers: ghHeaders,
        });

        if (!getRes.ok) {
          const errorText = await getRes.text();
          throw new Error(`GitHub get failed: ${errorText}`);
        }

        const fileData = await getRes.json();
        const currentSha = fileData.sha;
        const contentStr = Buffer.from(fileData.content, 'base64').toString('utf8');
        let reports = [];
        try {
          reports = JSON.parse(contentStr);
          if (!Array.isArray(reports)) reports = [];
        } catch {
          reports = [];
        }

        const targetIndex = reports.findIndex((r) => r.id === reportId);
        if (targetIndex === -1) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: `Report with ID "${reportId}" not found.` }),
          };
        }

        reports[targetIndex].status = normalizedStatus.toLowerCase();
        reports[targetIndex].statusLabel = normalizedStatus;
        reports[targetIndex].updatedAt = new Date().toISOString();

        const updatedContentUtf8 = JSON.stringify(reports, null, 2) + '\n';
        const updatedContentB64 = Buffer.from(updatedContentUtf8, 'utf8').toString('base64');

        const putRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            ...ghHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `chore: update status of report ${reportId} to ${normalizedStatus}`,
            content: updatedContentB64,
            sha: currentSha,
          }),
        });

        if (putRes.status === 200 || putRes.status === 201) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Report status updated to ${normalizedStatus}.`,
              report: reports[targetIndex],
            }),
          };
        }

        if (putRes.status === 409) {
          // SHA Conflict, retry
          await sleep(150 * attempt + Math.floor(Math.random() * 100));
          continue;
        }

        const putError = await putRes.text();
        throw new Error(`GitHub PUT failed: ${putError}`);
      } catch (err) {
        if (attempt >= MAX_RETRIES) {
          return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ error: err.message }),
          };
        }
        await sleep(200 * attempt);
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed.' }),
  };
};
