// Backend\controllers\order.controller.mjs
import { pool } from "../db/db.mjs";

// Create order from cart
const createOrder = async (req, res) => {
    const user_id = req.user.id; // assuming you have user info from JWT token
    try {
        // Start a transaction
        await pool.query("BEGIN");
        // Calculate total amount from the cart
        const totalAmountResult = await pool.query(
            `SELECT COALESCE(SUM(p.sales_price * c.quantity), 0) AS total_amount
             FROM Carts c
             JOIN Products p ON c.product_id = p.id
             WHERE c.user_id = $1`,
            [user_id]
        );

        const total_amount = parseFloat(totalAmountResult.rows[0].total_amount);

        // Create the order
        const orderResult = await pool.query(
            "INSERT INTO Orders (user_id, total_amount) VALUES ($1, $2) RETURNING id",
            [user_id, total_amount]
        );
        const order_id = orderResult.rows[0].id;

        // Get the items from the user's cart
        const cartItems = await pool.query(
            "SELECT product_id, quantity FROM Carts WHERE user_id = $1",
            [user_id]
        );

        if (cartItems.rows.length === 0) {
            // If the cart is empty, rollback the transaction
            await pool.query("ROLLBACK");
            return res
                .status(400)
                .json({ message: "Cart is empty. Cannot create an order." });
        }

        // Insert items into Order_Items
        for (const item of cartItems.rows) {
            const priceResult = await pool.query(
                "SELECT sales_price FROM Products WHERE id = $1",
                [item.product_id]
            );
            const price = parseFloat(priceResult.rows[0].sales_price);

            await pool.query(
                "INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [order_id, item.product_id, item.quantity, price]
            );
        }

        // Clear the user's cart
        await pool.query("DELETE FROM Carts WHERE user_id = $1", [user_id]);

        // Commit the transaction
        await pool.query("COMMIT");

        res.status(201).json({
            message: "Order created successfully",
            order_id,
        });
    } catch (error) {
        // Rollback the transaction in case of an error
        await pool.query("ROLLBACK");
        res.status(500).json({
            message: "Error creating order",
            error: error.message,
        });
    }
};

// Get user's orders v2 pagination
const getUserOrders = async (req, res) => {
    const user_id = req.user.id; // Assuming the user info is provided by JWT token
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    try {
        // Validate page and limit
        const validatedPage = Math.max(1, parseInt(page, 10) || 1);
        const validatedLimit = Math.max(1, parseInt(limit, 10) || 10);
        const offset = (validatedPage - 1) * validatedLimit;

        // Query to get total orders count for pagination
        const totalCountResult = await pool.query(
            `SELECT COUNT(*) FROM Orders WHERE user_id = $1`,
            [user_id]
        );
        const totalCount = parseInt(totalCountResult.rows[0].count, 10);

        // Query to fetch the user's paginated orders with order details
        const result = await pool.query(
            `SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at,
                    oi.product_id, oi.quantity, p.product_name, oi.price AS product_price
             FROM Orders o
             JOIN Order_Items oi ON o.id = oi.order_id
             JOIN Products p ON oi.product_id = p.id
             WHERE o.user_id = $1
             ORDER BY o.created_at DESC
             LIMIT $2 OFFSET $3`,
            [user_id, validatedLimit, offset]
        );

        // If no orders are found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        // Group orders by order_id and accumulate order items under each order
        const orders = result.rows.reduce((acc, row) => {
            const existingOrder = acc.find(
                (order) => order.order_id === row.order_id
            );
            if (existingOrder) {
                existingOrder.order_items.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    quantity: row.quantity,
                    sales_price: parseFloat(row.product_price),
                });
            } else {
                acc.push({
                    order_id: row.order_id,
                    user_id: row.user_id,
                    total_amount: parseFloat(row.total_amount),
                    created_at: new Date(row.created_at).toLocaleDateString(
                        "en-GB"
                    ),
                    order_items: [
                        {
                            product_id: row.product_id,
                            product_name: row.product_name,
                            quantity: row.quantity,
                            sales_price: parseFloat(row.product_price),
                        },
                    ],
                });
            }
            return acc;
        }, []);

        // Respond with paginated orders and metadata
        res.status(200).json({
            page: validatedPage,
            limit: validatedLimit,
            total_count: totalCount,
            total_pages: Math.ceil(totalCount / validatedLimit),
            orders: orders,
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({
            message: "An error occurred while fetching user orders",
        });
    }
};

