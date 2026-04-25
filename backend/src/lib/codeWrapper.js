export const wrapCode = (language, userCode, input) => {
  if (language === 'javascript') {
    // Extract function name from user's code
    const match = userCode.match(/function\s+(\w+)\s*\(/)
    const fnName = match ? match[1] : null

    if (!fnName) throw new Error('No function found in your code')

    return `
${userCode}

const _args = Object.values(${JSON.stringify(input)});
const _result = ${fnName}(..._args);
console.log(JSON.stringify(_result));
    `.trim()
  }

  if (language === 'python') {
    return `
${userCode}

import json, ast, sys

_src = '''${userCode.replace(/'/g, "\\'")}'''
_tree = ast.parse(_src)
_fn_name = next((n.name for n in ast.walk(_tree) if isinstance(n, ast.FunctionDef)), None)

if not _fn_name:
    sys.exit("No function found")

_input = ${JSON.stringify(input)}
_args = list(_input.values())
_result = locals()[_fn_name](*_args)
print(json.dumps(_result))
    `.trim()
  }

  if (language === 'java') {
    // Java needs a different approach — return as-is for now
    // Judge0 handles Java differently (needs a class with main)
    return userCode
  }

  return userCode
}