import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { user, cart, updateCartQuantity, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          items: cart.map((i) => ({
            food_id: i.food_id,
            food_name: i.food_name,
            quantity: i.quantity,
            price: i.price,
          })),
          total_price: Math.round(total),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to place order");
      } else {
        toast.success("Order placed successfully!");
        clearCart();
        navigate(`/order/${data.order.order_id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground mt-1">Review your selections and place your order</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed space-y-4 max-w-lg mx-auto">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground">Add items from the menu to start ordering.</p>
            </div>
            <Button asChild className="rounded-lg">
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.food_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border border-border rounded-xl gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.food_name}
                      className="h-16 w-16 object-cover rounded-lg bg-muted flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{item.food_name}</h3>
                      <p className="text-xs sm:text-sm text-primary font-bold">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Qty Adjustment */}
                    <div className="flex items-center bg-secondary rounded-lg px-2 py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCartQuantity(item.food_id, item.quantity - 1)}
                        className="h-7 w-7 text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-foreground text-sm px-2">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCartQuantity(item.food_id, item.quantity + 1)}
                        className="h-7 w-7 text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Total Price & Delete */}
                    <div className="flex items-center space-x-4">
                      <span className="font-extrabold text-foreground text-sm sm:text-base">
                        ₹{item.price * item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.food_id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold text-foreground">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>CGST/SGST (5%)</span>
                    <span className="font-semibold text-foreground">₹{tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-primary text-lg">₹{Math.round(total)}</span>
                  </div>
                </div>

                {!user ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-center text-muted-foreground">
                      You need to sign in to place an order.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/login">Sign In to Checkout</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full rounded-lg py-6 font-bold text-base flex items-center justify-center space-x-2"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? "Placing Order..." : "Confirm & Place Order"}</span>
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
