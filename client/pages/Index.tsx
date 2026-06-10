import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Coffee, ShieldCheck, Clock, ArrowRight, Star, Heart } from "lucide-react";
import { FoodItemType } from "@shared/api";

export default function Index() {
  const [featuredItems, setFeaturedItems] = useState<FoodItemType[]>([]);

  useEffect(() => {
    // Load some popular items from menu API
    fetch("/api/food-items")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Take first 3 items for display
          setFeaturedItems(data.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Col */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <span>Skip the long queue at the counter!</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                Fresh & Delicious Food, <br />
                <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  Ready in Minutes!
                </span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-md text-base text-muted-foreground sm:text-lg">
                Order your favorite breakfast, snacks, lunch, or drinks online. Get real-time status notifications and pick it up when it's hot.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button size="lg" asChild className="rounded-full shadow-lg hover:shadow-primary/20">
                  <Link to="/menu" className="flex items-center space-x-2">
                    <span>Order Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full border-2 border-muted-foreground/45 text-foreground hover:bg-secondary transition-all">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>

            {/* Right Col - Visual Showcase */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/25 to-amber-500/25 p-1">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
                  alt="Delicious food cooking"
                  className="h-full w-full object-cover rounded-[14px]"
                />
              </div>
              {/* Badge Overlay */}
              <div className="absolute -bottom-6 -left-6 bg-card border border-border p-4 rounded-xl shadow-2xl flex items-center space-x-3 max-w-[200px]">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">Average Prep Time</p>
                  <p className="text-sm font-extrabold text-foreground">Under 10 Mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature stats */}
      <section className="border-t border-b border-border bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Waiting Lines</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Order directly from your phone and pick up when it's ready. Keep study hours productive.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Wide Variety</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Fresh ingredients cooked daily. Menu includes breakfast, snacks, thalis, and hot/cold drinks.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Clean & Safe</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Highest standards of hygiene. Track order status transparently at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Food Menu Highlight */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Popular Dishes</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our customers' absolute favorites, freshly prepared and seasoned to perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <div
                key={item.food_id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.food_name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {item.category}
                    </span>
                    <span className="text-lg font-extrabold text-primary">₹{item.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.food_name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="pt-4 mt-auto">
                    <Button asChild className="w-full rounded-lg">
                      <Link to="/menu">View Menu to Order</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              <Link to="/menu" className="flex items-center space-x-2">
                <span>View Full Menu</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-6">
          <div>
            <p className="text-base font-bold text-foreground">Smart Canteen Ordering System</p>
            <p className="text-xs text-muted-foreground mt-1">
              Making campus and office dining simple, fast, and digitally optimized.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
