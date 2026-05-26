import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createProblem } from "../../../api/Problems"

// ── Constants ─────────────────────────────────────────────────────────────────
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
const LANGUAGES = ['javascript', 'python', 'java']
const ALL_TAGS = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
  'Sorting', 'Greedy', 'Tree', 'Graph', 'Binary Search', 'Stack',
  'Queue', 'Linked List', 'Recursion', 'Backtracking', 'Two Pointers',
]

const diffStyle = {
  EASY:   'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/25',
  MEDIUM: 'bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/25',
  HARD:   'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/25',
}

// ── Small reusable pieces ─────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-wider flex items-center gap-1">
    {children}
    {required && <span className="text-[#ff375f]">*</span>}
  </label>
)

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116]/60 transition-colors"
  />
)

const Textarea = ({ rows = 4, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    className="w-full bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116]/60 transition-colors resize-none font-mono"
  />
)

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] overflow-hidden">
    <div className="px-5 py-4 border-b border-[#2a2a2a]">
      <p className="text-[13px] font-medium text-[#e8e8e8]">{title}</p>
      {subtitle && <p className="text-[11px] text-[#6b6b6b] mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5 flex flex-col gap-4">{children}</div>
  </div>
)

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Problem Info', 'Examples & Hints', 'Test Cases', 'Code']

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((s, i) => (
      <React.Fragment key={s}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
            i < current
              ? 'bg-[#ffa116] border-[#ffa116] text-black'
              : i === current
              ? 'bg-transparent border-[#ffa116] text-[#ffa116]'
              : 'bg-transparent border-[#2a2a2a] text-[#4b4b4b]'
          }`}>
            {i < current ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : i + 1}
          </div>
          <span className={`text-[12px] ${i === current ? 'text-[#e8e8e8]' : 'text-[#4b4b4b]'}`}>{s}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`flex-1 h-[1px] mx-3 ${i < current ? 'bg-[#ffa116]/40' : 'bg-[#2a2a2a]'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
)

// ── Main page ─────────────────────────────────────────────────────────────────
const CreateProblem = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Form state ──
  const [info, setInfo] = useState({
    title: '', description: '', difficulty: 'EASY',
    tags: [], constraints: '',
  })

  const [extras, setExtras] = useState({
    hints: '', editorial: '',
    examples: [{ input: '', output: '', explanation: '' }],
  })

  const [testCases, setTestCases] = useState([
    { input: '', output: '' },
    { input: '', output: '' },
  ])

  const [codeSnippets, setCodeSnippets] = useState({
    javascript: '/**\n * @param {number[]} nums\n * @return {number}\n */\nvar solve = function(nums) {\n    \n};',
    python: 'class Solution:\n    def solve(self, nums: List[int]) -> int:\n        pass',
    java: 'class Solution {\n    public int solve(int[] nums) {\n        \n    }\n}',
  })

  const [referenceSolutions, setReferenceSolutions] = useState({
    javascript: '',
  })

  const [activeCodeLang, setActiveCodeLang] = useState('javascript')
  const [activeRefLang, setActiveRefLang] = useState('javascript')

  // ── Helpers ──
  const toggleTag = (tag) => {
    setInfo(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const addExample = () =>
    setExtras(f => ({ ...f, examples: [...f.examples, { input: '', output: '', explanation: '' }] }))

  const removeExample = (i) =>
    setExtras(f => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }))

  const updateExample = (i, key, val) =>
    setExtras(f => {
      const ex = [...f.examples]
      ex[i] = { ...ex[i], [key]: val }
      return { ...f, examples: ex }
    })

  const addTestCase = () => setTestCases(t => [...t, { input: '', output: '' }])
  const removeTestCase = (i) => setTestCases(t => t.filter((_, idx) => idx !== i))
  const updateTestCase = (i, key, val) =>
    setTestCases(t => {
      const tc = [...t]
      tc[i] = { ...tc[i], [key]: val }
      return tc
    })

  // ── Validation ──
  const canNext = () => {
    if (step === 0) return info.title.trim() && info.description.trim() && info.constraints.trim() && info.tags.length > 0
    if (step === 1) return extras.examples.every(e => e.input.trim() && e.output.trim())
    if (step === 2) return testCases.every(tc => tc.input.trim() && tc.output.trim()) && testCases.length >= 2
    if (step === 3) return referenceSolutions.javascript?.trim()
    return true
  }

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      // Parse test cases — try JSON parse, fallback to string
      const parsedTestCases = testCases.map(tc => ({
        input: (() => { try { return JSON.parse(tc.input) } catch { return tc.input } })(),
        output: (() => { try { return JSON.parse(tc.output) } catch { return tc.output } })(),
      }))

      const parsedExamples = extras.examples.map(e => ({
        input: e.input, output: e.output,
        explanation: e.explanation || undefined,
      }))

      await createProblem({
        title: info.title.trim(),
        description: info.description.trim(),
        difficulty: info.difficulty,
        tags: info.tags,
        constraints: info.constraints.trim(),
        hints: extras.hints.trim() || null,
        editorial: extras.editorial.trim() || null,
        examples: parsedExamples,
        testCases: parsedTestCases,
        codeSnippets,
        referenceSolutions,
      })
      navigate('/admin/dashboard?tab=problems')
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  // ── Step renders ──────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="flex flex-col gap-5">
      <SectionCard title="Basic Info" subtitle="Title, difficulty and topic tags">
        <div className="flex flex-col gap-1">
          <Label required>Title</Label>
          <Input
            value={info.title}
            onChange={e => setInfo(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Two Sum"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label required>Difficulty</Label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                onClick={() => setInfo(f => ({ ...f, difficulty: d }))}
                className={`px-4 py-1.5 rounded-[6px] text-[12px] font-medium border transition-all ${
                  info.difficulty === d
                    ? diffStyle[d]
                    : 'bg-transparent border-[#2a2a2a] text-[#6b6b6b] hover:border-[#444]'
                }`}
              >
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label required>Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-[5px] text-[11px] border transition-all ${
                  info.tags.includes(tag)
                    ? 'bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116]'
                    : 'bg-transparent border-[#2a2a2a] text-[#6b6b6b] hover:border-[#444] hover:text-[#e8e8e8]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {info.tags.length === 0 && (
            <p className="text-[11px] text-[#4b4b4b]">Select at least one tag</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Problem Statement" subtitle="Use markdown for formatting">
        <div className="flex flex-col gap-1">
          <Label required>Description</Label>
          <Textarea
            rows={8}
            value={info.description}
            onChange={e => setInfo(f => ({ ...f, description: e.target.value }))}
            placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label required>Constraints</Label>
          <Textarea
            rows={3}
            value={info.constraints}
            onChange={e => setInfo(f => ({ ...f, constraints: e.target.value }))}
            placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists"}
          />
        </div>
      </SectionCard>
    </div>
  )

  const renderStep1 = () => (
    <div className="flex flex-col gap-5">
      <SectionCard
        title="Examples"
        subtitle="These appear in the problem statement — visible to all users"
      >
        {extras.examples.map((ex, i) => (
          <div key={i} className="flex flex-col gap-3 p-4 bg-[#111] rounded-[8px] border border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#6b6b6b]">Example {i + 1}</span>
              {extras.examples.length > 1 && (
                <button
                  onClick={() => removeExample(i)}
                  className="text-[#6b6b6b] hover:text-[#ff375f] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label required>Input</Label>
                <Input
                  value={ex.input}
                  onChange={e => updateExample(i, 'input', e.target.value)}
                  placeholder="nums = [2,7,11,15], target = 9"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label required>Output</Label>
                <Input
                  value={ex.output}
                  onChange={e => updateExample(i, 'output', e.target.value)}
                  placeholder="[0,1]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Explanation</Label>
              <Input
                value={ex.explanation}
                onChange={e => updateExample(i, 'explanation', e.target.value)}
                placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
              />
            </div>
          </div>
        ))}
        <button
          onClick={addExample}
          className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#ffa116] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add example
        </button>
      </SectionCard>

      <SectionCard title="Hints & Editorial" subtitle="Optional — shown only when user requests">
        <div className="flex flex-col gap-1">
          <Label>Hint</Label>
          <Textarea
            rows={3}
            value={extras.hints}
            onChange={e => setExtras(f => ({ ...f, hints: e.target.value }))}
            placeholder="Try using a hash map to store previously seen values..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Editorial / Solution explanation</Label>
          <Textarea
            rows={5}
            value={extras.editorial}
            onChange={e => setExtras(f => ({ ...f, editorial: e.target.value }))}
            placeholder="The brute force approach is O(n²). The optimal approach uses a hash map for O(n) time..."
          />
        </div>
      </SectionCard>
    </div>
  )

  const renderStep2 = () => (
    <SectionCard
      title="Test Cases"
      subtitle="JSON format — these are used to validate submissions. Min 2 required."
    >
      <div className="flex flex-col gap-3">
        {testCases.map((tc, i) => (
          <div key={i} className="flex gap-3 items-start p-4 bg-[#111] rounded-[8px] border border-[#2a2a2a]">
            <span className="text-[11px] text-[#4b4b4b] pt-2 w-[20px] flex-shrink-0">#{i + 1}</span>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label required>Input (JSON)</Label>
                <Textarea
                  rows={3}
                  value={tc.input}
                  onChange={e => updateTestCase(i, 'input', e.target.value)}
                  placeholder={'{"nums": [2,7,11,15], "target": 9}'}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label required>Expected Output (JSON)</Label>
                <Textarea
                  rows={3}
                  value={tc.output}
                  onChange={e => updateTestCase(i, 'output', e.target.value)}
                  placeholder="[0,1]"
                />
              </div>
            </div>
            {testCases.length > 2 && (
              <button
                onClick={() => removeTestCase(i)}
                className="text-[#6b6b6b] hover:text-[#ff375f] transition-colors mt-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addTestCase}
        className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#ffa116] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add test case
      </button>
    </SectionCard>
  )

  const renderStep3 = () => (
    <div className="flex flex-col gap-5">
      <SectionCard title="Code Snippets" subtitle="Starter code shown to users in the editor">
        <div className="flex gap-1 border-b border-[#2a2a2a] -mx-5 px-5 pb-0 mb-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveCodeLang(lang)}
              className={`px-3 py-2 text-[12px] transition-colors border-b-2 -mb-px ${
                activeCodeLang === lang
                  ? 'text-[#ffa116] border-[#ffa116]'
                  : 'text-[#6b6b6b] border-transparent hover:text-[#e8e8e8]'
              }`}
            >
              {lang === 'python' ? 'Python' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
        <Textarea
          rows={10}
          value={codeSnippets[activeCodeLang]}
          onChange={e => setCodeSnippets(s => ({ ...s, [activeCodeLang]: e.target.value }))}
        />
      </SectionCard>

      <SectionCard
        title="Reference Solutions"
        subtitle="Used internally to validate test cases — never shown to users"
      >
        <div className="flex gap-1 border-b border-[#2a2a2a] -mx-5 px-5 pb-0 mb-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveRefLang(lang)}
              className={`px-3 py-2 text-[12px] transition-colors border-b-2 -mb-px ${
                activeRefLang === lang
                  ? 'text-[#ffa116] border-[#ffa116]'
                  : 'text-[#6b6b6b] border-transparent hover:text-[#e8e8e8]'
              }`}
            >
              {lang === 'python' ? 'Python' : lang.charAt(0).toUpperCase() + lang.slice(1)}
              {referenceSolutions[lang]?.trim() && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#00b8a3] inline-block" />
              )}
            </button>
          ))}
        </div>
        <Textarea
          rows={10}
          value={referenceSolutions[activeRefLang] ?? ''}
          onChange={e => setReferenceSolutions(s => ({ ...s, [activeRefLang]: e.target.value }))}
          placeholder={`// Reference solution for ${activeRefLang}\n// Must pass all test cases above`}
        />
        <p className="text-[11px] text-[#4b4b4b]">
          At minimum, provide a JavaScript reference solution. Add more languages to enable multi-language validation.
        </p>
      </SectionCard>

      {submitError && (
        <div className="flex items-start gap-3 p-4 bg-[#ff375f]/5 border border-[#ff375f]/20 rounded-[8px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-[12px] font-medium text-[#ff375f]">Validation failed</p>
            <p className="text-[11px] text-[#ff375f]/70 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}
    </div>
  )

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] text-[#e8e8e8]">
      {/* Topbar */}
      <div className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-1.5 text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors text-[13px]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Dashboard
        </button>
        <span className="text-[#2a2a2a]">/</span>
        <span className="text-[13px] text-[#e8e8e8]">Create Problem</span>
        <div className="ml-auto flex items-center gap-2">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} className="w-[26px] h-[26px] rounded-full object-cover" alt="" />
          ) : (
            <div className="w-[26px] h-[26px] rounded-full bg-[#ffa116] flex items-center justify-center text-black text-[10px] font-bold">
              {(currentUser?.name ?? 'A')[0].toUpperCase()}
            </div>
          )}
          <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/25 font-medium">Admin</span>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold text-[#e8e8e8]">Create Problem</h1>
          <p className="text-[13px] text-[#6b6b6b] mt-1">
            Add a new problem to the platform. Reference solutions are validated against test cases before saving.
          </p>
        </div>

        <StepBar current={step} />

        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#2a2a2a]">
          <button
            onClick={() => step === 0 ? navigate('/admin/dashboard') : setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#4b4b4b]">Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext() || submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Validating & saving...
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Create problem
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProblem