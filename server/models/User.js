const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true, select: false },
		refreshToken: { type: String, default: null, select: false },
	},
	{ timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete ret.password;
		delete ret.refreshToken;
		return ret;
	}
})

module.exports = mongoose.model("User", userSchema)