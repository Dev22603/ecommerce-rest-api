// Backend\models\cart.mjs
import mongoose from "mongoose";

// Define the cart schema
const cartSchema = new mongoose.Schema({
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Reference to the User model
		required: true,
	},
	product_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product", // Reference to the Product model
		required: true,
	},
});

// Create the Cart model
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
