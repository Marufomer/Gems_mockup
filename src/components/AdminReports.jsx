import React, { useState, useEffect, useMemo } from 'react'
import { fetchAdminReports, updateReportStatus, REPORT_REASONS } from '../utils/reportService'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  reviewed: {
    label: 'Reviewed',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
}

export default function AdminReports({ onBackToDashboard }) {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('gems_admin_pass') || 'admin123')
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('gems_admin_auth')))
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState(null)

  // Filters
  const [selectedExamFilter, setSelectedExamFilter] = useState('all')
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Updating single report state
  const [updatingId, setUpdatingId] = useState(null)

  const loadReports = React.useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const data = await fetchAdminReports(adminPassword)
      setReports(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load reports:', err)
      setErrorMessage(err.message || 'Could not load reports from server.')
    } finally {
      setIsLoading(false)
    }
  }, [adminPassword])

  // Fetch reports on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadReports()
    }
  }, [isAuthenticated, loadReports])

  // Handle Admin Login
  const handleLogin = (e) => {
    e?.preventDefault()
    if (!passwordInput) return
    setAuthError(null)

    // Verify against Netlify function manage-reports
    setIsLoading(true)
    fetchAdminReports(passwordInput)
      .then((data) => {
        setAdminPassword(passwordInput)
        setIsAuthenticated(true)
        localStorage.setItem('gems_admin_auth', 'true')
        localStorage.setItem('gems_admin_pass', passwordInput)
        setReports(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setAuthError(err.message || 'Invalid admin credentials.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('gems_admin_auth')
    localStorage.removeItem('gems_admin_pass')
    setPasswordInput('')
  }

  // Change report status
  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await updateReportStatus(reportId, newStatus, adminPassword)
      setReports((prev) =>
        prev.map((rep) =>
          rep.id === reportId
            ? { ...rep, status: newStatus.toLowerCase(), statusLabel: newStatus, updatedAt: new Date().toISOString() }
            : rep
        )
      )
      setSuccessMessage(`Report ${reportId} marked as ${newStatus}.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to update status:', err)
      setErrorMessage(err.message || 'Failed to update report status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Export Reports JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(reports, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'question-reports.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Could not export JSON: ${err.message}`)
    }
  }

  // Distinct Exams in reports
  const distinctExams = useMemo(() => {
    const set = new Set()
    reports.forEach((r) => {
      if (r.examTitle) set.add(r.examTitle)
    })
    return Array.from(set)
  }, [reports])

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      // Filter by Exam
      if (selectedExamFilter !== 'all' && rep.examTitle !== selectedExamFilter) {
        return false
      }
      // Filter by Reason
      if (selectedReasonFilter !== 'all' && rep.reason !== selectedReasonFilter) {
        return false
      }
      // Filter by Status
      if (selectedStatusFilter !== 'all') {
        const currentSt = String(rep.status || 'pending').toLowerCase()
        if (currentSt !== selectedStatusFilter.toLowerCase()) {
          return false
        }
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const textToSearch = `${rep.id} ${rep.examTitle} ${rep.question} ${rep.reason} ${rep.message || ''}`.toLowerCase()
        if (!textToSearch.includes(q)) return false
      }
      return true
    })
  }, [reports, selectedExamFilter, selectedReasonFilter, selectedStatusFilter, searchQuery])

  // Metric counts
  const stats = useMemo(() => {
    let pending = 0
    let reviewed = 0
    let resolved = 0
    let rejected = 0
    reports.forEach((r) => {
      const st = String(r.status || 'pending').toLowerCase()
      if (st === 'pending') pending++
      else if (st === 'reviewed') reviewed++
      else if (st === 'resolved') resolved++
      else if (st === 'rejected') rejected++
    })
    return { total: reports.length, pending, reviewed, resolved, rejected }
  }, [reports])

  // 1. Password prompt if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Admin Authorization</h2>
              <p className="text-xs text-slate-500">Enter administrator password to access reports</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-rose-600 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Configured via Netlify environment variable <code className="font-mono text-slate-600">ADMIN_PASSWORD</code>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // 2. Authenticated Admin View
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-16">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="Return to Student Website"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  Question Reports Dashboard
                </h1>
                <span className="text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review, filter, and resolve questions reported by students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Refresh button */}
            <button
              onClick={loadReports}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Reload from GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Refresh</span>
            </button>

            {/* Export Reports JSON Button */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Export Reports JSON</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Success or Error feedback banners */}
        {successMessage && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-in fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-600 shrink-0">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-in fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-rose-600 shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
          <div
            onClick={() => setSelectedStatusFilter('all')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusFilter === 'all'
                ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('pending')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusFilter === 'pending'
                ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Pending</p>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('reviewed')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusFilter === 'reviewed'
                ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Reviewed</p>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <p className="text-2xl font-black text-blue-900 mt-1">{stats.reviewed}</p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('resolved')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusFilter === 'resolved'
                ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Resolved</p>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-1">{stats.resolved}</p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('rejected')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedStatusFilter === 'rejected'
                ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Rejected</p>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Filter by Exam */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Filter by Exam
              </label>
              <select
                value={selectedExamFilter}
                onChange={(e) => setSelectedExamFilter(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Exams ({reports.length})</option>
                {distinctExams.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Filter by Reason
              </label>
              <select
                value={selectedReasonFilter}
                onChange={(e) => setSelectedReasonFilter(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Reasons</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="lg:w-72">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search question, reason, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs font-semibold text-slate-600">Loading reports from GitHub repository...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">No Question Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {reports.length === 0
                ? 'No students have reported any questions yet. Reports submitted during exams will appear here automatically.'
                : 'No reports match your current filter criteria. Try resetting your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> reports</span>
            </div>

            {filteredReports.map((report) => {
              const currentStatusKey = String(report.status || 'pending').toLowerCase()
              const statusCfg = STATUS_CONFIG[currentStatusKey] || STATUS_CONFIG.pending
              const formattedDate = report.reportedAt
                ? new Date(report.reportedAt).toLocaleString()
                : 'Recently'

              const isUpdating = updatingId === report.id

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          ID: {report.id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {report.examTitle}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-bold text-blue-600">
                          Question #{report.questionNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Reported on: <span className="font-medium text-slate-600">{formattedDate}</span>
                      </p>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        {statusCfg.label}
                      </span>

                      <div className="relative">
                        <select
                          value={statusCfg.label}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Pending">Set: Pending</option>
                          <option value="Reviewed">Set: Reviewed</option>
                          <option value="Resolved">Set: Resolved</option>
                          <option value="Rejected">Set: Rejected</option>
                        </select>
                        {isUpdating && (
                          <span className="absolute right-1 top-1.5 w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Question
                      </p>
                      <p className="text-slate-800 font-semibold leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {report.question}
                      </p>
                    </div>

                    {/* Reason & Student Message */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Report Reason
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                          ⚠️ {report.reason}
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Student Additional Message
                        </p>
                        <p className="text-slate-700 bg-amber-50/40 border border-amber-100 p-2.5 rounded-xl text-xs leading-relaxed italic">
                          {report.message ? `"${report.message}"` : <span className="text-slate-400 not-italic">No additional message provided.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
