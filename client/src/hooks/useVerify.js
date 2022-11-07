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

        const data = await response.json();

        console.log(data.message);

        if (!response.ok) {
            console.log('not ok')
        } else {
            console.log('ok')
            return true;
        }
    }

    return {verifyPassword, verifyEmail}
}