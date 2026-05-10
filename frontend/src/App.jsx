import React from 'react'
import Navbar from './Components/Navbar'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import { Routes, Route } from 'react-router-dom'  // remove RouterProvider
import Register from './pages/Register.jsx'
import ProblemSet from './pages/ProblemSet.jsx'
import ProblemDetail from './pages/ProblemDetail.jsx'
import ProfilePage from './pages/Profile.jsx'
import AdminRoute from './Components/Admin/AdminRoute.jsx'
import CreateProblem from './Components/Admin/CreateProblem.jsx'
import AdminDashboard from './Components/Admin/Admindashboard.jsx'
import RoleChangeBanner from './Components/Admin/RoleChangeBanner.jsx'

const App = () => {
  return (
    <>
      <RoleChangeBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accounts/login/" element={<Login />} />
        <Route path="/accounts/register/" element={<Register />} />
        <Route path="/problemset/" element={<ProblemSet />} />
        <Route path="/problemset/:id" element={<ProblemDetail />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/admin/create-problem" element={
          <AdminRoute><CreateProblem /></AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
      </Routes>
    </>
  )
}

export default App