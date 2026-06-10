import { Router, Request, Response } from "express";
import { FoodItem } from "../models";

const router = Router();

// Get all food items (supports search and category filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const query: any = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.food_name = { $regex: search, $options: "i" };
    }

    const items = await FoodItem.find(query);
    const formattedItems = items.map((item) => ({
      food_id: item._id.toString(),
      food_name: item.food_name,
      category: item.category,
      price: item.price,
      image: item.image,
      description: item.description,
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Fetch food items error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add new food item
router.post("/", async (req: Request, res: Response) => {
  try {
    const { food_name, category, price, image, description } = req.body;

    if (!food_name || !category || price === undefined || !image || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newItem = await FoodItem.create({
      food_name,
      category,
      price: Number(price),
      image,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Food item added successfully!",
      item: {
        food_id: newItem._id.toString(),
        food_name: newItem.food_name,
        category: newItem.category,
        price: newItem.price,
        image: newItem.image,
        description: newItem.description,
      },
    });
  } catch (error) {
    console.error("Add food item error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Edit food item
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { food_name, category, price, image, description } = req.body;

    const updatedItem = await FoodItem.findByIdAndUpdate(
      id,
      {
        food_name,
        category,
        price: Number(price),
        image,
        description,
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Food item updated successfully!",
      item: {
        food_id: updatedItem._id.toString(),
        food_name: updatedItem.food_name,
        category: updatedItem.category,
        price: updatedItem.price,
        image: updatedItem.image,
        description: updatedItem.description,
      },
    });
  } catch (error) {
    console.error("Edit food item error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete food item
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedItem = await FoodItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Food item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Food item deleted successfully!",
    });
  } catch (error) {
    console.error("Delete food item error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
