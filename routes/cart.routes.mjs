// routes/cart.routes.mjs
import express from "express";
import {
    addItemToCart,
    checkCartItemQuantity,
    clearCart,
    decrementQuantity,
    getCart,
    getCartTotal,
    getProductRecommendations,
    incrementQuantity,
    removeItemFromCart,
    updateCart,
} from "../controllers/cart.controllers.mjs";
import { authenticate } from "../middlewares/auth.mjs";

const router = express.Router();

// Add item to cart (protected route)
router.post("/add", authenticate, addItemToCart);
router.get("/", authenticate, getCart);
router.put("/update", authenticate, updateCart);
router.delete("/remove/:product_id", authenticate, removeItemFromCart);
router.patch("/increment", authenticate, incrementQuantity); // Increment quantity route (with product_id in body)
router.patch("/decrement", authenticate, decrementQuantity); // Decrement quantity route (with product_id in body)
router.post("/check-quantity", authenticate, checkCartItemQuantity); // Route to check the quantity of a specific product in the user's cart
router.get("/recommendations", authenticate, getProductRecommendations); // Route to get product recommendations based on the user's cart
router.delete("/clear", authenticate, clearCart); // Route to clear all items from the user's cart
router.get("/total", authenticate, getCartTotal); // Route to get the total price of all items in the user's cart

export default router;
