import React from 'react'
import { getAllExams } from '../utils/examLoader'

function getExamIcon(exam) {
  const text = (exam.title + ' ' + exam.module).toLowerCase()

  if (text.includes('powerplant') || text.includes('engine')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path
          fillRule="evenodd"
          d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  if (text.includes('meteorology') || text.includes('weather')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M4.5 10.5a6 6 0 0 1 11.233-2.915A4.5 4.5 0 0 1 19.5 16.5H5.25A4.5 4.5 0 0 1 4.5 10.5Z" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
      <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
    </svg>
  )
}

function ExamCard({ exam, onStartExam }) {
  const icon = getExamIcon(exam)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`${exam.iconBg || 'bg-blue-600'} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight whitespace-pre-line">
            {exam.title}
          </h3>
          <p className="text-blue-500 text-xs mt-0.5 font-medium">Module: {exam.module}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{exam.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <div>
            <p className="text-gray-900 text-xs font-semibold">{exam.totalQuestions || 100}</p>
            <p className="text-gray-400 text-[10px]">Total Questions</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div>
            <p className="text-gray-900 text-xs font-semibold">{exam.durationMinutes || 150} minutes</p>
            <p className="text-gray-400 text-[10px]">Duration</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Progress row */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Not Started</span>
        <span>0%</span>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full -mt-3">
        <div className="h-1 bg-blue-500 rounded-full" style={{ width: '0%' }} />
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onStartExam && onStartExam(exam.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 mt-auto cursor-pointer shadow-xs hover:shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
        </svg>
        Start Exam
        <span className="ml-1">→</span>
      </button>
    </div>
  )
}

export default function AvailableExams({ onStartExam }) {
  const exams = getAllExams()

  return (
    <section className="mb-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Available Exams</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Select an exam from <code className="text-[11px] sm:text-xs bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">src/exams/</code> to start your test
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1 rounded-full">
          {exams.length} Exam{exams.length === 1 ? '' : 's'} Loaded
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} onStartExam={onStartExam} />
        ))}
      </div>
    </section>
  )
}
