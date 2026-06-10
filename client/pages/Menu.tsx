import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { FoodItemType } from "@shared/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export default function Menu() {
  const { addToCart, cart, updateCartQuantity } = useApp();
  const [items, setItems] = useState<FoodItemType[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "Snacks", "Lunch", "Drinks"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch items based on category and search query
  useEffect(() => {
    setIsLoading(true);
    const fetchItems = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
        if (searchQuery) queryParams.append("search", searchQuery);

        const response = await fetch(`/api/food-items?${queryParams.toString()}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setItems(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load food menu");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  const getCartQuantity = (foodId: string) => {
    const cartItem = cart.find((i) => i.food_id === foodId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: FoodItemType) => {
    addToCart(item);
    toast.success(`${item.food_name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Food Menu</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select and order fresh meals cooked directly in our canteen
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex space-x-2 border-b border-border overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Food Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border bg-card rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground text-lg">No dishes found matching your criteria.</p>
            <p className="text-sm text-muted-foreground mt-1">Try another category or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const qty = getCartQuantity(item.food_id);
              return (
                <div
                  key={item.food_id}
                  className="flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-lg"
                >
                  {/* Food Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.food_name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Food Details */}
                  <div className="flex flex-1 flex-col p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 px-2 py-0.5 rounded text-xs font-bold text-primary">
                        {item.category}
                      </span>
                      <span className="text-lg font-extrabold text-primary">₹{item.price}</span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground">{item.food_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                    <div className="pt-4 mt-auto">
                      {qty > 0 ? (
                        <div className="flex items-center justify-between bg-secondary rounded-lg px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCartQuantity(item.food_id, qty - 1)}
                            className="h-8 w-8 text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-foreground">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateCartQuantity(item.food_id, qty + 1)}
                            className="h-8 w-8 text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleAddToCart(item)} className="w-full flex items-center justify-center space-x-2">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Add to Cart</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
