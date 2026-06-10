/**
 * Shared interfaces and types between client and server
 */

export interface UserType {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface FoodItemType {
  food_id: string;
  food_name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export interface OrderItemType {
  food_id: string;
  food_name: string;
  quantity: number;
  price: number;
}

export interface OrderType {
  order_id: string;
  user_id: string;
  items: OrderItemType[];
  total_price: number;
  order_status: "Preparing" | "Ready" | "Delivered" | "Cancelled";
  order_date: string;
}

export interface AdminType {
  admin_id: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserType;
  admin?: AdminType;
}

export interface DashboardReportResponse {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  statusBreakdown: {
    preparing: number;
    ready: number;
    delivered: number;
    cancelled: number;
  };
  popularItems: {
    food_name: string;
    orderCount: number;
    totalRevenue: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
  }[];
}
