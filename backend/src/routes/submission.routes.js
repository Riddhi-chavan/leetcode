import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getSubmissions, getSubmission } from '../controllers/submission.controller.js';

const submissionRoutes = Router();

submissionRoutes.get('/:problemId',     authenticate, getSubmissions);  // list
submissionRoutes.get('/detail/:id',     authenticate, getSubmission);   // single (with source code)

export default submissionRoutes;