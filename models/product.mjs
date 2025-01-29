// Backend\models\product.mjs
import mongoose from "mongoose";

// Define the product schema
const productSchema = new mongoose.Schema({
	product_name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 255,
	},
	ws_code: {
		type: Number,
		required: true,
		unique: true,
		min: 0,
	},
	sales_price: {
		type: Number,
		required: true,
		min: 1,
	},
	mrp: {
		type: Number,
		required: true,
		min: 1,
	},
	package_size: {
		type: Number,
		required: true,
		min: 1,
	},
	images: {
		type: [String],
		default: [],
	},
	tags: {
		type: [String],
		default: [],
	},
	stock: {
		type: Number,
		default: 0,
		min: 0,
	},
	category_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category", // Reference to the Category model
		required: true,
	},
});

// Create the Product model
const Product = mongoose.model("Product", productSchema);

export default Product;
