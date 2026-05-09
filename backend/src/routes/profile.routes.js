import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { getProfile, updateProfile , uploadAvatar } from '../controllers/profile.controller.js'
import { uploadAvatar as multerUpload } from '../middleware/upload.middleware.js'

const profileRoutes = Router()

profileRoutes.patch('/update', authenticate, updateProfile)  // ← specific first
profileRoutes.get('/:userId', getProfile)                    // ← wildcard last

profileRoutes.post('/avatar', authenticate, (req, res, next) => {
  multerUpload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err)           // ← will now show in terminal
      return res.status(500).json({ error: err.message })
    }
    next()
  })
}, uploadAvatar)

export default profileRoutes