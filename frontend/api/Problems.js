const BASE_URL = 'http://localhost:3000/api/v1';

// No need to manually handle tokens — backend uses httpOnly cookies.
// Just make sure every request has credentials: 'include'
// That tells the browser to send the jwt cookie automatically.

export const getAllProblems = async () => {
    const response = await fetch(`${BASE_URL}/problems/get-all-problems`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch problems');
    }

    // Normalize backend response to match frontend shape
    // Adjust field names below to match what your backend actually returns
    return data.problems.map(problem => ({
        id:         problem._id || problem.id,
        title:      problem.title,
        difficulty: problem.difficulty,         // expects: 'Easy' | 'Medium' | 'Hard'
        acceptance: problem.acceptance ?? 0,    // if backend doesn't have this yet, defaults to 0
        status:     problem.status ?? 'Todo',   // if backend doesn't have this yet, defaults to Todo
        tags:       problem.tags ?? [],         // if backend doesn't have this yet, defaults to []
    }));
};

export const getProblem = async (id) => {
    const response = await fetch(`${BASE_URL}/problems/get-problem/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch problem');
    }

    return data;
};

export const createProblem = async (problemData) => {
    const response = await fetch(`${BASE_URL}/problems/create-problem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(problemData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to create problem');
    }

    return data;
};

export const runCode = async ({ source_code, language, problem_id, customTestCases = [] }) => {
    const response = await fetch(`${BASE_URL}/problems/run-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source_code, language, problem_id, customTestCases }),  // <-- add this
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to run code');
    return data;
};

export const submitCode = async ({ source_code, language, problem_id }) => {
    const response = await fetch(`${BASE_URL}/problems/submit-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ source_code, language, problem_id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to submit code');
    return data;
};

export const getMyProblems = async () => {
    const response = await fetch(`${BASE_URL}/problems/my-problems`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch problems');
    return data.problems;
};