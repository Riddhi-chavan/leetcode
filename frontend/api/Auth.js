export const registerUser = async (name, email, password) => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    return data;
};