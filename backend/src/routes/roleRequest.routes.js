import express from 'express'
import { authenticate, checkAdmin } from '../middleware/auth.middleware.js'
import {
  submitRoleRequest,
  getRoleRequests,
  reviewRoleRequest,
  getMyRoleRequest
} from '../controllers/roleRequest.controller.js'

const router = express.Router()

router.post('/', authenticate, submitRoleRequest)
router.get('/', authenticate, checkAdmin, getRoleRequests)
router.patch('/:id', authenticate, checkAdmin, reviewRoleRequest)
router.get('/my-status', authenticate, getMyRoleRequest)

export default router