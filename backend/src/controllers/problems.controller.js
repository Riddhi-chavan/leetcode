import pkg from '@prisma/client';
import { getLanguageId, pollBatchResults, submitBatch } from '../lib/poblem.lib.js';
import { prisma } from '../lib/db.js';
import { wrapCode } from '../lib/codeWrapper.js';
const { UserRole } = pkg;

const generateTestCases = async (problem, language, count = 6) => {
  const refSolution = problem.referenceSolutions?.[language] || problem.referenceSolutions?.['javascript']
  if (!refSolution) return problem.testCases

  const languageId = getLanguageId(language)
  const existingInput = problem.testCases[0]?.input
  if (!existingInput) return problem.testCases

  const needed = count - problem.testCases.length

  // ✅ Fix: if no new cases needed, return early
  if (needed <= 0) return problem.testCases.slice(0, count)

  const randomCases = Array.from({ length: needed }, () => {
    if ('nums' in existingInput && 'target' in existingInput) {
      const length = Math.floor(Math.random() * 8) + 2
      const nums   = Array.from({ length }, () => Math.floor(Math.random() * 20) - 5)
      const i      = Math.floor(Math.random() * length)
      let j        = Math.floor(Math.random() * length)
      while (j === i) j = Math.floor(Math.random() * length)
      const target = nums[i] + nums[j]
      return { input: { nums, target }, output: null }
    }
    return null
  }).filter(Boolean)

  // ✅ Fix: if randomCases is empty after filtering, return early
  if (randomCases.length === 0) return problem.testCases.slice(0, count)

  const submissions = randomCases.map(({ input }) => ({
    source_code: wrapCode(language, refSolution, input),
    language_id: languageId,
    stdin: '',
    expected_output: '',
  }))

  const submissionResults = await submitBatch(submissions)
  const tokens  = submissionResults.map(r => r.token)
  const results = await pollBatchResults(tokens)

  const generatedCases = randomCases.map((tc, i) => ({
    input:  tc.input,
    output: (() => {
      try { return JSON.parse(results[i].stdout?.trim() || 'null') }
      catch { return null }
    })()
  })).filter(tc => tc.output !== null)

  return [...problem.testCases, ...generatedCases].slice(0, count)
}

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

    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      select: { problemId: true, status: true },
    })

    const statusMap = {}
    for (const sub of submissions) {
      if (sub.status === 'ACCEPTED') {
        statusMap[sub.problemId] = 'Solved'
      } else if (!statusMap[sub.problemId]) {
        statusMap[sub.problemId] = 'Attempted'
      }
    }

    const enriched = problems.map(p => ({
      ...p,
      status: statusMap[p.id] ?? 'Todo',
    }))

    res.status(200).json({ success: true, problems: enriched })
  } catch (error) {
    console.error('Error fetching problems', error.message)
    res.status(500).json({ error: 'Failed to fetch problems' })
  }
}

export const getProblem = async (req, res) => {
    const { id } = req.params
    try {
        const problem = await prisma.problem.findUnique({ where: { id } })
        if (!problem) return res.status(404).json({ error: "Problem not found" })
        res.status(200).json({ success: true, problem })
    } catch (error) {
        console.error("Error fetching problem", error.message)
        res.status(500).json({ error: "Failed to fetch problem" })
    }
}

