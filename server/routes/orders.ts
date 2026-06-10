import { Router, Request, Response } from "express";
import { Order } from "../models";

const router = Router();

// Place order
router.post("/", async (req: Request, res: Response) => {
  try {
    const { user_id, items, total_price } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0 || !total_price) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const order = await Order.create({
      user_id,
      items: items.map((item: any) => ({
        food_id: item.food_id,
        food_name: item.food_name,
        quantity: item.quantity,
        price: item.price,
      })),
      total_price: Number(total_price),
      order_status: "Preparing",
      order_date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        order_id: order._id.toString(),
        user_id: order.user_id.toString(),
        total_price: order.total_price,
        order_status: order.order_status,
        order_date: order.order_date,
        items: order.items,
      },
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all orders (Admin only)
router.get("/", async (req: Request, res: Response) => {
  try {
    // Populate user details for admin list
    const orders = await Order.find().sort({ order_date: -1 }).populate("user_id", "name email phone");
    const formattedOrders = orders.map((order: any) => ({
      order_id: order._id.toString(),
      user_id: order.user_id ? order.user_id._id.toString() : "Unknown",
      user_name: order.user_id ? order.user_id.name : "Unknown",
      user_phone: order.user_id ? order.user_id.phone : "Unknown",
      items: order.items,
      total_price: order.total_price,
      order_status: order.order_status,
      order_date: order.order_date.toISOString(),
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get orders for a specific user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user_id: userId }).sort({ order_date: -1 });

    const formattedOrders = orders.map((order) => ({
      order_id: order._id.toString(),
      user_id: order.user_id.toString(),
      items: order.items,
      total_price: order.total_price,
      order_status: order.order_status,
      order_date: order.order_date.toISOString(),
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Fetch user orders error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get details of a specific order
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user_id", "name email phone");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const orderData: any = order.toObject();
    res.status(200).json({
      order_id: order._id.toString(),
      user_id: orderData.user_id ? orderData.user_id._id.toString() : "Unknown",
      user_name: orderData.user_id ? orderData.user_id.name : "Unknown",
      user_phone: orderData.user_id ? orderData.user_id.phone : "Unknown",
      items: orderData.items,
      total_price: orderData.total_price,
      order_status: orderData.order_status,
      order_date: orderData.order_date.toISOString(),
    });
  } catch (error) {
    console.error("Fetch order details error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update order status
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!["Preparing", "Ready", "Delivered", "Cancelled"].includes(order_status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // User cancellation check: can only cancel if status is currently "Preparing"
    if (order_status === "Cancelled" && order.order_status !== "Preparing") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled once preparation has started or is completed.",
      });
    }

    order.order_status = order_status;
    await order.save();

    let userMessage = "";
    if (order_status === "Cancelled") {
      userMessage = "Your order has been cancelled successfully.";
    } else if (order_status === "Ready") {
      userMessage = "Your order is now Ready for Pickup.";
    } else if (order_status === "Preparing") {
      userMessage = "Your order is now being Prepared.";
    } else if (order_status === "Delivered") {
      userMessage = "Your order has been Delivered successfully.";
    }

    res.status(200).json({
      success: true,
      message: userMessage || "Order status updated successfully!",
      order: {
        order_id: order._id.toString(),
        order_status: order.order_status,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
