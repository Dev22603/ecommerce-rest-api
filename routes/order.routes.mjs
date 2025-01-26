// Backend\routes\order.routes.mjs
import express from "express";
import {
    cancelOrder,
    createOrder,
    getAllOrders,
    getOrderDetails,
    getUserOrders,
    // searchOrdersByDate,
    updateOrderStatus,
} from "../controllers/order.controller.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs";

const router = express.Router();
// Order routes
router.post("/create", authenticate, createOrder);
router.get("/", authenticate, getUserOrders);
// router.get("/filter", authenticate, searchOrdersByDate);
router.get("/:order_id", authenticate, getOrderDetails);
router.delete("/:order_id", authenticate, cancelOrder);
router.patch(
    "/:order_id/status",
    authenticate,
    authorize(["admin"]),
    updateOrderStatus
);
router.get("/admin/all", authenticate, authorize(["admin"]), getAllOrders);

export default router;
