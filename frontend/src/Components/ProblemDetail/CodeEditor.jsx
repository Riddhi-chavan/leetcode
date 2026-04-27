import { Editor } from "@monaco-editor/react"
import { useEffect, useState } from "react"

export const CodeEditor = ({ problem, language, setLanguage, onRun, onSubmit, running, submitting }) => {
  const LANGUAGES = ['javascript', 'python', 'java']
  const monacoLangMap = { javascript: 'javascript', python: 'python', java: 'java' }
  const snippet = problem?.codeSnippets?.[language] || '// select a language'
  const [code, setCode] = useState(snippet)

  useEffect(() => { setCode(snippet) }, [language, snippet])

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme('leetcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#111111',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editorLineNumber.foreground': '#3a3a3a',
        'editorLineNumber.activeForeground': '#6b6b6b',
        'editor.selectionBackground': '#ffa11630',
        'editor.inactiveSelectionBackground': '#ffa11615',
        'editorCursor.foreground': '#ffa116',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#2a2a2a',
        'scrollbarSlider.hoverBackground': '#333333',
        'scrollbarSlider.activeBackground': '#3a3a3a',
      },
    })
    monaco.editor.setTheme('leetcode-dark')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[42px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3 flex-shrink-0">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-[#2a2a2a] text-[#e8e8e8] text-[12px] px-2 py-1 rounded-[4px] border border-[#333] outline-none cursor-pointer"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
        <div className="ml-auto">
          <button
            onClick={() => setCode(snippet)}
            className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1"
            title="Reset code"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={monacoLangMap[language]}
          value={code}
          onChange={val => setCode(val || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            suggest: { enabled: true },
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            renderWhitespace: 'none',
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            occurrencesHighlight: true,
            selectionHighlight: true,
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          }}
        />
      </div>

      <div className="h-[52px] bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={() => onRun(code)}
          disabled={running || submitting}
          className="px-4 h-[32px] rounded-[4px] bg-[#2a2a2a] text-[#e8e8e8] text-[13px] hover:bg-[#333] transition-colors border border-[#333] disabled:opacity-50 flex items-center gap-2"
        >
          {running && <div className="w-3 h-3 border border-[#e8e8e8] border-t-transparent rounded-full animate-spin"/>}
          {running ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={() => onSubmit(code)}
          disabled={running || submitting}
          className="ml-auto px-4 h-[32px] rounded-[4px] bg-[#ffa116] text-black text-[13px] font-medium hover:bg-[#ffb84d] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin"/>}
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}