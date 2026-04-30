import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { getProfile, updateProfile } from '../controllers/profile.controller.js'

const profileRoutes = Router()

profileRoutes.get('/:userId',      getProfile)           // public — anyone can view
profileRoutes.patch('/update',     authenticate, updateProfile)  // private — own profile only

export default profileRoutes