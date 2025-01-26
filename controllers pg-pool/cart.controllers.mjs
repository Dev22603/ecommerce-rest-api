// Backend\controllers\cart.controllers.mjs
import { pool } from "../db/db.mjs";

// Add to Cart insppired by Amazon
const addItemToCart = async (req, res) => {
    const { product_id } = req.body; // Only product_id is provided in the request
    const user_id = req.user.id;
    console.log(user_id);

    try {
        // Check if the product already exists in the user's cart
        const existingItemResult = await pool.query(
            "SELECT id, quantity FROM Carts WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );

        if (existingItemResult.rows.length > 0) {
            // If product already exists, update the quantity (increment by 1)
            const cartItem = existingItemResult.rows[0];
            const updatedQuantity = cartItem.quantity + 1;

            const updateResult = await pool.query(
                "UPDATE Carts SET quantity = $1 WHERE id = $2 RETURNING id, product_id, quantity",
                [updatedQuantity, cartItem.id]
            );

            // Fetch the product name
            const productResult = await pool.query(
                "SELECT product_name FROM Products WHERE id = $1",
                [product_id]
            );

            // Return the updated cart item with product name
            res.status(200).json({
                id: updateResult.rows[0].id,
                product_id: updateResult.rows[0].product_id,
                quantity: updateResult.rows[0].quantity,
                product_name: productResult.rows[0].product_name,
            });
        } else {
            // If product doesn't exist in the cart, insert as a new item with quantity = 1
            const insertResult = await pool.query(
                "INSERT INTO Carts (user_id, product_id, quantity) VALUES ($1, $2, 1) RETURNING id, product_id, quantity",
                [user_id, product_id]
            );

            // Fetch the product name
            const productResult = await pool.query(
                "SELECT product_name FROM Products WHERE id = $1",
                [product_id]
            );

            // Return the newly added cart item with product name
            res.status(201).json({
                id: insertResult.rows[0].id,
                product_id: insertResult.rows[0].product_id,
                quantity: insertResult.rows[0].quantity,
                product_name: productResult.rows[0].product_name,
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart", error });
    }
};

// Get user's cart v1
const getCart = async (req, res) => {
    const user_id = req.user.id; // assuming you have user info from JWT token

    try {
        const result = await pool.query(
            `SELECT c.id, c.quantity, p.product_name, p.id as product_id, p.images
            FROM Carts c
            JOIN Products p ON c.product_id = p.id
            WHERE c.user_id = $1`,
            [user_id]
        );
        console.log(result.rows);

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error });
    }
};

// Update cart item
const updateCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id; // assuming you have user info from JWT token

    try {
        // Update the quantity of the product in the cart
        const updateResult = await pool.query(
            "UPDATE Carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING id, product_id, quantity",
            [quantity, user_id, product_id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // Fetch the product name
        const productResult = await pool.query(
            "SELECT product_name FROM Products WHERE id = $1",
            [product_id]
        );

        // Return the updated cart item with product name
        res.status(200).json({
            id: updateResult.rows[0].id,
            product_id: updateResult.rows[0].product_id,
            quantity: updateResult.rows[0].quantity,
            product_name: productResult.rows[0].product_name,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart item", error });
    }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
    const { product_id } = req.params;
    const user_id = req.user.id; // assuming you have user info from JWT token

    try {
        // Delete the product from the cart
        const deleteResult = await pool.query(
            "DELETE FROM Carts WHERE user_id = $1 AND product_id = $2 RETURNING product_id",
            [user_id, product_id]
        );

        if (deleteResult.rows.length === 0) {
            // If no rows were deleted, the product wasn't in the cart
            return res.status(404).json({
                message: "Product not found in the cart",
            });
        }

        // Fetch the product name for the response
        const productResult = await pool.query(
            "SELECT product_name FROM Products WHERE id = $1",
            [product_id]
        );

        // Return a successful response with the product name
        res.status(200).json({
            message: `${productResult.rows[0].product_name} has been removed from your cart.`,
            product_id: parseInt(product_id, 10),
        });
    } catch (error) {
        res.status(500).json({
            message: "Error removing item from cart",
            error,
        });
    }
};

// Increment quantity of a product in the cart
const incrementQuantity = async (req, res) => {
    const { product_id } = req.body; // Get product_id from request body
    const user_id = req.user.id; // assuming you have user info from JWT token

    try {
        // Check if the product exists in the user's cart
        const cartItemResult = await pool.query(
            "SELECT id, quantity FROM Carts WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );

        if (cartItemResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found in the cart",
            });
        }

        // Increment the quantity by 1
        const updatedCartItem = await pool.query(
            "UPDATE Carts SET quantity = quantity + 1 WHERE id = $1 RETURNING id, product_id, quantity",
            [cartItemResult.rows[0].id]
        );

        // Fetch the product name for the response
        const productResult = await pool.query(
            "SELECT product_name FROM Products WHERE id = $1",
            [product_id]
        );

        // Return the updated cart item with product name
        res.status(200).json({
            message: `${productResult.rows[0].product_name} quantity has been incremented.`,
            product_id: updatedCartItem.rows[0].product_id,
            quantity: updatedCartItem.rows[0].quantity,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error incrementing cart item quantity",
            error,
        });
    }
};

// Decrement quantity of a product in the cart
const decrementQuantity = async (req, res) => {
    const { product_id } = req.body; // Get product_id from request body
    const user_id = req.user.id; // assuming you have user info from JWT token

    try {
        // Check if the product exists in the user's cart
        const cartItemResult = await pool.query(
            "SELECT id, quantity FROM Carts WHERE user_id = $1 AND product_id = $2",
            [user_id, product_id]
        );

        if (cartItemResult.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found in the cart",
            });
        }

        // If quantity is greater than 1, decrement by 1, else don't allow it to go below 1
        const newQuantity =
            cartItemResult.rows[0].quantity > 1
                ? cartItemResult.rows[0].quantity - 1
                : 1;

        const updatedCartItem = await pool.query(
            "UPDATE Carts SET quantity = $1 WHERE id = $2 RETURNING id, product_id, quantity",
            [newQuantity, cartItemResult.rows[0].id]
        );

        // Fetch the product name for the response
        const productResult = await pool.query(
            "SELECT product_name FROM Products WHERE id = $1",
            [product_id]
        );

        // Return the updated cart item with product name
        res.status(200).json({
            message: `${productResult.rows[0].product_name} quantity has been decremented.`,
            product_id: updatedCartItem.rows[0].product_id,
            quantity: updatedCartItem.rows[0].quantity,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error decrementing cart item quantity",
            error,
        });
    }
};

// Clear all items from the user's cart
const clearCart = async (req, res) => {
    const user_id = req.user.id;

    try {
        await pool.query("DELETE FROM Carts WHERE user_id = $1", [user_id]);
        res.status(200).json({ message: "Cart has been cleared." });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error });
    }
};

