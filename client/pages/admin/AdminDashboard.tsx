import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { useApp } from "../../context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ClipboardList, IndianRupee, Users, ChefHat, CheckCircle2, RefreshCw } from "lucide-react";

interface ReportSummary {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  statusBreakdown: {
    preparing: number;
    ready: number;
    delivered: number;
    cancelled: number;
  };
}

interface ActiveOrder {
  order_id: string;
  user_name: string;
  user_phone: string;
  items: {
    food_name: string;
    quantity: number;
  }[];
  total_price: number;
  order_status: "Preparing" | "Ready" | "Delivered" | "Cancelled";
  order_date: string;
}

export default function AdminDashboard() {
  const { admin } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReportSummary | null>(null);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (!admin) {
      toast.error("Access denied. Please log in as admin.");
      navigate("/admin/login");
    }
  }, [admin]);

  const loadDashboardData = async () => {
    if (!admin) return;
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/reports");
      const statsData = await statsRes.json();

      // 2. Fetch Active Orders (we can filter from all orders)
      const ordersRes = await fetch("/api/orders");
      const ordersData = await ordersRes.json();

      if (statsRes.ok) setStats(statsData);
      if (ordersRes.ok && Array.isArray(ordersData)) {
        // Filter out completed (Delivered) and Cancelled orders
        const active = ordersData.filter(
          (o) => o.order_status === "Preparing" || o.order_status === "Ready"
        );
        setActiveOrders(active);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Poll data every 10 seconds for canteen display board updates
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, [admin]);

  const updateOrderStatus = async (orderId: string, nextStatus: "Ready" | "Delivered") => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: nextStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `Order status updated to ${nextStatus}`);
        loadDashboardData(); // Reload stats and queue
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with server");
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time canteen order queue and business statistics</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" className="flex items-center space-x-1.5 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live Queue</span>
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales</p>
                <p className="text-2xl font-black text-foreground">₹{stats.totalRevenue}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>

            {/* Orders */}
            <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-black text-foreground">{stats.totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>

            {/* Users */}
            <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Customers</p>
                <p className="text-2xl font-black text-foreground">{stats.activeUsers}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Preparing Queue */}
            <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Queue</p>
                <p className="text-2xl font-black text-foreground">
                  {stats.statusBreakdown.preparing + stats.statusBreakdown.ready}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ChefHat className="h-6 w-6" />
              </div>
            </div>
          </div>
        )}

        {/* Live Queue Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <span>Live Order Queue</span>
            <span className="bg-primary/10 text-primary text-xs font-black rounded-full px-2 py-0.5 animate-pulse">
              {activeOrders.length} Active
            </span>
          </h2>

          {isLoading ? (
            <div className="border border-border bg-card rounded-xl h-60 animate-pulse" />
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm font-semibold">No active orders in the queue!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Incoming orders will show up here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-muted-foreground font-semibold">Ref:</span>
                        <code className="text-xs font-mono font-bold text-primary ml-1">{order.order_id.slice(-6)}</code>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          order.order_status === "Preparing"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="text-xs bg-secondary border border-border/60 rounded-lg p-2.5">
                      <p className="font-bold text-foreground">{order.user_name}</p>
                      <p className="text-foreground/80 mt-0.5">{order.user_phone}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 text-sm border-t border-border border-dashed pt-2">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>{i.food_name}</span>
                          <span className="font-bold text-muted-foreground">x{i.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border border-dashed pt-3 mt-auto">
                    {order.order_status === "Preparing" ? (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.order_id, "Ready")}
                        className="w-full flex items-center justify-center space-x-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Ready for Pickup</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateOrderStatus(order.order_id, "Delivered")}
                        className="w-full flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>Mark Picked Up / Delivered</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
