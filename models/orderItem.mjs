import mongoose from "mongoose";

// Define the order item schema
const orderItemSchema = new mongoose.Schema({
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	price: {
		type: Number,
		required: true,
	},
	order_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Order", // Reference to the Order model
		required: true,
	},
	product_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product", // Reference to the Product model
		required: true,
	},
});

// Create the OrderItem model
const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;