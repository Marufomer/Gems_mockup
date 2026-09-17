/**
 * Client-side API service for submitting and managing question reports.
 * Calls Netlify Serverless Functions:
 * - POST /.netlify/functions/submit-report
 * - GET/PATCH /.netlify/functions/manage-reports
 *
 * Notice:
 * - GITHUB_TOKEN is NEVER used or stored here. All GitHub interactions happen exclusively
 *   on the serverless function side.
 */

const FUNCTIONS_BASE = '/.netlify/functions'

export const REPORT_REASONS = [
  'Wrong answer',
  'Wrong question',
  'Typo / spelling mistake',
  'Unclear question',
  'Duplicate question',
  'Incorrect explanation',
  'Other',
]

/**
 * Submit a question report from student to the Netlify Serverless Function
 */
export async function submitQuestionReport({
  examId,
  examTitle,
  questionId,
  questionNumber,
  question,
  reason,
  message,
}) {
  const payload = {
    examId,
    examTitle,
    questionId,
    questionNumber,
    question,
    reason,
    message,
  }

  const response = await fetch(`${FUNCTIONS_BASE}/submit-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned unexpected format (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Failed to submit report (${response.status})`)
  }

  return data
}

/**
 * Fetch all question reports for the Admin Dashboard
 */
export async function fetchAdminReports(adminPassword = 'admin123') {
  const response = await fetch(`${FUNCTIONS_BASE}/manage-reports`, {
    method: 'GET',
    headers: {
      'x-admin-password': adminPassword,
    },
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned unexpected format (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Failed to fetch reports (${response.status})`)
  }

  return data?.reports || []
}

/**
 * Update the status of a report (Pending, Reviewed, Resolved, Rejected)
 */
export async function updateReportStatus(reportId, status, adminPassword = 'admin123') {
  const response = await fetch(`${FUNCTIONS_BASE}/manage-reports`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword,
    },
    body: JSON.stringify({ reportId, status }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned unexpected format (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Failed to update report status (${response.status})`)
  }

  return data
}
