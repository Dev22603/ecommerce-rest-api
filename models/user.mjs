// Backend\models\user.mjs
import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 100,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		match: [
			/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
			"Please fill a valid email address",
		],
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
	},
	role: {
		type: String,
		enum: ["admin", "customer"],
		required: true,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
