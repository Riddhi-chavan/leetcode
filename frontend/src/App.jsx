import React from 'react'
import Navbar from './Components/Navbar'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import { Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Routes>
      <Route path="/accounts/login/" element={<Login />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App