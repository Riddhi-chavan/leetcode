import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { checkAuth } from '../../api/Auth'

const AuthContext = createContext(null)
const POLL_INTERVAL = 30_000

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser]   = useState(null)
    const [authLoading, setAuthLoading]   = useState(true)
    const [roleChange,  setRoleChange]    = useState(null)
    const pollRef       = useRef(null)
    const currentUserRef = useRef(null)          // ← add this

    // Keep ref in sync with state
    useEffect(() => {
        currentUserRef.current = currentUser     // ← always latest value
    }, [currentUser])

    // Initial auth check
    useEffect(() => {
        checkAuth()
            .then(data => setCurrentUser(data.user))
            .catch(() => setCurrentUser(null))
            .finally(() => setAuthLoading(false))
    }, [])

    // Poll for role changes
    useEffect(() => {
        if (!currentUser) return

        pollRef.current = setInterval(async () => {
            try {
                const data  = await checkAuth()
                const fresh = data.user

                if (!fresh) {
                    setCurrentUser(null)
                    setRoleChange({ type: 'session_expired' })
                    return
                }

                const prev = currentUserRef.current   // ✅ read from ref

                if (prev && fresh.role !== prev.role) {
                    setRoleChange({ from: prev.role, to: fresh.role, type: 'role_changed' })
                    setCurrentUser(fresh)
                }
            } catch {
                // network hiccup — ignore
            }
        }, POLL_INTERVAL)

        return () => clearInterval(pollRef.current)
    }, [currentUser])

    const updateCurrentUser = (fields) => setCurrentUser(u => ({ ...u, ...fields }))
    const dismissRoleChange = () => setRoleChange(null)

    return (
        <AuthContext.Provider value={{
            currentUser,
            setCurrentUser,
            authLoading,
            updateCurrentUser,
            roleChange,
            dismissRoleChange,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)