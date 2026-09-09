import React, { useState } from 'react'
import { getExamById } from '../utils/examLoader'

export default function ExamResult({
  examId = 'aircraft-powerplant',
  userAnswers = {},
  timeSpent = '2:28:15',
  onBackToDashboard,
  onRetakeExam,
}) {
  const examData = getExamById(examId)
  const questions = examData.questions || []
  const totalQuestionsCount = questions.length

  // Active tab: 'overview' | 'missed' | 'all'
  const [activeTab, setActiveTab] = useState('missed')
  
  // Expanded questions set (default first missed question expanded)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set([1]))
  
  // Currently highlighted question in navigation grid
  const [activeNavQuestion, setActiveNavQuestion] = useState(1)

  // Question status map calculated strictly from real questions
  const questionStatusMap = React.useMemo(() => {
    const map = {}
    questions.forEach((qObj, idx) => {
      const qNum = idx + 1
      if (userAnswers[idx] !== undefined) {
        map[qNum] = userAnswers[idx] === qObj.correctIndex ? 'correct' : 'missed'
      } else {
        // Sample preview state if opened without answers
        map[qNum] = (idx === 3 || idx === 6) ? 'missed' : 'correct'
      }
    })
    return map
  }, [userAnswers, questions])

  const correctCount = Object.values(questionStatusMap).filter((s) => s === 'correct').length
  const missedCount = Object.values(questionStatusMap).filter((s) => s === 'missed').length
  const scorePercent = totalQuestionsCount > 0 ? Math.round((correctCount / totalQuestionsCount) * 100) : 0

  // Toggle question accordion
  const toggleAccordion = (qNum) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(qNum)) {
        next.delete(qNum)
      } else {
        next.add(qNum)
      }
      return next
    })
  }

  // Handle clicking question number in grid
  const handleSelectNavQuestion = (num) => {
    setActiveNavQuestion(num)
    setExpandedQuestions((prev) => new Set(prev).add(num))
    if (questionStatusMap[num] === 'missed' && activeTab === 'overview') {
      setActiveTab('missed')
    }
    const elem = document.getElementById(`question-card-${num}`)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Generate question details for display
  const getQuestionDetails = (num) => {
    const qIdx = num - 1
    const baseQ = questions[qIdx]
    if (!baseQ) return null

    return {
      id: num,
      question: baseQ.question,
      options: baseQ.options || [],
      userSelected:
        userAnswers[qIdx] !== undefined
          ? userAnswers[qIdx]
          : questionStatusMap[num] === 'correct'
          ? (baseQ.correctIndex !== undefined ? baseQ.correctIndex : 0)
          : (baseQ.correctIndex !== undefined ? (baseQ.correctIndex + 1) % baseQ.options.length : 1),
      correctIndex: baseQ.correctIndex !== undefined ? baseQ.correctIndex : 0,
      explanation: baseQ.explanation || 'Refer to the aviation study manual for details.',
    }
  }

  // Filter questions according to active tab
  const displayQuestionsList = React.useMemo(() => {
    const list = []
    for (let i = 1; i <= totalQuestionsCount; i++) {
      const status = questionStatusMap[i]
      if (activeTab === 'missed' && status === 'missed') {
        const item = getQuestionDetails(i)
        if (item) list.push(item)
      } else if (activeTab === 'all') {
        const item = getQuestionDetails(i)
        if (item) list.push(item)
      }
    }
    return list
  }, [activeTab, questionStatusMap, totalQuestionsCount, questions, userAnswers])

  // Circular gauge score calculation (radius 40)
  const circleRadius = 40
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* Clean Navbar - Logo Only (No profile, No notification as requested) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
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
          <span className="text-xl font-bold text-slate-900 tracking-tight">ExamPrep</span>
        </div>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to My Exams
        </button>
      </header>

      {/* Main Result Body (2-Column Layout, NO Left Sidebar) */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT / MAIN COLUMN (Results, Metrics, Missed Questions) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Top Breadcrumb Link & Page Heading */}
          <div>
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to My Exams
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Exam Result
            </h1>
          </div>

          {/* Exam Header Banner Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl ${examData.iconBg || 'bg-purple-600'} text-white flex items-center justify-center flex-shrink-0 shadow-xs`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path
                    fillRule="evenodd"
                    d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight">
                  {examData.title.replace('\n', ' ')}
                </h2>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                  <span className="text-blue-600 font-semibold">Module: {examData.module}</span>
                  <span className="text-slate-300">|</span>
                  <span>Total Questions: {totalQuestionsCount}</span>
                  <span className="text-slate-300">|</span>
                  <span>Time: {examData.durationMinutes || 150} minutes</span>
                </div>
              </div>
            </div>

            {/* Completed on Date */}
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <p className="text-[11px] font-semibold text-blue-600">Completed On</p>
              <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span>Sep 5, 2026 · 02:28 PM</span>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Card 1: Score with Circular Gauge */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    fill="transparent"
                    stroke="#0d9488"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-bold text-teal-800">
                  {scorePercent}%
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 leading-tight">{scorePercent}%</p>
                <p className="text-xs text-slate-400 font-medium">Score</p>
              </div>
            </div>

            {/* Card 2: Correct Answers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{correctCount}</p>
                <p className="text-xs text-slate-400 font-medium">Correct Answers</p>
              </div>
            </div>

            {/* Card 3: Incorrect Answers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{missedCount}</p>
                <p className="text-xs text-slate-400 font-medium">Incorrect Answers</p>
              </div>
            </div>

            {/* Card 4: Time Spent */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 font-mono leading-tight">{timeSpent}</p>
                <p className="text-xs text-slate-400 font-medium">Time Spent</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Overview, Missed Questions, All Questions) */}
          <div className="flex items-center gap-2 border-b border-slate-200 mt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              Overview
            </button>

            <button
              onClick={() => setActiveTab('missed')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'missed'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
              </svg>
              <span>Missed Questions</span>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {missedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              All Questions ({totalQuestionsCount})
            </button>
          </div>

          {/* Tab Content Header */}
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeTab === 'missed' ? 'Missed Questions' : activeTab === 'all' ? 'All Questions' : 'Performance Overview'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'missed'
                ? 'Here are the questions you answered incorrectly. Review them to improve your understanding.'
                : activeTab === 'all'
                ? `Review your performance on all ${totalQuestionsCount} questions.`
                : 'Summary analysis of your score across key aviation modules.'}
            </p>
          </div>

          {/* Overview View */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Pass Status</p>
                  <p className="text-xl font-bold text-emerald-800 mt-1">
                    {scorePercent >= 75 ? 'PASSED (≥75%)' : 'NEEDS PRACTICE (<75%)'}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    Score: {scorePercent}% ({correctCount} / {totalQuestionsCount} correct)
                  </p>
                </div>
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Accuracy</p>
                  <p className="text-xl font-bold text-blue-800 mt-1">{scorePercent}%</p>
                  <p className="text-[11px] text-blue-600 mt-1">Based on {totalQuestionsCount} total questions.</p>
                </div>
                <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                  <p className="text-xs text-purple-700 font-semibold uppercase tracking-wider">Total Questions</p>
                  <p className="text-xl font-bold text-purple-800 mt-1">{totalQuestionsCount} Qs</p>
                  <p className="text-[11px] text-purple-600 mt-1">Time spent: {timeSpent}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('missed')}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Review Missed Questions ({missedCount}) →
                </button>
              </div>
            </div>
          )}

          {/* Questions Accordion List (for Missed or All tabs) */}
          {(activeTab === 'missed' || activeTab === 'all') && (
            <div className="space-y-4">
              {displayQuestionsList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {activeTab === 'missed' ? '🎉 Fantastic! You got all questions correct!' : 'No questions found in this exam.'}
                  </p>
                </div>
              ) : (
                displayQuestionsList.map((qItem) => {
                  const isExpanded = expandedQuestions.has(qItem.id)
                  const isMissed = questionStatusMap[qItem.id] === 'missed'

                  return (
                    <div
                      key={qItem.id}
                      id={`question-card-${qItem.id}`}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Top Header */}
                      <div
                        onClick={() => toggleAccordion(qItem.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3">
                          {isMissed ? (
                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className="font-bold text-slate-900 text-sm">
                            Question {qItem.id} of {totalQuestionsCount}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              isMissed
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            {isMissed ? 'Incorrect' : 'Correct'}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Question Title & Options (shown when expanded) */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                          <p className="font-bold text-slate-900 text-sm mb-4 leading-snug">
                            {qItem.question}
                          </p>

                          {/* Options List */}
                          <div className="space-y-2.5">
                            {qItem.options.map((optText, oIdx) => {
                              const isUserPick = qItem.userSelected === oIdx
                              const isCorrectAnswer = qItem.correctIndex === oIdx

                              let containerStyle = 'border-slate-200 bg-white'
                              let radioStyle = 'border-slate-300'

                              if (isUserPick && isMissed) {
                                containerStyle = 'border-rose-200 bg-rose-50/50'
                                radioStyle = 'border-rose-500 bg-rose-500 text-white'
                              } else if (isCorrectAnswer && !isMissed) {
                                containerStyle = 'border-emerald-200 bg-emerald-50/40'
                                radioStyle = 'border-emerald-500 bg-emerald-500 text-white'
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`rounded-xl border p-3.5 flex items-center justify-between text-xs transition-colors ${containerStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${radioStyle}`}
                                    >
                                      {isUserPick && isMissed && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                      {isCorrectAnswer && !isMissed && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span
                                      className={`leading-relaxed ${
                                        isUserPick
                                          ? 'font-bold text-slate-900'
                                          : 'font-normal text-slate-700'
                                      }`}
                                    >
                                      {optText}
                                    </span>
                                  </div>

                                  {isUserPick && isMissed && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Comparison Breakdown Box */}
                          <div className="mt-4 bg-rose-50/30 border border-rose-100 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-[11px] font-semibold text-slate-500 mb-1">Your Answer</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200">
                                  {qItem.options[qItem.userSelected] || 'None'}
                                </span>
                              </div>

                              <div>
                                <p className="text-[11px] font-semibold text-slate-500 mb-1">Correct Answer</p>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-600">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                  </svg>
                                  {qItem.options[qItem.correctIndex]}
                                </span>
                              </div>
                            </div>

                            {/* Explanation */}
                            <div className="pt-2 border-t border-rose-100 flex items-start gap-2 text-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div>
                                <p className="font-bold text-slate-800">Explanation</p>
                                <p className="text-slate-600 leading-relaxed mt-0.5">
                                  {qItem.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Question Navigation Grid & Study Tip) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Question Navigation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Question Navigation ({totalQuestionsCount})
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pb-3.5 border-b border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600 flex-shrink-0"></span>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-400 flex-shrink-0"></span>
                <span>Missed</span>
              </div>
            </div>

            {/* Questions Grid matching exact count */}
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 my-4">
              {Array.from({ length: totalQuestionsCount }, (_, i) => i + 1).map((num) => {
                const status = questionStatusMap[num]
                const isActive = activeNavQuestion === num

                let cellStyle = 'bg-slate-200 text-slate-600'
                if (status === 'correct') {
                  cellStyle = 'bg-emerald-600 text-white font-semibold'
                } else if (status === 'missed') {
                  cellStyle = 'bg-rose-400 text-white font-semibold'
                }

                if (isActive) {
                  cellStyle = 'border-2 border-blue-600 text-blue-600 font-bold bg-white shadow-xs'
                }

                return (
                  <button
                    key={num}
                    onClick={() => handleSelectNavQuestion(num)}
                    title={`Question ${num} (${status})`}
                    className={`h-8 rounded-sm text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 ${cellStyle}`}
                  >
                    {num}
                  </button>
                )
              })}
            </div>

            {/* Back to Results / Dashboard Button */}
            <button
              onClick={onBackToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow cursor-pointer mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Study Tip Card */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs leading-snug">Study Tip</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                Focus on the topics you missed. Practice similar questions to improve your score in the next attempt.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
