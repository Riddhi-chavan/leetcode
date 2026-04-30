import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { getProfile, updateProfile } from '../controllers/profile.controller.js'

const profileRoutes = Router()

profileRoutes.patch('/update', authenticate, updateProfile)  // ← specific first
profileRoutes.get('/:userId', getProfile)                    // ← wildcard last

export default profileRoutes