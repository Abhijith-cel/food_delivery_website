import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, ChefHat, CheckCircle2, PackageCheck, AlertCircle, ShoppingBag } from "lucide-react";

interface OrderDetail {
  order_id: string;
  user_name: string;
  items: {
    food_id: string;
    food_name: string;
    quantity: number;
    price: number;
  }[];
  total_price: number;
  order_status: "Preparing" | "Ready" | "Delivered" | "Cancelled";
  order_date: string;
}

export default function OrderTracking() {
  const { user } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to track orders");
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      if (response.ok) {
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll order details every 5 seconds for real-time status update
  useEffect(() => {
    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border p-6 rounded-xl text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
            <p className="text-sm text-muted-foreground">The order you are trying to track does not exist.</p>
            <Button asChild>
              <Link to="/menu">Browse Food Menu</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { status: "Preparing", label: "Preparing", desc: "Canteen is preparing your meal", icon: ChefHat },
    { status: "Ready", label: "Ready for Pickup", desc: "Meal is cooked and packed", icon: CheckCircle2 },
    { status: "Delivered", label: "Delivered", desc: "Picked up and completed", icon: PackageCheck },
  ];

  const getStepIndex = (status: string) => {
    if (status === "Preparing") return 0;
    if (status === "Ready") return 1;
    if (status === "Delivered") return 2;
    return -1;
  };

  const currentStep = getStepIndex(order.order_status);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Track Your Order</h1>
          <p className="text-sm text-muted-foreground">
            Order ID: <code className="text-primary font-mono text-xs">{order.order_id}</code>
          </p>
        </div>

        {/* Real-time status tracker */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">
          {order.order_status === "Cancelled" ? (
            <div className="flex items-center space-x-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Order Cancelled</h3>
                <p className="text-xs">Your order has been cancelled successfully.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-[28px] left-[35px] right-[35px] h-[3px] bg-secondary hidden sm:block">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 relative">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.status} className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0">
                      {/* Step Circle */}
                      <div
                        className={`h-14 w-14 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-card border-secondary text-muted-foreground"
                        } ${isCurrent ? "scale-110 animate-pulse border-white dark:border-background" : ""}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Step Label */}
                      <div className="sm:mt-4 space-y-0.5">
                        <h3 className={`font-bold text-sm sm:text-base ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-[160px]">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-foreground text-lg border-b border-border pb-3">Order Details</h3>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.food_id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-foreground">{item.food_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 flex justify-between items-center font-bold text-foreground">
            <span>Total Amount Paid</span>
            <span className="text-primary text-xl">₹{order.total_price}</span>
          </div>

          <div className="text-xs text-muted-foreground flex justify-between border-t border-border pt-4">
            <span>Ordered on: {new Date(order.order_date).toLocaleString()}</span>
            <span>Customer: {order.user_name}</span>
          </div>
        </div>

        {/* Back navigation options */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/history">View Order History</Link>
          </Button>
          <Button asChild className="rounded-lg">
            <Link to="/menu" className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Back to Menu</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
