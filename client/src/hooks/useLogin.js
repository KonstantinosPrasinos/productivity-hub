export function useLogin() {

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        })

        const json = await response.text();

        console.log(json);
    }

    const getData = async () => {
        const response = await fetch('http://localhost:5000/api/settings', {
            credentials: 'include'
        })

        const json = await response.json();

        console.log(json);
    }

    return {login, getData}
}