// Backend\controllers\product.controller.mjs

import { pool } from "../db/db.mjs";
import multer from "multer";
import path from "path";

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype =
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/webp";

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(
            new Error("Only .jpeg, .jpg, .png, and .webp files are allowed!"),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter,
}).array("images", 5);
// Limit to 5 images

const createProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error uploading images." });
        }
        console.log(req.body);
        console.log(req.files);

        try {
            const product_name = req.body.product_name?.trim();
            const ws_code = parseInt(req.body.ws_code?.trim(), 10); // Convert to integer after trimming
            const sales_price = parseInt(req.body.sales_price?.trim(), 10); // Convert to integer after trimming
            const mrp = parseInt(req.body.mrp?.trim(), 10); // Convert to integer after trimming
            const package_size = parseInt(req.body.package_size?.trim(), 10); // Convert to integer after trimming
            const tags = req.body.tags.split(",").map((tag) => tag.trim());
            const category_id = parseInt(req.body.category_id?.trim(), 10); // Convert to integer after trimming
            const stock = parseInt(req.body.stock?.trim(), 10); // Convert to integer after trimming

            if (!product_name) {
                return res
                    .status(400)
                    .json({ message: "Product name is required." });
            }
            if (!ws_code) {
                return res
                    .status(400)
                    .json({ message: "WS Code is required." });
            }
            if (ws_code <= 0) {
                return res.status(400).json({
                    message: "WS Code cannot be less than or equal to 0.",
                });
            }
            if (sales_price <= 0) {
                return res.status(400).json({
                    message: "Sales Price cannot be less than or equal to 0.",
                });
            }
            if (mrp <= 0) {
                return res.status(400).json({
                    message: "MRP cannot be less than or equal to 0.",
                });
            }
            if (package_size <= 0) {
                return res.status(400).json({
                    message: "Package Size cannot be less than or equal to 0.",
                });
            }
            if (category_id <= 0) {
                return res.status(400).json({
                    message: "Category ID cannot be less than or equal to 0.",
                });
            }
            const categoryExists = await pool.query(
                "SELECT * FROM Categories WHERE id = $1",
                [category_id]
            );
            if (categoryExists.rows.length == 0) {
                return res
                    .status(400)
                    .json({ error: "Category does not exist" });
            }
            if (!sales_price) {
                return res
                    .status(400)
                    .json({ message: "Sales Price is required." });
            }
            if (!mrp) {
                return res.status(400).json({ message: "MRP is required." });
            }
            if (!package_size) {
                return res
                    .status(400)
                    .json({ message: "Package Size is required." });
            }
            if (!category_id) {
                return res
                    .status(400)
                    .json({ message: "Category ID is required." });
            }
            if (!stock) {
                return res.status(400).json({ message: "Stock is required." });
            }
            if (stock < 0) {
                return res
                    .status(400)
                    .json({ message: "Stock cannot be less than 0." });
            }
            if (tags.length === 0) {
                return res.status(400).json({ message: "Tags are required." });
            }

            const imageURLs = req.files
                ? req.files.map((file) => `/uploads/${file.filename}`)
                : [];

            if (imageURLs.length === 0) {
                return res
                    .status(400)
                    .json({ message: "At least one image is required." });
            }

            const result = await pool.query(
                "INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
                [
                    product_name,
                    ws_code,
                    sales_price,
                    mrp,
                    package_size,
                    imageURLs, // Array of image URLs
                    tags, // PostgreSQL expects an array
                    category_id,
                    stock,
                ]
            );

            res.status(201).json({
                message: "Product added successfully",
                data: result.rows[0],
            });
        } catch (err) {
            console.error(err);

            // Check for unique constraint violation on ws_code
            if (err.code === "23505") {
                return res.status(400).json({
                    message:
                        "Product code (ws_code) already exists. Please provide a unique ws_code.",
                });
            }

            // Handle other errors
            res.status(500).json({ message: "Error creating product", err });
        }
    });
};

