import pkg from '@prisma/client';
import { getLanguageId, pollBatchResults, submitBatch } from '../lib/poblem.lib.js';
import { prisma } from '../lib/db.js';
import { wrapCode } from '../lib/codeWrapper.js';
const { UserRole } = pkg;

export const createProblem = async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        hints,
        editorial,
        testCases,
        codeSnippets,
        referenceSolutions
    } = req.body;

    if (req.user.role !== UserRole.ADMIN) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    try {
        for (const [languages, solutionCode] of Object.entries(referenceSolutions)) {
            const languageId = getLanguageId(languages)

            if (!languageId) {
                return res
                    .status(400)
                    .json({ error: `Unsupported Language: ${languages}` })
            }

            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res) => res.token)
            const results = await pollBatchResults(tokens)

            for (let i = 0; i < results.length; i++) {
                const result = results[i]

                if (result.status.id !== 3) {
                    return res.status(400).json({
                        error: `Validation failed for ${languages} on input: ${submissions[i].stdin}`,
                        details: result
                    })
                }
            }
        }

        const newProblem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                hints,
                editorial,
                testCases,
                codeSnippets,
                referenceSolutions,
                userId: req.user.id
            }
        })

        res.status(201).json({
            success: true,
            message: "Problem created successfully",
            problem: newProblem
        })

    } catch (error) {
        console.error('Error creating problem ', error)
        res.status(500).json({ error: "Failed to create problem" })
    }
}

export const getAllProblems = async (req, res) => {
    try {
        const problems = await prisma.problem.findMany()

        res.status(200).json({
            success: true,
            problems
        })

    } catch (error) {
        console.error("Error fetching problems", error.message)
        res.status(500).json({ error: "Failed to fetch problems" })
    }
}

export const getProblem = async (req, res) => {
    const { id } = req.params

    try {
        const problem = await prisma.problem.findUnique({
            where: { id }
        })

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" })
        }

        res.status(200).json({
            success: true,
            problem
        })

    } catch (error) {
        console.error("Error fetching problem", error.message)
        res.status(500).json({ error: "Failed to fetch problem" })
    }
}

export const runCode = async (req, res) => {
    const { source_code, language, problem_id } = req.body

    if (!source_code || !language || !problem_id) {
        return res.status(400).json({ error: "source_code, language, and problem_id are required" })
    }

    try {
        const problem = await prisma.problem.findUnique({ where: { id: problem_id } })

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" })
        }

        const languageId = getLanguageId(language)
        if (!languageId) {
            return res.status(400).json({ error: `Unsupported language: ${language}` })
        }

        // Only run against first 3 test cases for "Run" (not all — that's Submit)
        const testCases = problem.testCases.slice(0, 3)

        const submissions = testCases.map(({ input, output }) => ({
            source_code: wrapCode(language, source_code, input),  // <-- wraps and calls the function
            language_id: languageId,
            stdin: '',  // input is now baked into the code itself
            expected_output: typeof output === 'object' ? JSON.stringify(output) : String(output),
        }))

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map(r => r.token)
        const results = await pollBatchResults(tokens)

        const testResults = results.map((result, i) => ({
            testCase: i + 1,
            input: testCases[i].input,
            expectedOutput: testCases[i].output,
            actualOutput: result.stdout?.trim() ?? null,
            passed: result.status.id === 3,   // 3 = Accepted in Judge0
            status: result.status.description,
            stderr: result.stderr ?? null,
            time: result.time,
            memory: result.memory,
        }))

        const allPassed = testResults.every(r => r.passed)

        res.status(200).json({
            success: true,
            allPassed,
            runtime: results[0]?.time ? `${results[0].time}ms` : null,
            memory: results[0]?.memory ? `${results[0].memory}KB` : null,
            testResults,
        })

    } catch (error) {
        console.error("Error running code:", error)
        res.status(500).json({ error: "Failed to run code" })
    }
}


export const submitCode = async (req, res) => {
    const { source_code, language, problem_id } = req.body

    if (!source_code || !language || !problem_id) {
        return res.status(400).json({ error: "source_code, language, and problem_id are required" })
    }

    try {
        const problem = await prisma.problem.findUnique({ where: { id: problem_id } })
        if (!problem) return res.status(404).json({ error: "Problem not found" })

        const languageId = getLanguageId(language)
        if (!languageId) return res.status(400).json({ error: `Unsupported language: ${language}` })

        // Submit runs ALL test cases
        const submissions = testCases.map(({ input, output }) => ({
            source_code: wrapCode(language, source_code, input),  // <-- wraps and calls the function
            language_id: languageId,
            stdin: '',  // input is now baked into the code itself
            expected_output: typeof output === 'object' ? JSON.stringify(output) : String(output),
        }))

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map(r => r.token)
        const results = await pollBatchResults(tokens)

        const testResults = results.map((result, i) => ({
            testCase: i + 1,
            input: problem.testCases[i].input,
            expectedOutput: problem.testCases[i].output,
            actualOutput: result.stdout?.trim() ?? null,
            passed: result.status.id === 3,
            status: result.status.description,
            stderr: result.stderr ?? null,
            time: result.time,
            memory: result.memory,
        }))

        const allPassed = testResults.every(r => r.passed)
        const status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER'

        // TODO: Save submission to DB (Day 8 — Submissions history)
        // await prisma.submission.create({ data: { ... } })

        res.status(200).json({
            success: true,
            status,
            allPassed,
            runtime: results[0]?.time ? `${results[0].time}ms` : null,
            memory: results[0]?.memory ? `${results[0].memory}KB` : null,
            testResults,
        })

    } catch (error) {
        console.error("Error submitting code:", error)
        res.status(500).json({ error: "Failed to submit code" })
    }
}

