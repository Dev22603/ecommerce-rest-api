// Backend\routes\product.routes.mjs
import express from "express";
import {
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
} from "../controllers/product.controller.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs";
const router = express.Router();

router.get("/id/:id", getProductById);
router.get("/", getAllProducts);
router.get("/categories", authenticate, authorize(["admin"]), getCategories);
router.get("/product_name/:product_name", getProductsByName); //customer end
router.get("/ws_code/:ws_code", getProductsByWsCode); //customer end
router.get("/category_id/:category_id", getProductsByCategory); //customer end

router.post("/", authenticate, authorize(["admin"]), createProduct);
router.delete("/:id", authenticate, authorize(["admin"]), deleteProduct);
router.put("/:id", authenticate, authorize(["admin"]), updateProduct);
router.post("/newCategory", authenticate, authorize(["admin"]), createCategory);

export default router;
