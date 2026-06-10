import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Eye, AlertTriangle, ArrowRight } from "lucide-react";
import { OrderType } from "@shared/api";

export default function OrderHistory() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/orders/user/${user.user_id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view order history");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: "Cancelled" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to cancel order");
      } else {
        toast.success(data.message || "Order cancelled successfully.");
        // Update state locally
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.order_id === orderId ? { ...o, order_status: "Cancelled" } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with server");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Preparing":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Ready":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "Delivered":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "Cancelled":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Order History</h1>
          <p className="text-sm text-muted-foreground mt-1">Track past and current orders, cancel orders before preparation starts</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="border border-border bg-card rounded-xl h-44 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed space-y-4 max-w-lg mx-auto">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">No orders yet</h2>
              <p className="text-sm text-muted-foreground">You haven't placed any food orders yet.</p>
            </div>
            <Button asChild className="rounded-lg">
              <Link to="/menu" className="flex items-center space-x-2">
                <span>View Menu</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-card border border-border rounded-xl p-6 transition-all hover:shadow-md space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Order Ref:</span>
                    <span className="font-mono text-xs text-primary font-bold ml-1">{order.order_id}</span>
                    <p className="text-xs text-muted-foreground">
                      Date: {new Date(order.order_date).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                    <span className="text-lg font-extrabold text-foreground">₹{order.total_price}</span>
                  </div>
                </div>

                {/* Body - Items list */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Items Ordered:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item) => (
                      <div key={item.food_id} className="flex justify-between border-b border-border border-dashed pb-1 text-sm">
                        <span className="text-foreground">{item.food_name} <strong className="text-xs text-muted-foreground">x{item.quantity}</strong></span>
                        <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer - Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
                  {order.order_status === "Preparing" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.order_id)}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      <span>Cancel Order</span>
                    </Button>
                  )}

                  <Button size="sm" asChild className="rounded-lg">
                    <Link to={`/order/${order.order_id}`}>
                      <Eye className="h-4 w-4 mr-1.5" />
                      <span>Track Order</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