const getProductsByName = async (req, res) => {
    const { product_name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Fetch products by name with pagination
        const result = await pool.query(
            "SELECT * FROM Products WHERE product_name ILIKE $1 LIMIT $2 OFFSET $3",
            [`%${product_name}%`, limit, offset]
        );

        const totalCountResult = await pool.query(
            "SELECT COUNT(*) FROM Products WHERE product_name ILIKE $1",
            [`%${product_name}%`]
        );
        const totalCount = parseInt(totalCountResult.rows[0].count, 10);

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "No products found matching the name" });
        }

        res.status(200).json({
            products: result.rows,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching products by name" });
        console.error(err);
    }
};

const getProductsByWsCode = async (req, res) => {
    const { ws_code } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Fetch products by ws_code with pagination
        const result = await pool.query(
            "SELECT * FROM Products WHERE CAST(ws_code AS TEXT) ILIKE $1 LIMIT $2 OFFSET $3",
            [`%${ws_code}%`, limit, offset]
        );

        const totalCountResult = await pool.query(
            "SELECT COUNT(*) FROM Products WHERE CAST(ws_code AS TEXT) ILIKE $1",
            [`%${ws_code}%`]
        );
        const totalCount = parseInt(totalCountResult.rows[0].count, 10);

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "No products found matching the ws_code" });
        }

        res.status(200).json({
            products: result.rows,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching products by ws_code" });
        console.error(err);
    }
};
const getProductsByCategory = async (req, res) => {
    const { category_id } = req.params;
    console.log(category_id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Fetch products by ws_code with pagination
        const result = await pool.query(
            "SELECT * FROM Products WHERE category_id = $1 LIMIT $2 OFFSET $3",
            [category_id, limit, offset]
        );

        const totalCountResult = await pool.query(
            "SELECT COUNT(*) FROM Products WHERE category_id = $1",
            [category_id]
        );
        const totalCount = parseInt(totalCountResult.rows[0].count, 10);

        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ error: "No products found matching the category" });
        }

        res.status(200).json({
            products: result.rows,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching products by category" });
        console.error(err);
    }
};

const createCategory = async (req, res) => {
    const { category_name } = req.body.category_name?.trim().toLowerCase();
    try {
        const categoryExists = await pool.query(
            "SELECT * FROM Categories WHERE category_name = $1",
            [category_name]
        );
        if (categoryExists.rows.length > 0) {
            return res.status(400).json({ error: "Category already exists" });
        }
        const result = await pool.query(
            "INSERT INTO Categories (category_name) VALUES ($1) RETURNING *",
            [category_name]
        );
        const category = result.rows[0];
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: "Error creating category" });
        console.log(err);
    }
};

const getAllProducts = async (req, res) => {
    try {
        // Extract page and limit from query parameters, default to page=1, limit=10 if not provided
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the offset for the query
        const offset = (page - 1) * limit;

        // Fetch the products with pagination
        const result = await pool.query(
            "SELECT * FROM Products LIMIT $1 OFFSET $2",
            [limit, offset]
        );

        // Fetch total count for pagination information
        const totalCountResult = await pool.query(
            "SELECT COUNT(*) FROM Products"
        );
        const totalCount = parseInt(totalCountResult.rows[0].count, 10);

        // Send response with data and pagination info
        res.status(200).json({
            products: result.rows,
            totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching products" });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Products WHERE id = $1",
            [id]
        );
        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: "Error fetching product" });
    }
};

const getCategories = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Categories");
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching categories" });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM Products WHERE id = $1 RETURNING *",
            [id]
        );
        const product = result.rows[0];

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting product" });
    }
};
// NEW
// const updateProduct = async (req, res) => {
//     const { id } = req.params;
//     console.log(id);

//     upload(req, res, async (err) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ message: "Error uploading images." });
//         }

//         try {
//             const product_name = req.body.product_name?.trim();
//             const ws_code = parseInt(req.body.ws_code?.trim(), 10); // Convert to integer after trimming
//             const sales_price = parseInt(req.body.sales_price?.trim(), 10); // Convert to integer after trimming
//             const mrp = parseInt(req.body.mrp?.trim(), 10); // Convert to integer after trimming
//             const package_size = parseInt(req.body.package_size?.trim(), 10); // Convert to integer after trimming
//             const tags = req.body.tags.split(",").map((tag) => tag.trim());
//             const category_id = parseInt(req.body.category_id?.trim(), 10); // Convert to integer after trimming
//             const stock = parseInt(req.body.stock?.trim(), 10); // Convert to integer after trimming
//             const existingImages = req.body.existingImages?.trim();

