import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problems.routes.js";
import cors from 'cors'
import submissionRoutes from "./routes/submission.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import roleRequestRoutes from './routes/roleRequest.routes.js'


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}))

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/role-requests', roleRequestRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
})