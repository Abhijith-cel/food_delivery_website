import { Router, Request, Response } from "express";
import { User } from "../models";

const router = Router();

// Get all users (Admin only)
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, "name email phone createdAt").sort({ createdAt: -1 });
    const formattedUsers = users.map((user) => ({
      user_id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    }));
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Fetch all users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update user profile (Name & Phone)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        user_id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
