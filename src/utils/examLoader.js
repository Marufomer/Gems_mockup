// Dynamically load all JSON files from src/exams/ using Vite's eager import glob
const examModules = import.meta.glob('../exams/*.json', { eager: true })

export const COURSES = [
  {
    id: 'avionics',
    title: 'Avionics Exam',
    shortName: 'Avionics',
    icon: 'avionics',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    headerBg: 'from-blue-600 to-indigo-700',
    description: 'Aircraft electrical theory, avionics systems, digital techniques, instruments & communication.',
  },
  {
    id: 'airframe',
    title: 'Airframe Exam',
    shortName: 'Airframe',
    icon: 'airframe',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headerBg: 'from-emerald-600 to-teal-700',
    description: 'Aircraft structures, aerodynamics, hydraulic & pneumatic systems, flight controls & landing gear.',
  },
  {
    id: 'powerplant',
    title: 'Powerplant Exam',
    shortName: 'Powerplant',
    icon: 'powerplant',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    headerBg: 'from-purple-600 to-violet-700',
    description: 'Reciprocating & turbine engines, fuel metering, ignition systems, propellers & lubrication.',
  },
]

export const SUB_SECTIONS = [
  {
    id: 'part',
    title: 'Part Exam',
    shortTitle: 'Part Exam',
    subtitle: 'Module & chapter-specific practice exams',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'school_final',
    title: 'Subfinal and School Exam',
    shortTitle: 'Subfinal & School Exam',
    subtitle: 'Comprehensive school finals & subfinal evaluation exams',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'our_exam_b278',
    title: 'our exam(B278)',
    shortTitle: 'our exam(B278)',
    subtitle: 'B278 batch examination tests & practice questions',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
]

/**
 * Determines which course an exam belongs to: 'avionics' | 'airframe' | 'powerplant'
 */
function determineCourse(data, fileName) {
  const explicit = String(data.course || data.subject || '').toLowerCase().trim()
  if (explicit.includes('airframe') || explicit === 'af') return 'airframe'
  if (explicit.includes('powerplant') || explicit.includes('engine') || explicit === 'pp') return 'powerplant'
  if (explicit.includes('avionic') || explicit.includes('avo')) return 'avionics'

  // Auto-detect from filename, title, id, or module text
  const combined = `${data.id || ''} ${fileName} ${data.title || ''} ${data.module || ''}`.toLowerCase()
  if (combined.includes('airframe') || combined.includes('air-frame')) return 'airframe'
  if (combined.includes('powerplant') || combined.includes('power-plant') || combined.includes('engine')) return 'powerplant'
  if (combined.includes('avo') || combined.includes('avionic') || combined.includes('et-av')) return 'avionics'

  return 'avionics'
}

/**
 * Determines which sub-section an exam belongs to: 'part' | 'school_final' | 'our_exam_b278'
 */
function determineCategory(data, fileName) {
  const explicit = String(data.category || data.subSection || data.section || data.type || '').toLowerCase().trim()
  if (
    explicit.includes('b278') ||
    explicit.includes('our exam') ||
    explicit.includes('our_exam') ||
    explicit === 'our_exam_b278'
  ) {
    return 'our_exam_b278'
  }
  if (
    explicit.includes('school') ||
    explicit.includes('final') ||
    explicit.includes('subfinal') ||
    explicit === 'school_final' ||
    explicit === 'subfinal_school'
  ) {
    return 'school_final'
  }
  if (explicit.includes('part')) {
    return 'part'
  }

  // Auto-detect from filename, title, id, or module text
  const combined = `${data.id || ''} ${fileName} ${data.title || ''} ${data.module || ''}`.toLowerCase()
  if (combined.includes('b278') || combined.includes('our exam') || combined.includes('our_exam')) {
    return 'our_exam_b278'
  }
  if (
    combined.includes('school') ||
    combined.includes('subfinal') ||
    combined.includes('school_final') ||
    combined.includes('school-final')
  ) {
    return 'school_final'
  }

  return 'part'
}

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

  const course = determineCourse(data, fileName)
  const category = determineCategory(data, fileName)

  const color = data.color || (course === 'powerplant' ? 'purple' : course === 'airframe' ? 'green' : 'blue')

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

  let categoryLabel = 'Part Exam'
  if (category === 'school_final') {
    categoryLabel = 'Subfinal & School Exam'
  } else if (category === 'our_exam_b278') {
    categoryLabel = 'our exam(B278)'
  }

  return {
    ...data,
    id,
    fileName,
    title: data.title || fileName.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    module: data.module ? (data.module.startsWith('Module:') ? data.module.replace('Module:', '').trim() : data.module) : 'General Aviation',
    description: data.description || 'Test your knowledge on this subject.',
    durationMinutes,
    totalQuestions,
    course, // 'avionics' | 'airframe' | 'powerplant'
    category, // 'part' | 'school_final' | 'our_exam_b278'
    categoryLabel,
    courseLabel: course === 'airframe' ? 'Airframe Exam' : course === 'powerplant' ? 'Powerplant Exam' : 'Avionics Exam',
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
 * Returns grouped exams by Course and Sub-section
 */
export function getExamsGrouped() {
  const allExams = getAllExams()

  const grouped = {}
  COURSES.forEach((course) => {
    const courseExams = allExams.filter((ex) => ex.course === course.id)
    grouped[course.id] = {
      info: course,
      part: courseExams.filter((ex) => ex.category === 'part'),
      school_final: courseExams.filter((ex) => ex.category === 'school_final'),
      our_exam_b278: courseExams.filter((ex) => ex.category === 'our_exam_b278'),
      total: courseExams.length,
    }
  })

  return grouped
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