const getOrderDetails = async (req, res) => {
    const { order_id } = req.params;

    try {
        const orderDetails = await pool.query(
            `SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at, 
                    oi.product_id, oi.quantity, p.product_name, oi.price AS product_price
             FROM Orders o
             JOIN Order_Items oi ON o.id = oi.order_id
             JOIN Products p ON oi.product_id = p.id
             WHERE o.id = $1`,
            [order_id]
        );

        if (orderDetails.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Extract the general order details (same for all rows)
        const {
            order_id: id,
            user_id,
            total_amount,
            created_at,
        } = orderDetails.rows[0];

        // Format the created_at date as dd/mm/yyyy
        const formattedDate = new Date(created_at).toLocaleDateString("en-GB");

        // Transform the data to group items under the order
        const response = {
            order_id: id,
            user_id,
            total_amount: parseFloat(total_amount),
            created_at: formattedDate,
            order_items: orderDetails.rows.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                sales_price: parseFloat(item.product_price),
            })),
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching order details",
            error,
        });
    }
};
const cancelOrder = async (req, res) => {
    const { order_id } = req.params;
    const user_id = req.user.id;

    try {
        // Check if the order exists and belongs to the user
        const orderCheck = await pool.query(
            "SELECT id FROM Orders WHERE id = $1 AND user_id = $2",
            [order_id, user_id]
        );

        if (orderCheck.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Order not found or access denied" });
        }
        const orderStatus = orderCheck.rows[0].status; // Retrieve the status of the order

        if (orderStatus !== "Pending") {
            return res
                .status(400)
                .json({ message: "Cannot cancel order that is not pending." });
        }

        // Delete the order and related items
        await pool.query("DELETE FROM Order_Items WHERE order_id = $1", [
            order_id,
        ]);
        await pool.query("DELETE FROM Orders WHERE id = $1", [order_id]);

        res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling order", error });
    }
};

const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    // List of valid statuses (same as the ENUM in the database)
    const validStatuses = ["Pending", "Shipped", "Completed", "Cancelled"];

    // Check if the provided status is valid
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message:
                "Invalid status. Allowed values are: Pending, Shipped, Completed, Cancelled.",
        });
    }

    try {
        // Update the order status
        const result = await pool.query(
            "UPDATE Orders SET status = $1 WHERE id = $2 RETURNING *",
            [status, order_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating order status", error });
    }
};

// Get All Orders (Admin Only) v2
const getAllOrders = async (req, res) => {
    let { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    // Validate page and limit to ensure they are numbers and positive
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ message: "Invalid page number" });
    }

    if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: "Invalid limit number" });
    }

    try {
        // Calculate offset based on page and limit
        const offset = (page - 1) * limit;

        // Query to fetch orders with user details, order items, and product details
        const result = await pool.query(
            `SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at, 
                    u.name AS user_name, o.status,
                    oi.product_id, oi.quantity, oi.price AS item_price, p.product_name
             FROM Orders o
             JOIN Users u ON o.user_id = u.id
             JOIN Order_Items oi ON o.id = oi.order_id
             JOIN Products p ON oi.product_id = p.id
             ORDER BY o.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Query to fetch total number of orders for pagination
        const totalCountResult = await pool.query(
            `SELECT COUNT(DISTINCT o.id) AS total_orders
             FROM Orders o`
        );

        const totalOrders = parseInt(totalCountResult.rows[0].total_orders, 10);

        const totalPages = Math.ceil(totalOrders / limit);

        // If no orders are found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        // Group orders by user_id and then by order_id, accumulating order items under each order
        const users = result.rows.reduce((acc, row) => {
            // If the user already exists, we check for the order and add the item to it
            const existingUser = acc.find(
                (user) => user.user_id === row.user_id
            );
            if (existingUser) {
                // If the order already exists, add the item to its order_items
                const existingOrder = existingUser.orders.find(
                    (order) => order.order_id === row.order_id
                );
                if (existingOrder) {
                    existingOrder.order_items.push({
                        product_id: row.product_id,
                        product_name: row.product_name,
                        quantity: row.quantity,
                        sales_price: parseFloat(row.item_price),
                    });
                } else {
                    // If the order does not exist, create a new order and add the item
                    existingUser.orders.push({
                        order_id: row.order_id,
                        total_amount: parseFloat(row.total_amount),
                        created_at: new Date(row.created_at).toLocaleDateString(
                            "en-GB"
                        ),
                        status: row.status,
                        order_items: [
                            {
                                product_id: row.product_id,
                                product_name: row.product_name,
                                quantity: row.quantity,
                                sales_price: parseFloat(row.item_price),
                            },
                        ],
                    });
                }
            } else {
                // If the user doesn't exist, create a new user entry
                acc.push({
                    user_id: row.user_id,
                    user_name: row.user_name,
                    orders: [
                        {
                            order_id: row.order_id,
                            total_amount: parseFloat(row.total_amount),
                            created_at: new Date(
                                row.created_at
                            ).toLocaleDateString("en-GB"),
                            status: row.status,
                            order_items: [
                                {
                                    product_id: row.product_id,
                                    product_name: row.product_name,
                                    quantity: row.quantity,
                                    sales_price: parseFloat(row.item_price),
                                },
                            ],
                        },
                    ],
                });
            }
            return acc;
        }, []);

        // Respond with the paginated orders grouped by user_id
        res.status(200).json({
            page: page,
            limit: limit,
            totalOrders: totalOrders,
            totalPages: totalPages,
            users: users,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching all orders",
            error,
        });
    }
};

export {
    createOrder,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    updateOrderStatus,
    getAllOrders,
};
