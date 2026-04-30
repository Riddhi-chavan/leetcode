import React, { useState, useEffect, useMemo , useRef} from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProfile, updateProfile } from '../../api/profile'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'

// ─── helpers ─────────────────────────────────────────────────────────────────

const DIFF_COLOR = { EASY: '#00b8a3', MEDIUM: '#ffc01e', HARD: '#ff375f' }
const DIFF_BG    = {
  EASY:   'bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/20',
  MEDIUM: 'bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20',
  HARD:   'bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20',
}
const toTitle = (s) => s.charAt(0) + s.slice(1).toLowerCase()

const LANG_LABEL = {
  javascript: 'JS', python3: 'Py3', python: 'Py',
  cpp: 'C++', java: 'Java', typescript: 'TS', c: 'C', go: 'Go', rust: 'Rs',
}
const ll = (l) => LANG_LABEL[l?.toLowerCase()] ?? l

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

const DAYS   = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildGrid(activityMap) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from 52 weeks ago, aligned to Sunday
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  const dow = start.getDay()
  start.setDate(start.getDate() - dow)   // rewind to Sunday

  const weeks = []
  const cursor = new Date(start)
  while (cursor <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10)
      week.push({ date: key, count: activityMap[key] ?? 0, future: cursor > today })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return { weeks, start }
}

function heatColor(count) {
  if (count === 0) return '#2a2a2a'
  if (count === 1) return '#0e4429'
  if (count <= 3)  return '#006d32'
  if (count <= 6)  return '#26a641'
  return '#39d353'
}

function getMonthLabels(weeks) {
  const labels = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const month = new Date(week[0].date).getMonth()
    if (month !== lastMonth) {
      labels.push({ col: i, label: MONTHS[month] })
      lastMonth = month
    }
  })
  return labels
}

