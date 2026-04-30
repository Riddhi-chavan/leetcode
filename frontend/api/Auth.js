export const registerUser = async (name, email, password) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    return data;
};

export const loginUser = async (email, password) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    return data;
};

export const checkAuth = async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/check', {
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Not authenticated');
    return data; // { user: { id, email, name, role, image } }
};