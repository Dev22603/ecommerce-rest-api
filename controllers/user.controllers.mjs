// controllers/user.controllers.js
// controllers/user.controllers.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";  // Import the Mongoose User model

// Better signup controller
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Trim inputs
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPassword = password?.trim();

  // Validate name
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
    return res.status(400).json({ error: "Name must be between 2 and 100 characters long" });
  }

  // Validate email
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!trimmedPassword || !passwordRegex.test(trimmedPassword)) {
    return res.status(400).json({ error: "Password must be strong" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Determine role
    const role = trimmedEmail.endsWith("@medkart.in") ? "admin" : "customer";

    // If role is admin, ensure only one admin exists
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(400).json({ error: "An admin already exists" });
      }
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Create new user
    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating user" });
  }
};

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({
      token: token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Find all users
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

export { signup, login, getAllUsers };
