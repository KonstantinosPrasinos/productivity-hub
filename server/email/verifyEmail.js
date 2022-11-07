const verifyEmailTemplate = (email, code) => {
  return {
    from: process.env.EMAIL,
    to: email,
    subject: `${code} is your Productivity Hub verification code`,
    text: `Confirm your email address.\n\n
    In order to complete the creation of your account we need to verify your email address.\n\n
    Please enter this verification code to get started on Productivity Hub.\n
    ${code}\n
    This verification code expires after 30 minutes.`,
    html: `<h2>Confirm your email address.</h2>
    <p>In order to complete the creation of your account we need to verify your email address.<br><br>
    Please enter this verification code to get started on Productivity Hub.<br></p>
    <h1>${code}</h1>
    <p>This verification code expires after 30 minutes.</p>`,
  }
}

module.exports = verifyEmailTemplate;