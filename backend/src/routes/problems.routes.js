import { Router } from "express";
import {authenticate , checkAdmin} from "../middleware/auth.middleware.js"
import { createProblem, getAllProblems, getProblem } from "../controllers/problems.controller.js";

const problemRoutes = Router();

problemRoutes.post("/create-problem" , authenticate , checkAdmin , createProblem)
problemRoutes.get("/get-all-problems", authenticate, getAllProblems)
problemRoutes.get("/get-problem/:id", authenticate, getProblem)

export default problemRoutes;