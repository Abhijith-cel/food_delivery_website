import { Router, Request, Response } from "express";
import { Order, User, FoodItem } from "../models";

const router = Router();

// Get dashboard reports
router.get("/", async (req: Request, res: Response) => {
  try {
    // 1. Counts
    const totalOrders = await Order.countDocuments();
    const activeUsers = await User.countDocuments();

    // 2. Revenue (Only count delivered orders as revenue, or count all completed/preparing/ready? Standard is to count everything except Cancelled)
    const revenueResult = await Order.aggregate([
      { $match: { order_status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Status Breakdown
    const preparing = await Order.countDocuments({ order_status: "Preparing" });
    const ready = await Order.countDocuments({ order_status: "Ready" });
    const delivered = await Order.countDocuments({ order_status: "Delivered" });
    const cancelled = await Order.countDocuments({ order_status: "Cancelled" });

    // 4. Popular Items (Aggregation on Order items)
    const popularItemsResult = await Order.aggregate([
      { $match: { order_status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.food_name",
          orderCount: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
    ]);

    const popularItems = popularItemsResult.map((item) => ({
      food_name: item._id,
      orderCount: item.orderCount,
      totalRevenue: item.totalRevenue,
    }));

    // 5. Revenue by Category
    // Mongoose query or aggregation by linking with food items categories
    // Since we store item copies, let's look up food item categories.
    // However, an easy aggregation is to query all food items, map category, and aggregate order items.
    // Let's do a simple scan in JS if size is small, or use aggregation.
    // For simplicity, we can load food items to resolve their categories,
    // or just aggregate. Let's load food items to query categories for the items ordered.
    const allFoodItems = await FoodItem.find({}, "food_name category");
    const foodCategoryMap = new Map<string, string>();
    allFoodItems.forEach((f) => {
      foodCategoryMap.set(f.food_name, f.category);
    });

    const categoryRevenueMap: { [key: string]: number } = {};
    const nonCancelledOrders = await Order.find({ order_status: { $ne: "Cancelled" } });

    nonCancelledOrders.forEach((order) => {
      order.items.forEach((item) => {
        const category = foodCategoryMap.get(item.food_name) || "Other";
        categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + item.price * item.quantity;
      });
    });

    const revenueByCategory = Object.keys(categoryRevenueMap).map((cat) => ({
      category: cat,
      revenue: categoryRevenueMap[cat],
    }));

    res.status(200).json({
      totalOrders,
      totalRevenue,
      activeUsers,
      statusBreakdown: {
        preparing,
        ready,
        delivered,
        cancelled,
      },
      popularItems,
      revenueByCategory,
    });
  } catch (error) {
    console.error("Fetch reports error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
