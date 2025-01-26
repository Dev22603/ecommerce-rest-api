// routes/admin.user.routes.mjs
import express from "express";
import { getAllUsers } from '../controllers/user.controllers.mjs';

const router = express.Router();
router.get('/users', getAllUsers);

export default router;

