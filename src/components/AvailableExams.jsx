import React, { useState } from 'react'
import { COURSES, getExamsGrouped } from '../utils/examLoader'

function getCourseIcon(courseId, className = 'w-6 h-6') {
  if (courseId === 'powerplant') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path
          fillRule="evenodd"
          d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  if (courseId === 'airframe') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
      </svg>
    )
  }

  // Avionics
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ExamCard({ exam, onStartExam }) {
  const icon = getCourseIcon(exam.course, 'w-6 h-6')
  const isSchoolFinal = exam.category === 'school_final'
  const isOurExamB278 = exam.category === 'our_exam_b278'

  let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200'
  let badgeLabel = '📘 Part Exam'
  if (isOurExamB278) {
    badgeClass = 'bg-purple-50 text-purple-700 border-purple-200'
    badgeLabel = '⚡ our exam(B278)'
  } else if (isSchoolFinal) {
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-200'
    badgeLabel = '🎓 Subfinal & School Exam'
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
            {badgeLabel}
          </span>

          <span className="text-[11px] font-medium text-slate-400">
            {exam.durationMinutes || 150} mins
          </span>
        </div>

        {/* Title & Module Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className={`${exam.iconBg || 'bg-blue-600'} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs group-hover:scale-105 transition-transform`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm leading-snug truncate" title={exam.title}>
              {exam.title.replace('\n', ' ')}
            </h4>
            <p className="text-blue-600 text-xs font-medium mt-0.5 truncate" title={exam.module}>
              Module: {exam.module}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {exam.description}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 py-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Questions</p>
              <p className="font-bold text-slate-800 text-xs">{exam.totalQuestions} Qs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Duration</p>
              <p className="font-bold text-slate-800 text-xs">{exam.durationMinutes || 150} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onStartExam && onStartExam(exam.id)}
        className="w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
      >
        <span>Start Exam</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}

function EmptySubSectionCard({ course, categoryId }) {
  const isSchoolFinal = categoryId === 'school_final'
  const isOurExamB278 = categoryId === 'our_exam_b278'

  const titleText = isOurExamB278
    ? 'No our exam(B278) Added Yet'
    : isSchoolFinal
    ? 'No Subfinal or School Exams Added Yet'
    : 'No Part Exams Added Yet'

  const categoryValue = isOurExamB278 ? 'our_exam_b278' : isSchoolFinal ? 'school_final' : 'part'

  return (
    <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <h5 className="font-semibold text-slate-800 text-xs mb-1">
        {titleText}
      </h5>
      <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed mb-3">
        Place a new JSON file into <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px] text-blue-600">src/exams/</code> with <code className="font-mono text-slate-700">"course": "{course.id}"</code> and <code className="font-mono text-slate-700">"category": "{categoryValue}"</code>.
      </p>
      <span className="text-[10px] text-slate-400">Refer to src/exams/README.md for format template</span>
    </div>
  )
}

export default function AvailableExams({ onStartExam }) {
  const grouped = getExamsGrouped()
  const [selectedCourseTab, setSelectedCourseTab] = useState('all') // 'all' | 'avionics' | 'airframe' | 'powerplant'

  // Expand / Collapse state for Course Sections (all collapsed by default on initial display)
  const [expandedCourses, setExpandedCourses] = useState({
    avionics: false,
    airframe: false,
    powerplant: false,
  })

  // Expand / Collapse state for Subsections within each course (all collapsed by default on initial display)
  const [expandedSubsections, setExpandedSubsections] = useState({
    'avionics-part': false,
    'avionics-school_final': false,
    'avionics-our_exam_b278': false,
    'airframe-part': false,
    'airframe-school_final': false,
    'airframe-our_exam_b278': false,
    'powerplant-part': false,
    'powerplant-school_final': false,
    'powerplant-our_exam_b278': false,
  })

  // Toggle Course Section Open/Closed
  const handleToggleCourse = (courseId) => {
    setExpandedCourses((prev) => {
      const willOpen = !prev[courseId]
      const next = { ...prev, [courseId]: willOpen }
      
      // If opening, smooth scroll section up into comfortable view
      if (willOpen) {
        setTimeout(() => {
          const el = document.getElementById(`course-section-${courseId}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 50)
      }
      return next
    })
  }

  // Toggle Sub-Section Open/Closed
  const handleToggleSubsection = (courseId, categoryId) => {
    const key = `${courseId}-${categoryId}`
    setExpandedSubsections((prev) => {
      const willOpen = !prev[key]
      const next = { ...prev, [key]: willOpen }

      // If opening, smooth scroll subsection up into view
      if (willOpen) {
        setTimeout(() => {
          const el = document.getElementById(`sub-section-${key}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 50)
      }
      return next
    })
  }

  // Filter tabs handler: opens course and scrolls up
  const handleSelectCourseTab = (courseId) => {
    setSelectedCourseTab(courseId)
    if (courseId !== 'all') {
      setExpandedCourses((prev) => ({ ...prev, [courseId]: true }))
      setExpandedSubsections((prev) => ({
        ...prev,
        [`${courseId}-part`]: true,
        [`${courseId}-school_final`]: true,
        [`${courseId}-our_exam_b278`]: true,
      }))
      setTimeout(() => {
        const el = document.getElementById(`course-section-${courseId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)
    }
  }

  // Quick toggle all courses and subsections
  const allCoursesOpen = Object.values(expandedCourses).every(Boolean)
  const handleToggleAllCourses = () => {
    const nextState = !allCoursesOpen
    const updatedCourses = {}
    const updatedSubsections = {}
    COURSES.forEach((c) => {
      updatedCourses[c.id] = nextState
      updatedSubsections[`${c.id}-part`] = nextState
      updatedSubsections[`${c.id}-school_final`] = nextState
      updatedSubsections[`${c.id}-our_exam_b278`] = nextState
    })
    setExpandedCourses(updatedCourses)
    setExpandedSubsections(updatedSubsections)
  }

  // Count total exams across all courses
  const totalAllExams = Object.values(grouped).reduce((acc, curr) => acc + curr.total, 0)

  // Filter which courses to display
  const coursesToDisplay =
    selectedCourseTab === 'all'
      ? COURSES
      : COURSES.filter((c) => c.id === selectedCourseTab)

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Aviation Examination Courses
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Click any section or sub-section to open up and view available exams
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleToggleAllCourses}
            className="text-xs text-slate-600 hover:text-blue-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {allCoursesOpen ? 'Collapse All Sections' : 'Expand All Sections'}
          </button>

          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            {totalAllExams} Exams
          </span>
        </div>
      </div>

      {/* Course Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => handleSelectCourseTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedCourseTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Courses</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              selectedCourseTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalAllExams}
          </span>
        </button>

        {COURSES.map((course) => {
          const count = grouped[course.id]?.total || 0
          const isSelected = selectedCourseTab === course.id

          return (
            <button
              key={course.id}
              onClick={() => handleSelectCourseTab(course.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {getCourseIcon(course.id, 'w-4 h-4')}
              <span>{course.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Course Sections */}
      <div className="space-y-6">
        {coursesToDisplay.map((course) => {
          const courseData = grouped[course.id]
          const partExams = courseData?.part || []
          const schoolFinalExams = courseData?.school_final || []
          const ourExamB278Exams = courseData?.our_exam_b278 || []
          const courseTotal = courseData?.total || 0
          const isCourseExpanded = Boolean(expandedCourses[course.id])

          const isPartExpanded = Boolean(expandedSubsections[`${course.id}-part`])
          const isSchoolFinalExpanded = Boolean(expandedSubsections[`${course.id}-school_final`])
          const isOurExamB278Expanded = Boolean(expandedSubsections[`${course.id}-our_exam_b278`])

          return (
            <div
              key={course.id}
              id={`course-section-${course.id}`}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-300"
            >
              {/* Course Header Accordion Button (Click to toggle open/closed and scroll up) */}
              <button
                type="button"
                onClick={() => handleToggleCourse(course.id)}
                className="w-full text-left p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-blue-50/20 hover:bg-blue-50/40 transition-colors cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${
                      course.id === 'powerplant'
                        ? 'bg-purple-600 text-white'
                        : course.id === 'airframe'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    } flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    {getCourseIcon(course.id, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {courseTotal} Exam{courseTotal === 1 ? '' : 's'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-700">{partExams.length} Part</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-700">{schoolFinalExams.length} School Final</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-purple-700">{ourExamB278Exams.length} B278</span>
                  </div>

                  {/* Rotating Chevron Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-transform duration-200 ${
                      isCourseExpanded
                        ? 'rotate-180 bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-white text-slate-400 border-slate-200 group-hover:border-slate-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Sub-sections Container (Shown when Course is open) */}
              {isCourseExpanded && (
                <div className="p-5 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  
                  {/* SUB-SECTION 1: Part Exam */}
                  <div
                    id={`sub-section-${course.id}-part`}
                    className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-slate-50/40"
                  >
                    {/* Sub-section Header Button (Click to toggle/open up Part Exam) */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubsection(course.id, 'part')}
                      className="w-full flex items-center justify-between gap-2 pb-2 text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          Part Exam
                        </h4>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.2 rounded-full">
                          {partExams.length}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline font-normal">
                          · Module & topic-specific exams
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="hidden sm:inline text-[11px] text-slate-400">
                          {isPartExpanded ? 'Click to collapse' : 'Click to open up'}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform duration-200 ${
                            isPartExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Part Exam Cards (Opens up when expanded) */}
                    {isPartExpanded && (
                      <div className="pt-3 animate-in fade-in duration-150">
                        {partExams.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {partExams.map((exam) => (
                              <ExamCard key={exam.id} exam={exam} onStartExam={onStartExam} />
                            ))}
                          </div>
                        ) : (
                          <EmptySubSectionCard course={course} categoryId="part" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* SUB-SECTION 2: Subfinal and School Exam */}
                  <div
                    id={`sub-section-${course.id}-school_final`}
                    className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-slate-50/40"
                  >
                    {/* Sub-section Header Button (Click to toggle/open up Subfinal and School Exam) */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubsection(course.id, 'school_final')}
                      className="w-full flex items-center justify-between gap-2 pb-2 text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                          Subfinal and School Exam
                        </h4>
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-0.2 rounded-full">
                          {schoolFinalExams.length}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline font-normal">
                          · Comprehensive school final & subfinal evaluation exams
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="hidden sm:inline text-[11px] text-slate-400">
                          {isSchoolFinalExpanded ? 'Click to collapse' : 'Click to open up'}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform duration-200 ${
                            isSchoolFinalExpanded ? 'rotate-180 text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Subfinal & School Exam Cards (Opens up when expanded) */}
                    {isSchoolFinalExpanded && (
                      <div className="pt-3 animate-in fade-in duration-150">
                        {schoolFinalExams.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schoolFinalExams.map((exam) => (
                              <ExamCard key={exam.id} exam={exam} onStartExam={onStartExam} />
                            ))}
                          </div>
                        ) : (
                          <EmptySubSectionCard course={course} categoryId="school_final" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* SUB-SECTION 3: our exam(B278) */}
                  <div
                    id={`sub-section-${course.id}-our_exam_b278`}
                    className="border border-purple-200/80 rounded-2xl p-4 sm:p-5 bg-purple-50/20"
                  >
                    {/* Sub-section Header Button (Click to toggle/open up our exam(B278)) */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubsection(course.id, 'our_exam_b278')}
                      className="w-full flex items-center justify-between gap-2 pb-2 text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
                          our exam(B278)
                        </h4>
                        <span className="text-[11px] font-semibold text-purple-800 bg-purple-100/80 border border-purple-200 px-2 py-0.2 rounded-full">
                          {ourExamB278Exams.length}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline font-normal">
                          · B278 batch examination tests & practice questions
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="hidden sm:inline text-[11px] text-slate-400">
                          {isOurExamB278Expanded ? 'Click to collapse' : 'Click to open up'}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform duration-200 ${
                            isOurExamB278Expanded ? 'rotate-180 text-purple-600' : 'text-slate-400'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* our exam(B278) Cards (Opens up when expanded) */}
                    {isOurExamB278Expanded && (
                      <div className="pt-3 animate-in fade-in duration-150">
                        {ourExamB278Exams.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ourExamB278Exams.map((exam) => (
                              <ExamCard key={exam.id} exam={exam} onStartExam={onStartExam} />
                            ))}
                          </div>
                        ) : (
                          <EmptySubSectionCard course={course} categoryId="our_exam_b278" />
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
