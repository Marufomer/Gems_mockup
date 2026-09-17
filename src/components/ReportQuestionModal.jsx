import React, { useState } from 'react'
import { REPORT_REASONS, submitQuestionReport } from '../utils/reportService'

export default function ReportQuestionModal({
  isOpen,
  onClose,
  exam,
  question,
  questionNumber,
}) {
  const [selectedReason, setSelectedReason] = useState('Wrong answer')
  const [additionalMessage, setAdditionalMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !question) return null

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (isSubmitting) return

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await submitQuestionReport({
        examId: exam?.id || 'general-exam',
        examTitle: (exam?.title || 'Aviation Exam').replace('\n', ' '),
        questionId: question.id !== undefined ? question.id : questionNumber,
        questionNumber: questionNumber || 1,
        question: question.question || '',
        reason: selectedReason,
        message: additionalMessage,
      })

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setAdditionalMessage('')
        setSelectedReason('Wrong answer')
        onClose()
      }, 1800)
    } catch (err) {
      console.error('Report submission failed:', err)
      setErrorMessage(err.message || 'Unable to submit report. Please check your network connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrorMessage(null)
    setIsSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path
                  fillRule="evenodd"
                  d="M3 2.25a.75.75 0 0 1 .75.75v.54l1.838-.46a9.75 9.75 0 0 1 6.725.738l.108.054a8.25 8.25 0 0 0 5.58.652l3.109-.732a.75.75 0 0 1 .917.81 47.784 47.784 0 0 0 .005 10.337.75.75 0 0 1-.574.812l-3.114.733a9.75 9.75 0 0 1-6.594-.77l-.108-.054a8.25 8.25 0 0 0-5.69-.625l-2.202.55V21a.75.75 0 0 1-1.5 0V3A.75.75 0 0 1 3 2.25Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 id="report-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                Report Question
              </h2>
              <p className="text-xs text-slate-500">
                Question {questionNumber} · {exam?.title ? exam.title.replace('\n', ' ') : 'Exam'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Success Banner */}
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-emerald-900 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-xs">Report Submitted Successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Thank you. Your feedback has been recorded and will be reviewed by the admin team.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-900 animate-in fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-xs">Submission Failed</p>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Question Excerpt Snippet */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Current Question
            </p>
            <p className="text-xs text-slate-800 font-medium line-clamp-3 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              Reason: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => {
                const isChecked = selectedReason === reason
                return (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-xs font-medium select-none ${
                      isChecked
                        ? 'border-red-500 bg-red-50/50 text-red-950 font-semibold ring-1 ring-red-500/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={isChecked}
                      onChange={() => setSelectedReason(reason)}
                      disabled={isSubmitting}
                      className="w-3.5 h-3.5 text-red-600 focus:ring-red-500 border-slate-300 accent-red-600"
                    />
                    <span className="truncate">{reason}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Additional Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="additional-message" className="block font-bold text-slate-800 text-xs">
                Additional message <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {additionalMessage.length}/2000
              </span>
            </div>
            <textarea
              id="additional-message"
              rows={3}
              maxLength={2000}
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Explain the problem in detail (e.g. Correct answer should be option C because...)"
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-slate-400 disabled:bg-slate-50 resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
