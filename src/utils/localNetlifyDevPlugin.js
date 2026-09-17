import fs from 'node:fs'
import path from 'node:path'

export function localNetlifyFunctionsPlugin() {
  return {
    name: 'local-netlify-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : ''
        const queryParams = {}
        if (req.url && req.url.includes('?')) {
          const qs = req.url.split('?')[1]
          const searchParams = new URLSearchParams(qs)
          for (const [k, v] of searchParams.entries()) {
            queryParams[k] = v
          }
        }

        // Check if matching /.netlify/functions/submit-report
        if (url === '/.netlify/functions/submit-report' || url === '/api/submit-report') {
          // If GITHUB_TOKEN is present in process.env, execute the real Netlify function
          if (process.env.GITHUB_TOKEN) {
            try {
              const { handler } = await import('./netlify/functions/submit-report.js')
              let bodyStr = ''
              req.on('data', (chunk) => { bodyStr += chunk })
              req.on('end', async () => {
                const event = {
                  httpMethod: req.method,
                  headers: req.headers,
                  queryStringParameters: queryParams,
                  body: bodyStr,
                }
                const result = await handler(event)
                res.writeHead(result.statusCode || 200, result.headers || {})
                res.end(result.body || '')
              })
              return
            } catch (err) {
              console.error('Local netlify handler error:', err)
            }
          }

          // Fallback when GITHUB_TOKEN is not yet set in local dev environment:
          // Directly read and append to reports/reports.json on disk so local testing works seamlessly!
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
            })
            res.end()
            return
          }

          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', (chunk) => { bodyStr += chunk })
            req.on('end', () => {
              try {
                const body = JSON.parse(bodyStr)
                const ALLOWED_REASONS = [
                  'Wrong answer',
                  'Wrong question',
                  'Typo / spelling mistake',
                  'Unclear question',
                  'Duplicate question',
                  'Incorrect explanation',
                  'Other',
                ]
                if (!body.reason || !ALLOWED_REASONS.includes(body.reason)) {
                  res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                  res.end(JSON.stringify({ error: `Invalid reason. Must be one of: ${ALLOWED_REASONS.join(', ')}` }))
                  return
                }

                const reportsPath = path.resolve(process.cwd(), 'reports', 'reports.json')
                let reports = []
                if (fs.existsSync(reportsPath)) {
                  try {
                    const raw = fs.readFileSync(reportsPath, 'utf8')
                    reports = JSON.parse(raw)
                    if (!Array.isArray(reports)) reports = []
                  } catch {
                    reports = []
                  }
                }

                const newReport = {
                  id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                  examId: String(body.examId),
                  examTitle: String(body.examTitle || body.examId),
                  questionId: String(body.questionId || body.questionNumber),
                  questionNumber: Number(body.questionNumber),
                  question: String(body.question).trim(),
                  reason: String(body.reason).trim(),
                  message: body.message ? String(body.message).trim().slice(0, 2000) : '',
                  reportedAt: new Date().toISOString(),
                  status: 'pending',
                }

                reports.push(newReport)
                fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2) + '\n', 'utf8')

                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                res.end(JSON.stringify({
                  success: true,
                  message: 'Report submitted successfully (saved to local reports.json).',
                  report: newReport,
                }))
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                res.end(JSON.stringify({ error: err.message }))
              }
            })
            return
          }
        }

        // Check if matching /.netlify/functions/manage-reports
        if (url === '/.netlify/functions/manage-reports' || url === '/api/manage-reports') {
          if (process.env.GITHUB_TOKEN) {
            try {
              const { handler } = await import('./netlify/functions/manage-reports.js')
              let bodyStr = ''
              req.on('data', (chunk) => { bodyStr += chunk })
              req.on('end', async () => {
                const event = {
                  httpMethod: req.method,
                  headers: req.headers,
                  queryStringParameters: queryParams,
                  body: bodyStr,
                }
                const result = await handler(event)
                res.writeHead(result.statusCode || 200, result.headers || {})
                res.end(result.body || '')
              })
              return
            } catch (err) {
              console.error('Local netlify handler error:', err)
            }
          }

          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-password, X-Admin-Password',
              'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
            })
            res.end()
            return
          }

          const configuredPass = (process.env.ADMIN_PASSWORD || 'admin123').trim()
          const incomingPass = String(
            req.headers['x-admin-password'] ||
            req.headers['X-Admin-Password'] ||
            queryParams.adminPassword ||
            ''
          ).trim()

          if (incomingPass !== configuredPass) {
            res.writeHead(401, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            })
            res.end(JSON.stringify({ error: 'Unauthorized: Invalid admin credentials.' }))
            return
          }

          // Fallback to local reports/reports.json file
          const reportsPath = path.resolve(process.cwd(), 'reports', 'reports.json')
          let reports = []
          if (fs.existsSync(reportsPath)) {
            try {
              reports = JSON.parse(fs.readFileSync(reportsPath, 'utf8'))
              if (!Array.isArray(reports)) reports = []
            } catch {
              reports = []
            }
          }

          if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
            res.end(JSON.stringify({ reports }))
            return
          }

          if (req.method === 'PATCH' || req.method === 'POST') {
            let bodyStr = ''
            req.on('data', (chunk) => { bodyStr += chunk })
            req.on('end', () => {
              try {
                const { reportId, status } = JSON.parse(bodyStr)
                const target = reports.find((r) => r.id === reportId)
                if (target) {
                  target.status = String(status).toLowerCase()
                  target.statusLabel = status
                  target.updatedAt = new Date().toISOString()
                  fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2) + '\n', 'utf8')
                  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                  res.end(JSON.stringify({ success: true, report: target }))
                } else {
                  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                  res.end(JSON.stringify({ error: 'Report not found' }))
                }
              } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
                res.end(JSON.stringify({ error: err.message }))
              }
            })
            return
          }
        }

        next()
      })
    },
  }
}
