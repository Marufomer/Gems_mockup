// Dynamically load all JSON files from src/exams/ using Vite's eager import glob
const examModules = import.meta.glob('../exams/*.json', { eager: true })

/**
 * Normalizes an exam object from a JSON file.
 */
function normalizeExam(filePath, rawData) {
  const data = rawData.default || rawData
  const fileName = filePath.split('/').pop().replace('.json', '')

  const id = String(data.id || fileName)
  const questions = Array.isArray(data.questions) ? data.questions : []
  const totalQuestions = questions.length
  const durationMinutes = Number(data.durationMinutes || 150)
  const color = data.color || (id.includes('powerplant') ? 'purple' : id.includes('airframe') ? 'green' : 'blue')

  // Icon background class helper
  const colorMap = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-emerald-600',
    amber: 'bg-amber-600',
    yellow: 'bg-yellow-500',
    rose: 'bg-rose-600',
    red: 'bg-red-600',
    indigo: 'bg-indigo-600',
    cyan: 'bg-cyan-600',
    teal: 'bg-teal-600',
  }

  const iconBg = colorMap[color] || 'bg-blue-600'

  return {
    ...data,
    id,
    fileName,
    title: data.title || fileName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    module: data.module ? (data.module.startsWith('Module:') ? data.module.replace('Module:', '').trim() : data.module) : 'General Aviation',
    description: data.description || 'Test your knowledge on this subject.',
    durationMinutes,
    totalQuestions,
    color,
    iconBg,
    questions,
  }
}

/**
 * Returns all exams loaded from src/exams/*.json
 */
export function getAllExams() {
  const list = []
  for (const [path, moduleContent] of Object.entries(examModules)) {
    list.push(normalizeExam(path, moduleContent))
  }
  return list
}

/**
 * Finds an exam by ID or filename
 */
export function getExamById(id) {
  const all = getAllExams()
  const targetId = String(id).toLowerCase()
  return (
    all.find((ex) => String(ex.id).toLowerCase() === targetId || ex.fileName.toLowerCase() === targetId) ||
    all[0]
  )
}
