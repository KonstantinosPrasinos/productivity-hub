const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const resetPasswordTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        red: "user"
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

resetPasswordSchema.statics.resetPassword = async function (userId, token, password) {
    let passwordResetToken = await this.findOne({ userId });
    if (!passwordResetToken) {
        throw Error('Invalid or expired password reset token');
    }

    const tokenIsValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!tokenIsValid) {
        throw Error('Invalid or expired password reset token');
    }

    const salt = bcrypt.getSalt(10);
    const hash = await bcrypt.hash(password, salt);
}

const resetPasswordToken = mongoose.model("resetPasswordToken", resetPasswordTokenSchema)
module.exports = resetPasswordToken;