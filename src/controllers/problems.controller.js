import pkg from '@prisma/client';
import { getLanguageId, submitBatch } from '../lib/poblem.lib.js';
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

            if (languageId) {
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

            const submissionResults =   await submitBatch(submissions)
        }

    } catch (error) {

    }
}