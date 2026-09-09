import React from 'react'

export default function ModeSelectModal({
  exam,
  isOpen,
  onClose,
  onSelectMode,
}) {
  if (!isOpen || !exam) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              {exam.module || 'Exam Preparation'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Choose How to Take This Exam
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your preferred preparation mode for <strong className="text-slate-700">{exam.title.replace('\n', ' ')}</strong> ({exam.totalQuestions || exam.questions?.length || 0} questions).
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Two Mode Options */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* OPTION 1: Real Exam Mode */}
          <div
            onClick={() => onSelectMode('exam')}
            className="group rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Exam Mode
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Timed
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Simulate standard exam conditions with a countdown timer. Answers and explanations are revealed after you complete the test.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span><strong>{exam.durationMinutes || 150} minutes</strong> countdown timer</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Results & score after finishing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Detailed breakdown on Results page</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelectMode('exam')
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Exam Mode
              <span>→</span>
            </button>
          </div>

          {/* OPTION 2: Practice & Learn Mode */}
          <div
            onClick={() => onSelectMode('practice')}
            className="group rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                  Practice Mode
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Untimed
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Prepare and learn without time pressure. See whether your choice is correct immediately upon clicking, with explanations shown right away.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Untimed</strong> — learn at your own pace</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span><strong>Instant feedback</strong> on every click</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Explanations displayed immediately</span>
                </li>
              </ul>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelectMode('practice')
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Practice Mode
              <span>→</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>You can switch modes or finish at any time during the session.</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}