//             if (!product_name) {
//                 return res
//                     .status(400)
//                     .json({ message: "Product name is required." });
//             }
//             if (!ws_code) {
//                 return res
//                     .status(400)
//                     .json({ message: "WS Code is required." });
//             }
//             if (!sales_price) {
//                 return res
//                     .status(400)
//                     .json({ message: "Sales Price is required." });
//             }
//             if (!mrp) {
//                 return res.status(400).json({ message: "MRP is required." });
//             }
//             if (!package_size) {
//                 return res
//                     .status(400)
//                     .json({ message: "Package Size is required." });
//             }
//             if (!category_id) {
//                 return res
//                     .status(400)
//                     .json({ message: "Category ID is required." });
//             }
//             if (!stock) {
//                 return res.status(400).json({ message: "Stock is required." });
//             }
//             if (tags.length === 0) {
//                 return res.status(400).json({ message: "Tags are required." });
//             }

//             const imageURLs = req.files
//                 ? req.files.map((file) => `/uploads/${file.filename}`)
//                 : [];

//             if (imageURLs.length === 0) {
//                 return res
//                     .status(400)
//                     .json({ message: "At least one image is required." });
//             }

//             const images = req.files
//                 ? req.files.map((file) => `/uploads/${file.filename}`)
//                 : [];
//             console.log(existingImages);

//             if (images.length === 0) {
//                 return res
//                     .status(400)
//                     .json({ message: "At least one image is required." });
//             }

//             console.log([
//                 product_name,
//                 ws_code,
//                 sales_price,
//                 mrp,
//                 package_size,
//                 images,
//                 tags,
//                 category_id,
//                 stock,
//                 id,
//             ]);

//             const result = await pool.query(
//                 "UPDATE Products SET product_name = $1, ws_code = $2, sales_price = $3, mrp = $4, package_size = $5, images = $6, tags = $7, category_id = $8, stock = $9 WHERE id = $10 RETURNING *",
//                 [
//                     product_name,
//                     ws_code,
//                     sales_price,
//                     mrp,
//                     package_size,
//                     images,
//                     tags,
//                     category_id,
//                     stock,
//                     id,
//                 ]
//             );

//             res.status(201).json(result.rows[0]);
//         } catch (err) {
//             console.error(err);
//             res.status(500).json({
//                 message: "Error creating product",
//                 error: err,
//             });
//         }
//     });
// };
// OLD
const updateProduct = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error uploading images." });
        }

        try {
            const {
                product_name,
                ws_code,
                sales_price,
                mrp,
                package_size,
                tags, // Received as a string, e.g., '["astro","sports"]'
                category_id,
                stock,
                existingImages,
            } = req.body;
            // Parse tags into an array if it's a JSON string
            const parsedTags = tags.split(",");

            const images = req.files
                ? req.files.map((file) => `/uploads/${file.filename}`)
                : [];
            console.log(existingImages);

            if (images.length === 0) {
                return res
                    .status(400)
                    .json({ message: "At least one image is required." });
            }

            console.log([
                product_name,
                ws_code,
                sales_price,
                mrp,
                package_size,
                images,
                parsedTags,
                category_id,
                stock,
                id,
            ]);

            const result = await pool.query(
                "UPDATE Products SET product_name = $1, ws_code = $2, sales_price = $3, mrp = $4, package_size = $5, images = $6, tags = $7, category_id = $8, stock = $9 WHERE id = $10 RETURNING *",
                [
                    product_name,
                    ws_code,
                    sales_price,
                    mrp,
                    package_size,
                    images,
                    parsedTags,
                    category_id,
                    stock,
                    id,
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Error creating product",
                error: err,
            });
        }
    });
};
export {
    createProduct,
    createCategory,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    getProductsByName,
    getProductsByWsCode,
    getCategories,
    getProductsByCategory,
};