// Get the total cost of the items in the user's cart
const getCartTotal = async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `SELECT COALESCE(SUM(p.sales_price * c.quantity), 0) AS total_amount,
            COALESCE(SUM(c.quantity),0) AS total_quantity
			FROM Carts c
			JOIN Products p ON c.product_id = p.id
			WHERE c.user_id = $1`,
            [user_id]
        );

        // Ensure total_amount is a number, even if it's returned as a string
        const totalAmount = parseFloat(result.rows[0].total_amount);
        // Ensure total_quantity is a number, even if it's returned as a string
        const totalQuantity = parseFloat(result.rows[0].total_quantity);

        res.status(200).json({
            total_amount: totalAmount,
            total_quantity: totalQuantity,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart total", error });
    }
};

// Check if a specific product is in the user's cart and return the quantity
const checkCartItemQuantity = async (req, res) => {
    const { product_id } = req.body; // Get product_id from request body
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "SELECT quantity, p.product_name FROM Carts c JOIN Products p ON c.product_id = p.id WHERE c.user_id = $1 AND c.product_id = $2",
            [user_id, product_id]
        );

        if (result.rows.length > 0) {
            const product = result.rows[0];
            res.status(200).json({
                message: `${product.product_name} is in your cart.`,
                product_id: product_id,
                quantity: product.quantity,
            });
        } else {
            res.status(201).json({
                message: "Product not found in your cart.",
                product_id: product_id,
                quantity: 0,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: "Error checking cart item quantity.",
            err,
        });
    }
};

// Get product recommendations based on the items in the user's cart
const getProductRecommendations = async (req, res) => {
    const user_id = req.user.id;

    try {
        // Fetch the product categories of the user's cart items
        const cartProducts = await pool.query(
            "SELECT p.category_id, p.product_name FROM Carts c JOIN Products p ON c.product_id = p.id WHERE c.user_id = $1",
            [user_id]
        );

        if (cartProducts.rows.length === 0) {
            return res.status(404).json({
                message: "No products found in your cart for recommendations.",
            });
        }

        const category_ids = cartProducts.rows.map((row) => row.category_id);

        // Fetch recommended products based on the cart's categories
        const recommendedProducts = await pool.query(
            "SELECT id, product_name, category_id, sales_price FROM Products WHERE category_id = ANY($1::int[]) AND id NOT IN (SELECT product_id FROM Carts WHERE user_id = $2) LIMIT 5",
            [category_ids, user_id]
        );

        if (recommendedProducts.rows.length > 0) {
            res.status(200).json({
                message:
                    "Here are some recommended products based on your cart items:",
                recommendations: recommendedProducts.rows.map((product) => ({
                    product_id: product.id,
                    product_name: product.product_name,
                    category_id: product.category_id,
                    sales_price: product.sales_price,
                })),
            });
        } else {
            res.status(404).json({
                message: "No recommendations found based on your cart items.",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching product recommendations.",
            error: error.message,
        });
    }
};

export {
    getCart,
    updateCart,
    removeItemFromCart,
    addItemToCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    checkCartItemQuantity,
    getProductRecommendations,
};
