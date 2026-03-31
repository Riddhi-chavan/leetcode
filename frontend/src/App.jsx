import React from 'react'
import Navbar from './Components/Navbar'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/Register.jsx'
import ProblemSet from './pages/ProblemSet.jsx'
import ProblemDetail from './pages/ProblemDetail.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/accounts/login/" element={<Login />} />
      <Route path="/accounts/register/" element={<Register />} />
      <Route path="/problemset/" element={<ProblemSet />} />
      <Route path="/problemset/:id" element={<ProblemDetail />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App