import React, { createContext, useContext, useState, useEffect } from "react";
import { UserType, AdminType, OrderItemType, FoodItemType } from "@shared/api";

interface CartItem extends OrderItemType {
  image: string;
}

interface AppContextType {
  user: UserType | null;
  admin: AdminType | null;
  cart: CartItem[];
  loginUser: (user: UserType) => void;
  logoutUser: () => void;
  loginAdmin: (admin: AdminType) => void;
  logoutAdmin: () => void;
  addToCart: (item: FoodItemType) => void;
  removeFromCart: (foodId: string) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load initial states from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("canteen_user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedAdmin = localStorage.getItem("canteen_admin");
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));

    const storedCart = localStorage.getItem("canteen_cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  const loginUser = (userData: UserType) => {
    setUser(userData);
    localStorage.setItem("canteen_user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("canteen_user");
    localStorage.removeItem("canteen_cart");
  };

  const loginAdmin = (adminData: AdminType) => {
    setAdmin(adminData);
    localStorage.setItem("canteen_admin", JSON.stringify(adminData));
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("canteen_admin");
  };

  const addToCart = (item: FoodItemType) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.food_id === item.food_id);
      let newCart;
      if (existing) {
        newCart = prevCart.map((i) =>
          i.food_id === item.food_id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newCart = [
          ...prevCart,
          {
            food_id: item.food_id,
            food_name: item.food_name,
            quantity: 1,
            price: item.price,
            image: item.image,
          },
        ];
      }
      localStorage.setItem("canteen_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((i) => i.food_id !== foodId);
      localStorage.setItem("canteen_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prevCart) => {
      const newCart = prevCart.map((i) =>
        i.food_id === foodId ? { ...i, quantity } : i
      );
      localStorage.setItem("canteen_cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("canteen_cart");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        admin,
        cart,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
