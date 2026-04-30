import React, { createContext, useContext, useState, useEffect } from 'react'
import { checkAuth } from '../../api/Auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    useEffect(() => {
        checkAuth()
            .then(data => setCurrentUser(data.user))
            .catch(() => setCurrentUser(null))
            .finally(() => setAuthLoading(false))
    }, [])

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, authLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)