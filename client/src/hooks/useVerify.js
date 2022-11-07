export function useVerify() {

    const verifyPassword = () => {
        return true
    }

    const verifyEmail = async (email, code) => {
        const response = await fetch('http://localhost:5000/api/verify/email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, code}),
            credentials: 'include'
        });

        if (!response.ok) {

        } else {
            console.log(response);
            return true;
        }
    }

    return {verifyPassword, verifyEmail}
}