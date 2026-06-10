import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { useApp } from "../../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FoodItemType } from "@shared/api";

export default function ManageFoodItems() {
  const { admin } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<FoodItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog controls
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FoodItemType | null>(null);

  // Form states
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("Snacks");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!admin) {
      toast.error("Access denied. Please log in.");
      navigate("/admin/login");
    }
  }, [admin]);

  const loadFoodItems = async () => {
    if (!admin) return;
    try {
      const response = await fetch("/api/food-items");
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

  useEffect(() => {
    loadFoodItems();
  }, [admin]);

  const openAddDialog = () => {
    setEditItem(null);
    setFoodName("");
    setCategory("Snacks");
    setPrice("");
    setImage("");
    setDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: FoodItemType) => {
    setEditItem(item);
    setFoodName(item.food_name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setImage(item.image);
    setDescription(item.description);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        loadFoodItems();
      } else {
        toast.error(data.message || "Failed to delete item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with server");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        toast.success("Image uploaded successfully!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !category || !price || !image || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      food_name: foodName,
      category,
      price: Number(price),
      image,
      description,
    };

    try {
      const url = editItem ? `/api/food-items/${editItem.food_id}` : "/api/food-items";
      const method = editItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        setIsDialogOpen(false);
        loadFoodItems();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["All", "Snacks", "Lunch", "Drinks"];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.food_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Manage Food Items</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure and edit canteen menu items</p>
          </div>
          <Button onClick={openAddDialog} className="flex items-center space-x-1.5 rounded-lg">
            <Plus className="h-4 w-4" />
            <span>Add Menu Item</span>
          </Button>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-4 items-center">
          {/* Categories select tabs */}
          <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search food name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Menu Items Table */}
        {isLoading ? (
          <div className="border border-border bg-card rounded-xl h-96 animate-pulse" />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground text-sm font-semibold">No food items found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.food_id}
                className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Photo */}
                  <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted mb-4">
                    <img src={item.image} alt={item.food_name} className="h-full w-full object-cover" />
                  </div>

                  {/* Title & category */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-primary font-bold">₹{item.price}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1">{item.food_name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex justify-end gap-2 border-t border-border pt-3 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} className="h-8 flex items-center space-x-1">
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.food_id)} className="h-8 text-destructive hover:bg-destructive/10 flex items-center space-x-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editItem ? "Edit Canteen Food Item" : "Add New Food Item"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
              {/* Item Name */}
              <div className="space-y-1.5">
                <Label htmlFor="foodName">Food Name</Label>
                <Input
                  id="foodName"
                  placeholder="e.g. Cheese Sandwich"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 border border-border rounded-lg bg-card text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="Snacks">Snacks</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Image Input Selection */}
              <div className="space-y-3">
                <Label>Food Image</Label>
                
                {/* Image Preview */}
                {image && (
                  <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted border border-border">
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
                        toast.error("Invalid image link. Please make sure to copy the direct image address (usually starts with https://images.unsplash.com/ or ends with file extension).");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow hover:bg-destructive/90 transition-colors"
                      title="Clear image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 text-xs" 
                    onClick={() => document.getElementById("localImageInput")?.click()}
                  >
                    Upload from Gallery
                  </Button>
                  <input
                    id="localImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-muted-foreground uppercase">Or use link</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="space-y-1">
                  {image.startsWith("data:") ? (
                    <div className="flex items-center justify-between text-xs bg-muted border border-border rounded-lg p-2">
                      <span className="text-muted-foreground truncate">Local Image Selected (Base64)</span>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-primary text-xs"
                        onClick={() => setImage("")}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <Input
                      id="image"
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      required={!image}
                    />
                  )}
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Tip: For Unsplash, right-click the image and select <strong>"Copy image address"</strong> (which looks like <code>https://images.unsplash.com/photo-...</code>), not the browser page URL.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe ingredients or serving size..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    "Save Item"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
