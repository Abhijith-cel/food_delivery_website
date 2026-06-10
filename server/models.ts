import mongoose, { Schema } from "mongoose";
import crypto from "node:crypto";

// Password Hashing Utility using Node built-in crypto
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// -------------------------------------------------------------
// 1. User Schema & Model
// -------------------------------------------------------------
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual("user_id").get(function () {
  return this._id.toString();
});

export const User = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;

// -------------------------------------------------------------
// 2. Food Item Schema & Model
// -------------------------------------------------------------
const FoodItemSchema = new Schema(
  {
    food_name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "food_items",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

FoodItemSchema.virtual("food_id").get(function () {
  return this._id.toString();
});

export const FoodItem = (mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema)) as any;

// -------------------------------------------------------------
// 3. Order Schema & Model
// -------------------------------------------------------------
const OrderItemSchema = new Schema({
  food_id: { type: Schema.Types.ObjectId, ref: "FoodItem", required: true },
  food_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    total_price: { type: Number, required: true },
    order_status: {
      type: String,
      enum: ["Preparing", "Ready", "Delivered", "Cancelled"],
      default: "Preparing",
    },
    order_date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "orders",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.virtual("order_id").get(function () {
  return this._id.toString();
});

export const Order = (mongoose.models.Order || mongoose.model("Order", OrderSchema)) as any;

// -------------------------------------------------------------
// 4. Admin Schema & Model
// -------------------------------------------------------------
const AdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "admin",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AdminSchema.virtual("admin_id").get(function () {
  return this._id.toString();
});

export const Admin = (mongoose.models.Admin || mongoose.model("Admin", AdminSchema)) as any;

// -------------------------------------------------------------
// Database Seeding function
// -------------------------------------------------------------
export async function seedDatabase() {
  try {
    // 1. Seed Admin
    const hasNewAdmin = await Admin.findOne({ username: "admin@gmail.com" });
    if (!hasNewAdmin) {
      const hashedPassword = hashPassword("admin123");
      await Admin.deleteOne({ username: "admin" }); // Clean up the old one
      await Admin.create({
        username: "admin@gmail.com",
        password: hashedPassword,
      });
      console.log("Database seeded: Default admin user created (admin@gmail.com / admin123).");
    }

    // 2. Seed Food Items
    const foodCount = await FoodItem.countDocuments();
    if (foodCount === 0) {
      const defaultItems = [
        {
          food_name: "Cheese Veg Burger",
          category: "Snacks",
          price: 90,
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
          description: "Crispy vegetable patty, cheddar slice, fresh tomato, onion, lettuce and house sauce in soft buns.",
        },
        {
          food_name: "Margherita Pizza",
          category: "Snacks",
          price: 150,
          image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60",
          description: "Classic pizza topped with tomato sauce, premium fresh mozzarella cheese, and sweet basil leaves.",
        },
        {
          food_name: "Grilled Club Sandwich",
          category: "Snacks",
          price: 80,
          image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60",
          description: "Three layers of toasted bread loaded with vegetables, cheese, and creamy herb mayonnaise.",
        },
        {
          food_name: "Schezwan Veg Noodles",
          category: "Lunch",
          price: 100,
          image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
          description: "Spicy stir-fried noodles cooked with colorful crunchy vegetables and hot Schezwan sauce.",
        },
        {
          food_name: "Special Lunch Thali",
          category: "Lunch",
          price: 180,
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
          description: "A wholesome traditional meal including paneer butter masala, dal fry, jeera rice, 2 rotis, salad and sweet.",
        },
        {
          food_name: "Iced Cold Coffee",
          category: "Drinks",
          price: 60,
          image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
          description: "Rich blended creamy cold coffee topped with vanilla ice cream and chocolate powder drizzle.",
        },
        {
          food_name: "Special Masala Tea",
          category: "Drinks",
          price: 20,
          image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
          description: "Warm and aromatic milk tea brewed with crushed ginger, green cardamom, cloves, and black pepper.",
        },
      ];
      await FoodItem.insertMany(defaultItems as any);
      console.log(`Database seeded: Created ${defaultItems.length} default food items.`);
    }
  } catch (error) {
    console.error("Database seeding error:", error);
  }
}