const Heatmap = ({ activityMap }) => {
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)
  const { weeks } = useMemo(() => buildGrid(activityMap), [activityMap])
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])
  const totalSubmissions = useMemo(
    () => Object.values(activityMap).reduce((a, b) => a + b, 0),
    [activityMap]
  )
  const activeDays = useMemo(
    () => Object.values(activityMap).filter(v => v > 0).length,
    [activityMap]
  )

  const totalWeeks = weeks.length
  const gap = 2
  const dayLabelWidth = 28
  const [cellSize, setCellSize] = useState(11)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      const available = width - dayLabelWidth - (totalWeeks - 1) * gap
      setCellSize(Math.max(4, Math.floor(available / totalWeeks)))
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [totalWeeks])

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-[#e8e8e8]">Submission Activity</span>
        <span className="text-[11px] text-[#6b6b6b]">
          {totalSubmissions} submissions · {activeDays} active days
        </span>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1" style={{ marginLeft: dayLabelWidth, gap }}>
          {weeks.map((_, i) => {
            const lbl = monthLabels.find(m => m.col === i)
            return (
              <div key={i} style={{ width: cellSize, flexShrink: 0, fontSize: 9, color: '#6b6b6b' }}>
                {lbl ? lbl.label : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col mr-1" style={{ width: dayLabelWidth, gap }}>
            {DAYS.map((d, i) => (
              <div
                key={i}
                style={{ height: cellSize, fontSize: 9, color: '#6b6b6b' }}
                className="flex items-center justify-end pr-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex" style={{ gap }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap }}>
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 2,
                      flexShrink: 0,
                      background: cell.future ? 'transparent' : heatColor(cell.count),
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => setTooltip({ ...cell, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-1" style={{ marginLeft: dayLabelWidth }}>
        <span className="text-[9px] text-[#6b6b6b] mr-1">Less</span>
        {['#2a2a2a', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span className="text-[9px] text-[#6b6b6b] ml-1">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && !tooltip.future && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded-[5px] bg-[#2a2a2a] border border-[#333] text-[11px] text-[#e8e8e8] shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.count > 0
            ? `${tooltip.count} submission${tooltip.count > 1 ? 's' : ''} on ${tooltip.date}`
            : `No submissions on ${tooltip.date}`}
        </div>
      )}
    </div>
  )
}

// ─── Donut ring ───────────────────────────────────────────────────────────────

const DonutRing = ({ solved, total, color, size = 56, stroke = 5 }) => {
  const r     = (size - stroke) / 2
  const circ  = 2 * Math.PI * r
  const pct   = total > 0 ? solved / total : 0
  const dash  = pct * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  )
}

// ─── Stats ring (big center one) ─────────────────────────────────────────────

const BigRing = ({ stats }) => {
  const { easy, medium, hard, total, grandTotal } = stats.solved
  const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0

  // Build multi-color segments
  const size = 120, stroke = 8
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const easyDash   = grandTotal > 0 ? (easy.solved   / grandTotal) * circ : 0
  const mediumDash = grandTotal > 0 ? (medium.solved / grandTotal) * circ : 0
  const hardDash   = grandTotal > 0 ? (hard.solved   / grandTotal) * circ : 0

  const easyOffset   = 0
  const mediumOffset = -(easyDash)
  const hardOffset   = -(easyDash + mediumDash)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={stroke} />
        {/* Easy */}
        {easyDash > 0 && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#00b8a3" strokeWidth={stroke}
            strokeDasharray={`${easyDash} ${circ}`}
            strokeDashoffset={easyOffset}
            strokeLinecap="butt"
          />
        )}
        {/* Medium */}
        {mediumDash > 0 && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#ffc01e" strokeWidth={stroke}
            strokeDasharray={`${mediumDash} ${circ}`}
            strokeDashoffset={mediumOffset}
            strokeLinecap="butt"
          />
        )}
        {/* Hard */}
        {hardDash > 0 && (
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#ff375f" strokeWidth={stroke}
            strokeDasharray={`${hardDash} ${circ}`}
            strokeDashoffset={hardOffset}
            strokeLinecap="butt"
          />
        )}
      </svg>
      {/* Center text */}
      <div className="flex flex-col items-center z-10">
        <span className="text-[26px] font-bold text-[#e8e8e8] leading-none">{total}</span>
        <span className="text-[10px] text-[#6b6b6b] mt-0.5">/ {grandTotal}</span>
        <span className="text-[10px] text-[#6b6b6b]">solved</span>
      </div>
    </div>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

const EditModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:     user.name     ?? '',
    bio:      user.bio      ?? '',
    github:   user.github   ?? '',
    linkedin: user.linkedin ?? '',
    website:  user.website  ?? '',
    avatar:   user.avatar   ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[440px] mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <span className="text-[14px] font-medium text-[#e8e8e8]">Edit Profile</span>
          <button onClick={onClose} className="text-[#6b6b6b] hover:text-[#e8e8e8] text-lg leading-none">×</button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {[
            { label: 'Display Name', key: 'name', placeholder: 'Your name' },
            { label: 'Avatar URL',   key: 'avatar', placeholder: 'https://...' },
            { label: 'GitHub',       key: 'github', placeholder: 'github.com/username' },
            { label: 'LinkedIn',     key: 'linkedin', placeholder: 'linkedin.com/in/username' },
            { label: 'Website',      key: 'website', placeholder: 'https://yoursite.com' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-[11px] text-[#6b6b6b] uppercase tracking-wider">{label}</label>
              <input
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116] transition-colors"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[#6b6b6b] uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Tell us about yourself..."
              className="bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116] transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-5 pb-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#ffa116] text-black text-[12px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ProfilePage ─────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { userId } = useParams()
  const navigate   = useNavigate()
  const { currentUser , updateCurrentUser } =  useAuth()
  

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [editing, setEditing] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()


  const targetId  = userId ?? currentUser?.id
  const isOwnProfile = currentUser?.id === targetId

  useEffect(() => {
    if (!targetId) return
    setLoading(true)
    getProfile(targetId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [targetId])

  const handleSave = async (form) => {
    const res = await updateProfile(form)
    setData(d => ({ ...d, user: res.user }))
    updateCurrentUser(res.user)
  }

  useEffect(() => {
  if (searchParams.get('edit') === 'true') {
    setEditing(true)
    setSearchParams({}) // clean the URL
  }
}, [searchParams])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
        <span className="text-[13px] text-[#6b6b6b]">Loading profile…</span>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[14px] text-[#ff375f]">Failed to load profile</span>
        <button onClick={() => navigate('/problemset')} className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8]">
          Back to problems
        </button>
      </div>
    </div>
  )

  const { user, stats, activity, recentSolved } = data
  const { easy, medium, hard } = stats.solved

  const initials = (user.name ?? user.email ?? '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#111111] text-[#e8e8e8]">
      {/* ── Navbar ── */}
      <div className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-6">
        <Link to="/problemset" className="text-[#ffa116] font-bold text-[15px]">leetcode</Link>
        <div className="flex gap-4 ml-4">
          {['Explore', 'Problems', 'Discuss', 'Interview'].map(t => (
            <Link
              key={t}
              to={t === 'Problems' ? '/problemset' : '#'}
              className="text-[13px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isOwnProfile && (
            <button
              onClick={() => setEditing(true)}
              className="text-[12px] px-3 py-1.5 rounded-[6px] bg-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333] transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-8 flex gap-6">

        {/* ── Left sidebar ── */}
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-4">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-[80px] h-[80px] rounded-full object-cover border-2 border-[#2a2a2a]" />
            ) : (
              <div className="w-[80px] h-[80px] rounded-full bg-[#2a2a2a] border-2 border-[#333] flex items-center justify-center text-[24px] font-bold text-[#6b6b6b]">
                {initials}
              </div>
            )}
            <div className="flex flex-col items-center gap-0.5 text-center">
              <span className="text-[16px] font-semibold text-[#e8e8e8]">
                {user.name ?? 'Anonymous'}
              </span>
              <span className="text-[12px] text-[#6b6b6b]">{user.email}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-[12px] text-[#6b6b6b] text-center leading-relaxed">{user.bio}</p>
          )}

          {/* Links */}
          <div className="flex flex-col gap-2">
            {user.github && (
              <a href={`https://${user.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                {user.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
              </a>
            )}
            {user.linkedin && (
              <a href={`https://${user.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                Website
              </a>
            )}
          </div>

          {/* Member since */}
          <div className="text-[11px] text-[#4b4b4b] text-center pt-1 border-t border-[#2a2a2a]">
            Member since {formatDate(user.createdAt)}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* ── Stats row ── */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] p-5">
            <div className="flex gap-6 items-center">

              {/* Big donut */}
              <BigRing stats={stats} />

              {/* Difficulty breakdown */}
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { label: 'Easy',   data: easy,   color: '#00b8a3' },
                  { label: 'Medium', data: medium, color: '#ffc01e' },
                  { label: 'Hard',   data: hard,   color: '#ff375f' },
                ].map(({ label, data: d, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-[12px] w-[46px]" style={{ color }}>{label}</span>
                    <div className="flex-1 h-[6px] rounded-full bg-[#2a2a2a] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: d.total > 0 ? `${(d.solved / d.total) * 100}%` : '0%',
                          background: color,
                        }}
                      />
                    </div>
                    <span className="text-[12px] text-[#6b6b6b] w-[52px] text-right">
                      <span className="text-[#e8e8e8] font-medium">{d.solved}</span>/{d.total}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div className="flex flex-col gap-3 border-l border-[#2a2a2a] pl-6">
                {[
                  { label: 'Total Submissions', value: stats.totalSubmissions },
                  { label: 'Acceptance Rate',   value: `${stats.acceptanceRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[20px] font-bold text-[#e8e8e8] leading-none">{value}</span>
                    <span className="text-[11px] text-[#6b6b6b]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Heatmap ── */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] p-5">
            <Heatmap activityMap={activity} />
          </div>

          {/* ── Recent Solved ── */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#e8e8e8]">Recently Solved</span>
              <span className="text-[11px] text-[#6b6b6b]">{stats.solved.total} total</span>
            </div>

            {recentSolved.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#6b6b6b]">
                <span className="text-[13px]">No solved problems yet</span>
              </div>
            ) : (
              <div className="divide-y divide-[#1e1e1e]">
                {recentSolved.map((s) => (
                  <Link
                    key={s.problemId}
                    to={`/problemset/${s.problemId}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[#222] transition-colors"
                  >
                    {/* Checkmark */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b8a3" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    {/* Title */}
                    <span className="flex-1 text-[13px] text-[#e8e8e8] hover:text-[#ffa116] transition-colors truncate">
                      {s.title}
                    </span>

                    {/* Difficulty */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-[4px] ${DIFF_BG[s.difficulty]}`}>
                      {toTitle(s.difficulty)}
                    </span>

                    {/* Lang */}
                    <span className="text-[10px] px-[6px] py-[1px] rounded-[4px] bg-[#2a2a2a] border border-[#333] text-[#6b6b6b]">
                      {ll(s.language)}
                    </span>

                    {/* Time */}
                    <span className="text-[11px] text-[#4b4b4b] w-[52px] text-right flex-shrink-0">
                      {timeAgo(s.solvedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <EditModal
          user={user}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

export default ProfilePage