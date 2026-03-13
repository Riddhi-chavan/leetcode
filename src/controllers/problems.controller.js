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
                userId : req.user.id
            })

            res.status(201).json({
                success : true ,
                message : "Problem created successfully",
                problem : newProblem
            })

    } catch (error) {
        console.error('Error creating problem ' , error)
        res.status(500).json({error : "Failed to create problem"})
    }
}
