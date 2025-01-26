// controllers/user.controllers.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/db.mjs";

// better signup
const signup = async (req, res) => {
    // Trim and extract fields
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    console.log({ name, email, password });

    // Validate name
    if (!name || name.length < 2 || name.length > 100) {
        return res.status(400).json({
            error: "Name must be between 2 and 100 characters long",
        });
    }

    // Validate email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            error: "Invalid email format",
        });
    }

    // Validate password
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            error: "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
    }

    // Convert email to lowercase for consistent checks
    const lowerCaseEmail = email.toLowerCase();

    try {
        // Check if a user with this email already exists
        const result = await pool.query(
            "SELECT * FROM Users WHERE email = $1",
            [lowerCaseEmail]
        );
        if (result.rows.length > 0) {
            return res
                .status(400)
                .json({ error: "User with this email already exists" });
        }

        // Determine the role based on email
        let role = lowerCaseEmail.endsWith("@medkart.in")
            ? "admin"
            : "customer";

        // If role is 'admin', ensure only one admin can exist
        if (role === "admin") {
            const adminExists = await pool.query(
                "SELECT * FROM Users WHERE role = $1",
                ["admin"]
            );
            if (adminExists.rows.length > 0) {
                return res
                    .status(400)
                    .json({ error: "An admin already exists" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const newUser = await pool.query(
            "INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
            [name, lowerCaseEmail, hashedPassword, role]
        );
        const user = newUser.rows[0];

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating user" });
    }
};

// Login controller
const login = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    try {
        const result = await pool.query(
            "SELECT * FROM Users WHERE email = $1",
            [email]
        );
        const user = result.rows[0];
        console.log(req.body);

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3h",
            }
        );
        console.log("token");

        res.status(200).json({
            token: token,
            role: user.role,
            name: user.name,
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Users");
        const users = result.rows;
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users" });
    }
};

export { signup, login, getAllUsers };
