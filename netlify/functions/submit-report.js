/**
 * Netlify Serverless Function: submit-report
 * Handles receiving question reports from students and appending them to reports/reports.json in GitHub.
 *
 * Security:
 * - GITHUB_TOKEN is only read on the server side via process.env.
 * - Validates input data strictly.
 * - Handles SHA conflicts with automatic retry.
 */

const ALLOWED_REASONS = [
  'Wrong answer',
  'Wrong question',
  'Typo / spelling mistake',
  'Unclear question',
  'Duplicate question',
  'Incorrect explanation',
  'Other',
];

const MAX_RETRIES = 4;

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

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

  if (!body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Request body is required.' }),
    };
  }

  const {
    examId,
    examTitle,
    questionId,
    questionNumber,
    question,
    reason,
    message,
  } = body;

  // Validation
  if (!examId || !question || questionNumber === undefined || questionNumber === null) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required fields: examId, question, and questionNumber are mandatory.',
      }),
    };
  }

  if (!reason || !ALLOWED_REASONS.includes(reason)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: `Invalid reason. Must be one of: ${ALLOWED_REASONS.join(', ')}`,
      }),
    };
  }

  // Construct report object
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const newReport = {
    id: reportId,
    examId: String(examId),
    examTitle: String(examTitle || examId),
    questionId: questionId !== undefined && questionId !== null ? String(questionId) : String(questionNumber),
    questionNumber: Number(questionNumber),
    question: String(question).trim(),
    reason: String(reason).trim(),
    message: message ? String(message).trim().slice(0, 2000) : '',
    reportedAt: new Date().toISOString(),
    status: 'pending',
  };

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Marufomer';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'Gems_mockup';
  const GITHUB_REPORT_PATH = process.env.GITHUB_REPORT_PATH || 'reports/reports.json';

  // If GITHUB_TOKEN is not configured, inform client clearly with useful message
  if (!GITHUB_TOKEN) {
    console.error('Missing GITHUB_TOKEN environment variable in Netlify function.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: GITHUB_TOKEN is not set in environment variables. Please configure GITHUB_TOKEN in Netlify Site Settings.',
      }),
    };
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_REPORT_PATH}`;
  const ghHeaders = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Gems-Mockup-Report-System',
  };

  // Retry loop for handling race conditions / SHA conflicts
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      // 1. Fetch current file from GitHub
      let currentSha = null;
      let existingReports = [];

      const getRes = await fetch(apiUrl, {
        method: 'GET',
        headers: ghHeaders,
      });

      if (getRes.status === 200) {
        const fileData = await getRes.json();
        currentSha = fileData.sha;
        const contentStr = Buffer.from(fileData.content, 'base64').toString('utf8');
        try {
          const parsed = JSON.parse(contentStr);
          if (Array.isArray(parsed)) {
            existingReports = parsed;
          }
        } catch (parseErr) {
          console.warn('Existing reports JSON was corrupt or non-array, starting with empty array.', parseErr);
          existingReports = [];
        }
      } else if (getRes.status === 404) {
        // File does not exist yet; will create it with initial array
        currentSha = null;
        existingReports = [];
      } else {
        const errorText = await getRes.text();
        console.error(`GitHub API GET error (${getRes.status}):`, errorText);
        throw new Error(`GitHub API returned status ${getRes.status}: ${errorText}`);
      }

      // 2. Append new report
      existingReports.push(newReport);

      // 3. Prepare commit to GitHub
      const updatedContentUtf8 = JSON.stringify(existingReports, null, 2) + '\n';
      const updatedContentB64 = Buffer.from(updatedContentUtf8, 'utf8').toString('base64');

      const commitBody = {
        message: `chore: report issue on question #${newReport.questionNumber} in ${newReport.examTitle} [${newReport.id}]`,
        content: updatedContentB64,
      };
      if (currentSha) {
        commitBody.sha = currentSha;
      }

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          ...ghHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitBody),
      });

      if (putRes.status === 200 || putRes.status === 201) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Report submitted successfully.',
            report: newReport,
          }),
        };
      }

      if (putRes.status === 409) {
        // SHA conflict: another request committed in the meantime. Wait and retry.
        console.warn(`SHA conflict on attempt ${attempt}. Retrying...`);
        await sleep(150 * attempt + Math.floor(Math.random() * 100));
        continue;
      }

      const putErrorText = await putRes.text();
      console.error(`GitHub API PUT error (${putRes.status}):`, putErrorText);
      throw new Error(`GitHub commit failed with status ${putRes.status}: ${putErrorText}`);
    } catch (err) {
      console.error(`Attempt ${attempt} error:`, err.message);
      if (attempt >= MAX_RETRIES) {
        return {
          statusCode: 502,
          headers,
          body: JSON.stringify({
            error: `Failed to commit report to GitHub: ${err.message}`,
          }),
        };
      }
      await sleep(200 * attempt);
    }
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      error: 'Could not complete report submission after maximum retries due to concurrent conflicts.',
    }),
  };
};
