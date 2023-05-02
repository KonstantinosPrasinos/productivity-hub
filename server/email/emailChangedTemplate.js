const emailChangedTemplate = (email) => {
    return {
        from: process.env.EMAIL,
        to: email,
        subject: `Email changed`,
        text: `Your account on productivity hub has had it's email changed.`,
        html: `<h2>Your account on productivity hub has had it's email changed.</h2>`
    }
}

module.exports = emailChangedTemplate;