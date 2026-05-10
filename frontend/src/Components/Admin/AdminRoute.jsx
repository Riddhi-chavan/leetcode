import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'ADMIN') return <Navigate to="/problemset" replace />

  return children
}

export default AdminRoute