// Backend\models\category.mjs
import mongoose from "mongoose";

// Define the category schema
const categorySchema = new mongoose.Schema({
	category_name: {
		type: String,
		required: true,
		maxlength: 255,
	},
});

// Create the Category model
const Category = mongoose.model("Category", categorySchema);

export default Category;
