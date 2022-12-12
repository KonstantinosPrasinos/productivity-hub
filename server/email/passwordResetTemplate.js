const passwordResetTemplate = (email, code) => {
    return {
        from: process.env.EMAIL,
        to: email,
        subject: `Password reset request`,
        text: `Reset your password.\n\n
    If you requested a password reset, use the verification code below to proceed.\n\n
    If you didn't request a password reset, please ignore this email.\n
    ${code}\n
    This verification code expires after 30 minutes.`,
        html: `<h2>Reset your password.</h2>
    <p>If you requested a password reset, use the verification code below to proceed.<br><br>
    If you didn't request a password reset, please ignore this email.<br></p>
    <h1>${code}</h1>
    <p>This verification code expires after 30 minutes.</p>`,
    }
}

module.exports = passwordResetTemplate;