import React, { useState } from 'react'
import Navbar from './components/Navbar'
import HeroBanner from './components/HeroBanner'
import AvailableExams from './components/AvailableExams'
import GoalBanner from './components/GoalBanner'
import ExamForum from './components/ExamForum'
import ExamResult from './components/ExamResult'
import ModeSelectModal from './components/ModeSelectModal'
import { getAllExams, getExamById } from './utils/examLoader'

export default function App() {
  const allExams = getAllExams()
  const defaultExamId = allExams[0]?.id || 'aircraft-instruments'

  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' | 'exam' | 'result'
  const [selectedExamId, setSelectedExamId] = useState(defaultExamId)
  const [selectedExamMode, setSelectedExamMode] = useState('exam') // 'exam' | 'practice'
  const [showModeModal, setShowModeModal] = useState(false)
  const [pendingExam, setPendingExam] = useState(null)

  const [resultSession, setResultSession] = useState({
    examId: 'aircraft-powerplant',
    userAnswers: {},
    timeSpent: '2:28:15',
  })

  // Open mode selection menu modal
  const handleOpenModeMenu = (examId) => {
    const target = getExamById(examId || defaultExamId)
    setPendingExam(target)
    setShowModeModal(true)
  }

  // User confirmed their mode selection
  const handleConfirmStartExam = (mode = 'exam') => {
    setSelectedExamMode(mode)
    setSelectedExamId(pendingExam?.id || defaultExamId)
    setShowModeModal(false)
    setCurrentView('exam')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShowResults = (data) => {
    setResultSession({
      examId: data?.examId || selectedExamId,
      userAnswers: data?.userAnswers || {},
      timeSpent: data?.timeSpent || '2:28:15',
    })
    setCurrentView('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (currentView === 'exam') {
    return (
      <ExamForum
        examId={selectedExamId}
        mode={selectedExamMode}
        onBackToDashboard={handleBackToDashboard}
        onShowResults={handleShowResults}
      />
    )
  }

  if (currentView === 'result') {
    return (
      <ExamResult
        examId={resultSession.examId}
        userAnswers={resultSession.userAnswers}
        timeSpent={resultSession.timeSpent}
        onBackToDashboard={handleBackToDashboard}
        onRetakeExam={() => handleOpenModeMenu(resultSession.examId)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        

        <HeroBanner onStartLearning={() => handleOpenModeMenu(defaultExamId)} />
        <AvailableExams onStartExam={handleOpenModeMenu} />
        <GoalBanner />
      </main>

      {/* Mode Selection Menu Modal */}
      <ModeSelectModal
        exam={pendingExam}
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        onSelectMode={handleConfirmStartExam}
      />
    </div>
  )
}
