import { Router } from "express";
import {authenticate , checkAdmin} from "../middleware/auth.middleware.js"
import { createProblem, deleteProblem, getAllProblems, getProblem, runCode, submitCode, updateProblem } from "../controllers/problems.controller.js";

const problemRoutes = Router();

problemRoutes.post("/create-problem" , authenticate , checkAdmin , createProblem)
problemRoutes.get("/get-all-problems", authenticate, getAllProblems)
problemRoutes.get("/get-problem/:id", authenticate, getProblem)
problemRoutes.post("/run-code", authenticate, runCode)
problemRoutes.post("/submit-code", authenticate, submitCode)
problemRoutes.patch('/:id', authenticate, checkAdmin, updateProblem)
problemRoutes.delete('/:id', authenticate, checkAdmin, deleteProblem)

export default problemRoutes;