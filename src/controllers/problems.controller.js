import pkg from '@prisma/client';
import { getLanguageId, pollBatchResults, submitBatch } from '../lib/poblem.lib.js';
import { prisma } from '../lib/db.js';
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