export const runCode = async (req, res) => {
    const { source_code, language, problem_id, customTestCases = [] } = req.body

    if (!source_code || !language || !problem_id) {
        return res.status(400).json({ error: "source_code, language, and problem_id are required" })
    }

    try {
        const problem = await prisma.problem.findUnique({ where: { id: problem_id } })
        if (!problem) return res.status(404).json({ error: "Problem not found" })

        const languageId = getLanguageId(language)
        if (!languageId) return res.status(400).json({ error: `Unsupported language: ${language}` })

        const builtinCases = problem.testCases.slice(0, 3)

        const parsedCustom = customTestCases.map(tc => ({
            input: Object.fromEntries(
                Object.entries(tc.input).map(([k, v]) => {
                    try { return [k, JSON.parse(v)] }
                    catch { return [k, v] }
                })
            ),
            output: (() => {
                try { return JSON.parse(tc.output) }
                catch { return tc.output }
            })()
        }))

        const testCases = [...builtinCases, ...parsedCustom]

        const submissions = testCases.map(({ input, output }) => ({
            source_code: wrapCode(language, source_code, input),
            language_id: languageId,
            stdin: '',
            expected_output: typeof output === 'object' ? JSON.stringify(output) : String(output),
        }))

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map(r => r.token)
        const results = await pollBatchResults(tokens)

        const testResults = results.map((result, i) => ({
            testCase:       i + 1,
            input:          testCases[i].input,
            expectedOutput: testCases[i].output,
            actualOutput:   result.stdout?.trim() ?? null,
            passed:         result.status.id === 3,
            status:         result.status.description,
            stderr:         result.stderr ?? null,
            time:           result.time,
            memory:         result.memory,
        }))

        const allPassed = testResults.every(r => r.passed)

        res.status(200).json({
            success: true,
            allPassed,
            runtime: results[0]?.time   ? `${results[0].time}ms`   : null,
            memory:  results[0]?.memory ? `${results[0].memory}KB` : null,
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

        const testCases = await generateTestCases(problem, language, 6)

        // ✅ Fix: guard against empty test cases
        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ error: "No test cases available for this problem" })
        }

        const submissions = testCases.map(({ input, output }) => ({
            source_code: wrapCode(language, source_code, input),
            language_id: languageId,
            stdin: '',
            expected_output: typeof output === 'object' ? JSON.stringify(output) : String(output),
        }))

        const submissionResults = await submitBatch(submissions)
        const tokens  = submissionResults.map(r => r.token)
        const results = await pollBatchResults(tokens)

        const testResults = results.map((result, i) => ({
            testCase:       i + 1,
            input:          testCases[i].input,
            expectedOutput: testCases[i].output,
            actualOutput:   result.stdout?.trim() ?? null,
            passed:         result.status.id === 3,
            status:         result.status.description,
            stderr:         result.stderr ?? null,
            time:           result.time,
            memory:         result.memory,
        }))

        const passedCount = testResults.filter(r => r.passed).length
        const totalCount  = testResults.length
        const allPassed   = passedCount === totalCount
        const firstFailed = testResults.find(r => !r.passed) || null

        await prisma.submission.create({
            data: {
                userId:      req.user.id,
                problemId:   problem_id,
                language,
                sourceCode:  source_code,
                status:      allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
                passedCount,
                totalCount,
                runtime:     results[0]?.time   ? `${results[0].time}ms`   : null,
                memory:      results[0]?.memory ? `${results[0].memory}KB` : null,
            },
        })

        res.status(200).json({
            success: true,
            status:      allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
            allPassed,
            passedCount,
            totalCount,
            firstFailed,
            runtime: results[0]?.time   ? `${results[0].time}ms`   : null,
            memory:  results[0]?.memory ? `${results[0].memory}KB` : null,
        })

    } catch (error) {
        console.error("Error submitting code:", error)
        res.status(500).json({ error: "Failed to submit code" })
    }
}

export const updateProblem = async (req, res) => {
  const { id } = req.params
  const {
    title, description, difficulty, tags,
    examples, constraints, hints, editorial,
    testCases, codeSnippets, referenceSolutions
  } = req.body

  try {
    const problem = await prisma.problem.findUnique({ where: { id } })
    if (!problem) return res.status(404).json({ error: 'Problem not found' })

    const updated = await prisma.problem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(difficulty && { difficulty }),
        ...(tags && { tags }),
        ...(examples && { examples }),
        ...(constraints && { constraints }),
        ...(hints !== undefined && { hints }),
        ...(editorial !== undefined && { editorial }),
        ...(testCases && { testCases }),
        ...(codeSnippets && { codeSnippets }),
        ...(referenceSolutions && { referenceSolutions }),
      }
    })

    res.status(200).json({ success: true, message: 'Problem updated', problem: updated })
  } catch (error) {
    console.error('Error updating problem', error)
    res.status(500).json({ error: 'Failed to update problem' })
  }
}

export const deleteProblem = async (req, res) => {
  const { id } = req.params

  try {
    const problem = await prisma.problem.findUnique({ where: { id } })
    if (!problem) return res.status(404).json({ error: 'Problem not found' })

    await prisma.problem.delete({ where: { id } })

    res.status(200).json({ success: true, message: 'Problem deleted' })
  } catch (error) {
    console.error('Error deleting problem', error)
    res.status(500).json({ error: 'Failed to delete problem' })
  }
}
