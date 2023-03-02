const passwordResetTemplate = (email, code) => {
    return {
        from: process.env.EMAIL,
        to: email,
        subject: `Change email request`,
        text: `Change your email.\n\n
    If you are attempting to make this your email address, use the verification code below to proceed.\n\n
    If you didn't request an email change, please ignore this email.\n
    ${code}\n
    This verification code expires after 30 minutes.`,
        html: `<h2>Change your email.</h2>
    <p>f you are attempting to make this your email address, use the verification code below to proceed.<br><br>
    If you didn't request an email change, please ignore this email.<br></p>
    <h1>${code}</h1>
    <p>This verification code expires after 30 minutes.</p>`,
    }
}

module.exports = passwordResetTemplate;