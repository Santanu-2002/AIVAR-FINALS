import express from "express";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const router = express.Router();


const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid User"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};



const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const foundUser = await User.findOne({ email });

        if (foundUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const newUser = new User({
            name,
            email,
            password
        });

        await newUser.save();

        const token = jwt.sign(
            {
                userId: newUser._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            message: "Server Error"
        });
    }
};



router.post("/signup", signUp);
router.post("/login", logIn);

export default router;