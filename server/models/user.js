const mongoose = require("mongoose");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.statics.signup = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Email is not valid");
  }

  const match = bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }
};

userSchema.statics.signup = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  const emailExists = await this.findOne({ email });

  if (emailExists) {
    throw Error("Email already in use");
  }

  const salt = bcrypt.getSalt(10);
  const hash = bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash });

  return user;
};

module.exports = mongoose.model("User", userSchema);
