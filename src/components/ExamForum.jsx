import React, { useState, useEffect, useMemo } from 'react'
import { getExamById } from '../utils/examLoader'

export default function ExamForum({
  examId = 'aircraft-instruments',
  mode: initialMode = 'exam', // 'exam' | 'practice'
  onBackToDashboard,
  onShowResults,
}) {
  const examData = getExamById(examId)
  const questionsList = examData.questions || []

  // Strict actual questions count from the JSON file
  const totalQuestionsCount = questionsList.length

  // Mode state: 'exam' (timed, hidden answers until submit) | 'practice' (untimed, instant feedback)
  const [currentMode, setCurrentMode] = useState(initialMode)

  // Navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  // Map of questionIndex -> selected option index
  const [userAnswers, setUserAnswers] = useState({})
  // Set of question indices marked for review
  const [markedForReview, setMarkedForReview] = useState(new Set())
  // Countdown timer in seconds from JSON duration (only active in exam mode)
  const [secondsRemaining, setSecondsRemaining] = useState((examData.durationMinutes || 150) * 60)
  // Modal states
  const [showEndModal, setShowEndModal] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Timer interval: ONLY active in 'exam' mode
  useEffect(() => {
    if (examSubmitted || currentMode !== 'exam') return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowEndModal(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [examSubmitted, currentMode])

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Active question strictly from current index (NO loop, NO repeating)
  const activeQuestion = questionsList[currentQuestionIndex] || null
  const currentSelectedOption = userAnswers[currentQuestionIndex]
  const isMarked = markedForReview.has(currentQuestionIndex)

  // Handlers
  const handleSelectOption = (index) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: index,
    }))
  }

  const handleToggleMarkReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestionIndex)) {
        next.delete(currentQuestionIndex)
      } else {
        next.add(currentQuestionIndex)
      }
      return next
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestionsCount - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // If at last question, prompt submission
      setShowEndModal(true)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Calculations for progress
  const answeredCount = Object.keys(userAnswers).length
  const progressPercent = totalQuestionsCount > 0 ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0

  // Filter marked questions jump
  const handleReviewMarked = () => {
    const markedList = Array.from(markedForReview)
    if (markedList.length > 0) {
      setCurrentQuestionIndex(markedList[0])
    } else {
      alert('No questions have been marked for review yet.')
    }
  }

  // Calculate score upon ending
  const scoreSummary = useMemo(() => {
    let correct = 0
    let attempted = 0
    questionsList.forEach((q, idx) => {
      if (userAnswers[idx] !== undefined) {
        attempted++
        if (userAnswers[idx] === q.correctIndex) {
          correct++
        }
      }
    })
    return { correct, attempted, total: totalQuestionsCount }
  }, [userAnswers, questionsList, totalQuestionsCount])

  // Circular progress stroke calculation
  const circleRadius = 38
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Practice mode helpers for current question
  const isQuestionAnswered = currentSelectedOption !== undefined
  const isCurrentAnswerCorrect = isQuestionAnswered && activeQuestion && currentSelectedOption === activeQuestion.correctIndex

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* Top Navbar - Clean (No notification, no profile) */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-5 h-5"
              >
                <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.949 49.949 0 0 0-9.902 3.912l-.003.002-.34.18a.75.75 0 0 1-.707 0A50.009 50.009 0 0 0 7.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.129 56.129 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 0 1-.46.71 47.878 47.878 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.877 47.877 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 0 1 6 13.18v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 0 0 .551-1.608 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.668 2.25 2.25 0 0 0 2.12 0Z" />
              </svg>
            </div>
            <span className="text-base sm:text-xl font-bold text-slate-900 tracking-tight hidden sm:inline">Gems-Mockup</span>
          </div>

          {/* Mode Switcher Pill in Navbar */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setCurrentMode('exam')}
              className={`px-2 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currentMode === 'exam'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ⏱️ <span className="hidden sm:inline">Exam Mode</span><span className="sm:hidden">Exam</span>
            </button>
            <button
              onClick={() => setCurrentMode('practice')}
              className={`px-2 sm:px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                currentMode === 'practice'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              💡 <span className="hidden sm:inline">Practice Mode</span><span className="sm:hidden">Practice</span>
            </button>
          </div>
        </div>

        {/* Back to Dashboard Link */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-2.5 sm:px-3 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Exit</span>
        </button>
      </header>

      {/* Main Forum Body (3 Column Layout with mobile order) */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* LEFT COLUMN: Questions Grid & Exam Quick Info (order-2 on mobile, order-1 on desktop) */}
        <aside className="order-2 lg:order-1 lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            {/* Top Exam Badge Card */}
            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <div className={`w-10 h-10 rounded-xl ${examData.iconBg || 'bg-blue-600'} flex items-center justify-center flex-shrink-0 text-white shadow-xs`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-tight whitespace-pre-line">
                  {examData.title}
                </h2>
                <p className="text-blue-500 text-xs font-medium mt-0.5">
                  Module: {examData.module}
                </p>
              </div>
            </div>

            {/* Total Questions & Duration Stats */}
            <div className="grid grid-cols-2 gap-2 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Total Questions</p>
                  <p className="text-xs font-bold text-slate-800">{totalQuestionsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">Mode</p>
                  <p className={`text-xs font-bold ${currentMode === 'practice' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {currentMode === 'practice' ? 'Untimed Practice' : `${examData.durationMinutes || 150} mins`}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Grid Header */}
            <div className="mt-4 mb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Questions</h3>
              <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                1 - {totalQuestionsCount}
              </span>
            </div>

            {/* Questions Grid - EXACT buttons for REAL questions found in JSON */}
            {totalQuestionsCount === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No questions found in this JSON file.</p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1 py-1">
                {questionsList.map((q, index) => {
                  const isCurrent = index === currentQuestionIndex
                  const isAns = userAnswers[index] !== undefined
                  const isRev = markedForReview.has(index)

                  let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200'

                  if (currentMode === 'practice') {
                    // In practice mode: immediate green for correct, red for incorrect
                    if (isAns) {
                      const isCorrect = userAnswers[index] === q.correctIndex
                      btnStyle = isCorrect ? 'bg-emerald-600 text-white font-semibold' : 'bg-rose-500 text-white font-semibold'
                    }
                    if (isCurrent) {
                      btnStyle += ' ring-2 ring-blue-500 font-bold shadow-xs'
                    }
                  } else {
                    // In exam mode: standard answered (green), marked (red), current (blue)
                    if (isCurrent) {
                      btnStyle = 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400'
                    } else if (isRev) {
                      btnStyle = 'bg-red-500 text-white font-semibold'
                    } else if (isAns) {
                      btnStyle = 'bg-emerald-500 text-white font-semibold'
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="pt-4 border-t border-slate-100 space-y-2 mt-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-blue-600 flex-shrink-0"></span>
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 flex-shrink-0"></span>
              <span>{currentMode === 'practice' ? 'Answered Correctly' : 'Answered'}</span>
            </div>
            {currentMode === 'practice' ? (
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-rose-500 flex-shrink-0"></span>
                <span>Answered Incorrectly</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-red-500 flex-shrink-0"></span>
                <span>Marked for Review</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-200 flex-shrink-0"></span>
              <span>Not Answered</span>
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Question & Answer Panel (order-1 on mobile, order-2 on desktop) */}
        <section className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#f0f6ff] border-b border-blue-100/70 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  Question {totalQuestionsCount > 0 ? currentQuestionIndex + 1 : 0}
                </span>
                <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1.5">
                  of {totalQuestionsCount}
                </span>
              </div>

              {/* Mode Badge in Header */}
              {currentMode === 'practice' ? (
                <span className="text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Practice Mode
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Exam Mode
                </span>
              )}
            </div>

            {/* Time & Mini Progress */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              {currentMode === 'exam' ? (
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#2563eb"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 leading-none">Time Remaining</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight font-mono mt-0.5">
                      {formatTime(secondsRemaining)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-emerald-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>Untimed Study</span>
                </div>
              )}

              {/* Header Mini Progress Bar */}
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <div className="w-14 sm:w-16 h-2 bg-blue-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(progressPercent, totalQuestionsCount > 0 ? 2 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Question Text & Options Body */}
          <div className="p-4 sm:p-8 flex-1 flex flex-col">
            {activeQuestion ? (
              <>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-5 sm:mb-8">
                  {activeQuestion.question}
                </h1>

                {/* Options List */}
                <div className="space-y-3 flex-0.5">
                  {(activeQuestion.options || []).map((optionText, optIdx) => {
                    const isSelected = currentSelectedOption === optIdx
                    const isCorrectAnswer = optIdx === activeQuestion.correctIndex

                    let containerStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    let radioCircle = 'border-slate-400'
                    let radioDot = null
                    let badgeLabel = null

                    if (currentMode === 'practice') {
                      // PRACTICE MODE: Instant coloring & feedback
                      if (isQuestionAnswered) {
                        if (isCorrectAnswer) {
                          // Correct option is always green
                          containerStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-500/40'
                          radioCircle = 'border-emerald-600 bg-emerald-600 text-white'
                          radioDot = (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                          )
                          badgeLabel = (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ✓ Correct Answer
                            </span>
                          )
                        } else if (isSelected && !isCorrectAnswer) {
                          // Selected wrong option is red
                          containerStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium ring-1 ring-rose-400/40'
                          radioCircle = 'border-rose-500 bg-rose-500 text-white'
                          radioDot = (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                            </svg>
                          )
                          badgeLabel = (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ✕ Your Pick
                            </span>
                          )
                        } else {
                          containerStyle = 'border-slate-200 opacity-60'
                        }
                      }
                    } else {
                      // EXAM MODE: Standard selection without feedback
                      if (isSelected) {
                        containerStyle = 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 font-medium text-slate-900'
                        radioCircle = 'border-blue-600'
                        radioDot = <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`rounded-xl border p-3.5 sm:p-4.5 flex items-center justify-between cursor-pointer transition-all duration-150 select-none ${containerStyle}`}
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5">
                          {/* Radio Indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${radioCircle}`}
                          >
                            {radioDot}
                          </div>

                          {/* Option Text */}
                          <span className="text-xs sm:text-sm leading-relaxed">
                            {optionText}
                          </span>
                        </div>

                        {/* Optional Status Badge */}
                        {badgeLabel}
                      </div>
                    )
                  })}
                </div>

                {/* PRACTICE MODE INSTANT EXPLANATION BOX */}
                {currentMode === 'practice' && isQuestionAnswered && (
                  <div
                    className={`mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl border animate-in fade-in duration-200 ${
                      isCurrentAnswerCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCurrentAnswerCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          ✓ Correct Answer!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-700 uppercase tracking-wider bg-rose-100 px-2.5 py-0.5 rounded-full">
                          ✕ Incorrect Choice
                        </span>
                      )}
                    </div>

                    <div className="text-xs leading-relaxed mt-2 pt-2 border-t border-slate-200/60">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
                          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                        </svg>
                        Explanation:
                      </p>
                      <p className="text-slate-700">
                        {activeQuestion.explanation || 'Refer to the aircraft flight manual and standard operating procedures for complete references.'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12">
                <p className="text-slate-500 text-sm font-medium">
                  No questions available in this exam.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Please add questions array into your JSON file in <code className="bg-slate-100 px-1 py-0.5 rounded">src/exams/</code>.
                </p>
              </div>
            )}

            {/* Footer Navigation Bar */}
            <div className="pt-5 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500 text-blue-600 text-xs font-semibold transition-all ${
                  currentQuestionIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-300 text-slate-400'
                    : 'hover:bg-blue-50 active:scale-95 cursor-pointer'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Previous
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
                {/* Mark for Review Checkbox */}
                <label className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={isMarked}
                    onChange={handleToggleMarkReview}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  Mark for Review
                </label>

                {/* Next / Finish Button */}
                <button
                  onClick={handleNext}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer ${
                    currentMode === 'practice'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentQuestionIndex < totalQuestionsCount - 1 ? 'Next Question' : 'Complete & Review'}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Exam Information, Progress, Quick Actions */}
        <aside className="order-3 lg:order-3 lg:col-span-3 flex flex-col gap-4">
          
          {/* Card 1: Exam Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>Exam Information</span>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 space-y-3 border border-slate-100 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Exam Name</p>
                <p className="font-semibold text-slate-800 mt-0.5 whitespace-pre-line">{examData.title.replace('\n', ' ')}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Module</p>
                <p className="font-semibold text-blue-600 mt-0.5">{examData.module}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Active Mode</p>
                <p className={`font-semibold mt-0.5 ${currentMode === 'practice' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {currentMode === 'practice' ? 'Practice (Instant Feedback)' : 'Exam (Timed)'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Total Questions</p>
                <p className="font-semibold text-slate-800 mt-0.5">{totalQuestionsCount}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Progress Ring & Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Progress</h3>

            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={circleRadius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="7"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={circleRadius}
                    fill="transparent"
                    stroke={currentMode === 'practice' ? '#10b981' : '#3b82f6'}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-slate-900">
                  {progressPercent}%
                </span>
              </div>

              {/* Stats */}
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {answeredCount} / {totalQuestionsCount}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Questions Completed
                </p>
                {currentMode === 'practice' && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {scoreSummary.correct} Correct so far
                  </p>
                )}
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentMode === 'practice' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.max(progressPercent, 1)}%` }}
              />
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h3>

            <div className="space-y-1">
              {/* Mode switch option */}
              <button
                onClick={() => setCurrentMode(currentMode === 'exam' ? 'practice' : 'exam')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors text-left cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 text-purple-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <span>Switch to {currentMode === 'exam' ? 'Practice Mode' : 'Exam Mode'}</span>
              </button>

              <button
                onClick={handleReviewMarked}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors text-left cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  className="w-4 h-4 text-blue-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                <span>Review Marked ({markedForReview.size})</span>
              </button>

              <button
                onClick={() => setShowEndModal(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 text-xs font-semibold text-slate-700 hover:text-red-600 transition-colors text-left cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.75}
                  stroke="currentColor"
                  className="w-4 h-4 text-slate-500"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                <span>End {currentMode === 'practice' ? 'Practice' : 'Exam'}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Info Note */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="#2563eb"
              className="w-5 h-5 flex-shrink-0 mt-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-blue-900 leading-snug">
                {currentMode === 'practice' ? 'Practice & Learn' : 'Take your time.'}
              </p>
              <p className="text-[11px] text-blue-700/80 leading-relaxed mt-0.5">
                {currentMode === 'practice'
                  ? 'Click any option to see the correct answer and technical explanation instantly.'
                  : 'Read each question carefully. Your answers will be submitted at the end.'}
              </p>
            </div>
          </div>

        </aside>
      </main>

      {/* End Session Confirmation / Score Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-100 animate-in fade-in duration-200 max-h-[92vh] overflow-y-auto">
            {!examSubmitted ? (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-center text-slate-900 mb-1">
                  Ready to Complete {currentMode === 'practice' ? 'Practice' : 'Exam'}?
                </h3>
                <p className="text-xs text-center text-slate-500 mb-5">
                  You have completed {answeredCount} of {totalQuestionsCount} questions.
                  {markedForReview.size > 0 && ` ${markedForReview.size} questions are marked for review.`}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 mb-5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Answered Questions:</span>
                    <span className="font-bold text-emerald-600">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Unanswered Questions:</span>
                    <span className="font-bold text-slate-500">{totalQuestionsCount - answeredCount}</span>
                  </div>
                  {currentMode === 'practice' && (
                    <div className="flex justify-between text-slate-600">
                      <span>Correctly Answered:</span>
                      <span className="font-bold text-emerald-600">{scoreSummary.correct}</span>
                    </div>
                  )}
                  {currentMode === 'exam' && (
                    <div className="flex justify-between text-slate-600">
                      <span>Time Remaining:</span>
                      <span className="font-bold text-slate-800">{formatTime(secondsRemaining)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowEndModal(false)}
                    className="w-full sm:flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setExamSubmitted(true)
                      if (onShowResults) {
                        onShowResults({
                          examId,
                          userAnswers,
                          timeSpent: currentMode === 'exam'
                            ? formatTime(((examData.durationMinutes || 150) * 60) - secondsRemaining)
                            : 'Self-paced',
                        })
                      }
                    }}
                    className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Submit & View Results
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-center text-slate-900 mb-1">
                  Session Completed!
                </h3>
                <p className="text-xs text-center text-slate-500 mb-5">
                  Great job completing {examData.title.replace('\n', ' ')}.
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Score on Questions</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 my-1">
                    {scoreSummary.correct} / {totalQuestionsCount}
                  </p>
                  <p className="text-xs text-blue-500 font-medium">
                    {totalQuestionsCount > 0
                      ? `${Math.round((scoreSummary.correct / totalQuestionsCount) * 100)}% Accuracy`
                      : 'No questions in exam'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (onShowResults) {
                        onShowResults({
                          examId,
                          userAnswers,
                          timeSpent: currentMode === 'exam'
                            ? formatTime(((examData.durationMinutes || 150) * 60) - secondsRemaining)
                            : 'Self-paced',
                        })
                      }
                    }}
                    className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                  >
                    View Detailed Results →
                  </button>
                  <button
                    onClick={onBackToDashboard}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
