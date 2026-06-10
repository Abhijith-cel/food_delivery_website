import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { useApp } from "../../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Eye, Filter, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CanteenOrder {
  order_id: string;
  user_name: string;
  user_phone: string;
  items: {
    food_name: string;
    quantity: number;
    price: number;
  }[];
  total_price: number;
  order_status: "Preparing" | "Ready" | "Delivered" | "Cancelled";
  order_date: string;
}

export default function ManageOrders() {
  const { admin } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Modal display order details
  const [selectedOrder, setSelectedOrder] = useState<CanteenOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!admin) {
      toast.error("Access denied. Please log in.");
      navigate("/admin/login");
    }
  }, [admin]);

  const loadOrders = async () => {
    if (!admin) return;
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [admin]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        // Reload order list
        loadOrders();
        // Update selected order modal if open
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus as any });
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
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

  const handleViewDetails = (order: CanteenOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.order_status === statusFilter;
    const matchesSearch =
      order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Manage Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Review canteen queue orders and change statuses</p>
          </div>
          <Button onClick={loadOrders} variant="outline" className="flex items-center space-x-1.5 self-start sm:self-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between border-b border-border pb-4 items-center">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 border border-border rounded-lg bg-card text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="border border-border bg-card rounded-xl h-96 animate-pulse" />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground text-sm font-semibold">No orders matching the filters.</p>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-muted-foreground font-bold text-xs uppercase border-b border-border">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary text-xs">
                        {order.order_id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{order.user_name}</div>
                        <div className="text-xs text-muted-foreground">{order.user_phone}</div>
                      </td>
                      <td className="p-4 truncate max-w-[200px]">
                        {order.items.map((i) => `${i.food_name} (x${i.quantity})`).join(", ")}
                      </td>
                      <td className="p-4 font-bold text-foreground">₹{order.total_price}</td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(order.order_date).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)} className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <select
                            value={order.order_status}
                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            className="h-8 border border-border rounded-lg bg-card text-foreground px-2 py-0.5 focus:outline-none text-xs"
                          >
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md bg-card border border-border">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Order Details: <span className="font-mono text-primary font-bold">{selectedOrder.order_id}</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Customer Information */}
                  <div className="bg-secondary/40 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Customer</p>
                    <p className="font-semibold text-foreground text-sm">{selectedOrder.user_name}</p>
                    <p className="text-xs text-muted-foreground">Phone: {selectedOrder.user_phone}</p>
                    <p className="text-xs text-muted-foreground">
                      Time: {new Date(selectedOrder.order_date).toLocaleString()}
                    </p>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Items Summary</p>
                    <div className="border border-border rounded-lg divide-y divide-border">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 text-sm">
                          <div>
                            <span className="font-bold text-foreground">{item.food_name}</span>
                            <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold text-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center border-t border-border pt-4 font-bold text-foreground">
                    <span>Grand Total</span>
                    <span className="text-primary text-xl">₹{selectedOrder.total_price}</span>
                  </div>

                  {/* Status update within dialog */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Update Status</span>
                    <div className="flex gap-2">
                      {["Preparing", "Ready", "Delivered"].map((st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant={selectedOrder.order_status === st ? "default" : "outline"}
                          onClick={() => handleStatusChange(selectedOrder.order_id, st)}
                        >
                          {st}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="border-t border-border pt-4">
                  <Button onClick={() => setIsDetailsOpen(false)}>Close Details</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
