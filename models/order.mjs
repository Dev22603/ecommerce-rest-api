// Backend\models\order.mjs

import mongoose from "mongoose";

// Define the order schema
const orderSchema = new mongoose.Schema({
	status: {
		type: String,
		enum: ["Pending", "Shipped", "Completed", "Cancelled"],
		default: "Pending",
	},
	total_amount: {
		type: Number,
		required: true,
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
	order_items: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "OrderItem", // Reference to the OrderItem model
			required: true,
		},
	],
});

// Create the Order model
const Order = mongoose.model("Order", orderSchema);

export default Order;
