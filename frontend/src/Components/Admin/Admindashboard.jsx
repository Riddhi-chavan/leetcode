import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRoleRequests, reviewRoleRequest } from '../../../api/roleRequests'
import RequestsTab from './RequestsTab'
import { getMyProblems } from '../../../api/Problems'

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchProblems = async () => {
  return await getMyProblems()
}

const deleteProblem = async (id) => {
  const res = await fetch(`/api/problems/${id}`, { method: 'DELETE', credentials: 'include' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to delete')
  return data
}

// ── Reusable pieces ───────────────────────────────────────────────────────────
const diffStyle = {
  EASY:   'bg-[#00b8a3]/10 text-[#00b8a3]',
  MEDIUM: 'bg-[#ffc01e]/10 text-[#ffc01e]',
  HARD:   'bg-[#ff375f]/10 text-[#ff375f]',
}

const toTitle = s => s.charAt(0) + s.slice(1).toLowerCase()

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] px-5 py-4 flex flex-col gap-1">
    <span className="text-[11px] text-[#6b6b6b] uppercase tracking-wider">{label}</span>
    <span className="text-[28px] font-bold leading-none" style={{ color: color ?? '#e8e8e8' }}>{value}</span>
    {sub && <span className="text-[11px] text-[#4b4b4b]">{sub}</span>}
  </div>
)

// ── Confirm delete dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ title, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[360px] mx-4 p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#ff375f]/10 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium text-[#e8e8e8]">Delete problem?</p>
          <p className="text-[12px] text-[#6b6b6b] mt-1">
            "{title}" will be permanently deleted. All related submissions will also be removed.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 bg-[#ff375f] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#ff375f]/80 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)

// ── Problems tab ──────────────────────────────────────────────────────────────
const ProblemsTab = ({ navigate }) => {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, title }
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProblems()
      .then(setProblems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProblem(deleteTarget.id)
      setProblems(p => p.filter(pr => pr.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const easy   = problems.filter(p => p.difficulty === 'EASY').length
  const medium = problems.filter(p => p.difficulty === 'MEDIUM').length
  const hard   = problems.filter(p => p.difficulty === 'HARD').length

  return (
    <div className="flex flex-col gap-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Problems" value={problems.length} sub="in database" />
        <StatCard label="Easy" value={easy} color="#00b8a3" />
        <StatCard label="Medium" value={medium} color="#ffc01e" />
        <StatCard label="Hard" value={hard} color="#ff375f" />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center gap-3">
          <span className="text-[13px] font-medium text-[#e8e8e8] flex-1">All Problems</span>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-[180px] h-[30px] bg-[#111] border border-[#2a2a2a] rounded-[6px] pl-7 pr-3 text-[12px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116]/40 transition-colors"
            />
          </div>
          <button
            onClick={() => navigate('/admin/create-problem')}
            className="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116] text-[12px] font-medium hover:bg-[#ffa116]/20 transition-all"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New problem
          </button>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[32px_1fr_90px_80px_90px_80px] gap-0 px-5 py-2 border-b border-[#1e1e1e]">
          {['#', 'Title', 'Difficulty', 'Tags', 'Created', 'Actions'].map(h => (
            <span key={h} className="text-[10px] uppercase tracking-wider text-[#4b4b4b] font-medium">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-5 h-5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] text-[#6b6b6b]">Loading problems...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-[13px] text-[#6b6b6b]">{search ? 'No matches' : 'No problems yet'}</span>
            {!search && (
              <button
                onClick={() => navigate('/admin/create-problem')}
                className="text-[12px] text-[#ffa116] hover:underline"
              >
                Create the first one
              </button>
            )}
          </div>
        ) : (
          filtered.map((p, idx) => (
            <div
              key={p.id}
              className={`grid grid-cols-[32px_1fr_90px_80px_90px_80px] gap-0 px-5 py-3 border-b border-[#1a1a1a] last:border-b-0 transition-colors hover:bg-[#1e1e1e] ${
                idx % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111111]'
              }`}
            >
              <span className="text-[11px] text-[#4b4b4b] flex items-center">{idx + 1}</span>

              <div className="flex items-center min-w-0">
                <span
                  onClick={() => navigate(`/admin/edit-problem/${p.id}`)}
                  className="text-[13px] text-[#e8e8e8] truncate hover:text-[#ffa116] cursor-pointer transition-colors"
                >
                  {p.title}
                </span>
              </div>

              <div className="flex items-center">
                <span className={`text-[11px] px-2 py-[2px] rounded-[4px] ${diffStyle[p.difficulty]}`}>
                  {toTitle(p.difficulty)}
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-hidden">
                {p.tags.slice(0, 1).map(t => (
                  <span key={t} className="text-[10px] px-[5px] py-[1px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] truncate">
                    {t}
                  </span>
                ))}
                {p.tags.length > 1 && (
                  <span className="text-[10px] text-[#4b4b4b]">+{p.tags.length - 1}</span>
                )}
              </div>

              <div className="flex items-center">
                <span className="text-[11px] text-[#4b4b4b]">{timeAgo(p.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/admin/edit-problem/${p.id}`)}
                  className="text-[#6b6b6b] hover:text-[#ffa116] transition-colors"
                  title="Edit"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                  className="text-[#6b6b6b] hover:text-[#ff375f] transition-colors"
                  title="Delete"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── Requests tab ──────────────────────────────────────────────────────────────
<RequestsTab/>

// ── Main dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'problems'

  const setTab = (t) => setSearchParams({ tab: t })

  return (
    <div className="min-h-screen bg-[#111111] text-[#e8e8e8]">
      {/* Topbar */}
      <div className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-4">
        <button
          onClick={() => navigate('/problemset')}
          className="flex items-center gap-1.5 text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors text-[13px]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Problems
        </button>
        <span className="text-[#2a2a2a]">/</span>
        <span className="text-[13px] text-[#e8e8e8]">Admin Dashboard</span>

        <div className="ml-auto flex items-center gap-2">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} className="w-[26px] h-[26px] rounded-full object-cover" alt="" />
          ) : (
            <div className="w-[26px] h-[26px] rounded-full bg-[#ffa116] flex items-center justify-center text-black text-[10px] font-bold">
              {(currentUser?.name ?? 'A')[0].toUpperCase()}
            </div>
          )}
          <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/25 font-medium">Admin</span>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-[#e8e8e8]">Admin Dashboard</h1>
          <p className="text-[13px] text-[#6b6b6b] mt-1">
            Manage problems and review problem setter requests.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-[#2a2a2a] mb-6">
          {[
            {
              id: 'problems', label: 'Problems',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            },
            {
              id: 'requests', label: 'Role Requests',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] border-b-2 -mb-px transition-colors ${
                tab === id
                  ? 'text-[#e8e8e8] border-[#ffa116]'
                  : 'text-[#6b6b6b] border-transparent hover:text-[#e8e8e8]'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === 'problems' && <ProblemsTab navigate={navigate} />}
        {tab === 'requests' && <RequestsTab />}
      </div>
    </div>
  )
}

export default AdminDashboard