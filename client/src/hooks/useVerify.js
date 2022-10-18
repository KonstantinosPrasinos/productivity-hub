export function useVerify() {

    const verifyPassword = (password) => {
        return true
    }

    const verifyVerificationCode = (code) => {
        return true;
    }

    return {verifyPassword, verifyVerificationCode}
}