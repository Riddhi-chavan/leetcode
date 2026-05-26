export const wrapCode = (language, userCode, input) => {
  const lang = language.toLowerCase()

  if (lang === 'javascript') {
    const match = userCode.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\())/)
    const fnName = match ? (match[1] || match[2]) : null
    if (!fnName) throw new Error('No function found in JavaScript code')

    return `
${userCode}

const _args = Object.values(${JSON.stringify(input)});
const _result = ${fnName}(..._args);
console.log(JSON.stringify(_result));
    `.trim()
  }

  if (lang === 'python') {
    const match = userCode.match(/def\s+(\w+)\s*\(/)
    const fnName = match ? match[1] : null
    if (!fnName) throw new Error('No function found in Python code')

    const argsJson = JSON.stringify(Object.values(input))

    return `
import json

${userCode}

_args = json.loads('${argsJson.replace(/'/g, "\\'")}')
_result = ${fnName}(*_args)
print(json.dumps(_result))
    `.trim()
  }

  if (lang === 'java') {
    const match = userCode.match(/public\s+\w[\w<>\[\]]*\s+(\w+)\s*\(/)
    const fnName = match ? match[1] : null
    if (!fnName) throw new Error('No method found in Java code')

    const args = Object.values(input)

    // Convert each arg to valid Java syntax
    const javaArgs = args.map(arg => {
      if (Array.isArray(arg)) {
        return `new int[]{${arg.join(', ')}}`
      }
      if (typeof arg === 'boolean') return arg.toString()
      if (typeof arg === 'string') return `"${arg}"`
      return arg
    })

    return `
import java.util.*;

${userCode}

class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        Object result = sol.${fnName}(${javaArgs.join(', ')});
        System.out.println(result.toString().toLowerCase());
    }
}
    `.trim()
  }

  return userCode
}