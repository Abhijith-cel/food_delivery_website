import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { useApp } from "../../context/AppContext";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DashboardReportResponse } from "@shared/api";
import { TrendingUp, Award, Layers, IndianRupee } from "lucide-react";

export default function Reports() {
  const { admin } = useApp();
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState<DashboardReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (!admin) {
      toast.error("Access denied. Please log in.");
      navigate("/admin/login");
    }
  }, [admin]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!admin) return;
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();
        if (response.ok) {
          setReportsData(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load business reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [admin]);

  if (!admin) return null;

  const COLORS = ["#f97316", "#eab308", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Sales Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Canteen financial statistics and category analyses</p>
        </div>

        {isLoading ? (
          <div className="border border-border bg-card rounded-xl h-96 animate-pulse" />
        ) : !reportsData ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground text-sm font-semibold font-bold">Failed to load reports data.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Popular Items Bar Chart */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Top Selling Food Items (Quantities)</span>
                </h3>
                <div className="h-80 w-full">
                  {reportsData.popularItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No order data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsData.popularItems} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <XAxis dataKey="food_name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e1e24", border: "1px solid #2d2d39", borderRadius: "8px" }}
                          labelStyle={{ fontWeight: "bold", color: "#f97316" }}
                          itemStyle={{ color: "#ffffff" }}
                        />
                        <Bar dataKey="orderCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Category Revenue Pie Chart */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <span>Revenue Contribution by Category</span>
                </h3>
                <div className="h-80 w-full flex flex-col sm:flex-row items-center justify-center">
                  {reportsData.revenueByCategory.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No sales data available.</div>
                  ) : (
                    <>
                      <div className="h-60 w-60 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportsData.revenueByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="revenue"
                              nameKey="category"
                            >
                              {reportsData.revenueByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1e1e24", border: "1px solid #2d2d39", borderRadius: "8px" }}
                              itemStyle={{ color: "#ffffff" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend labels */}
                      <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col space-y-2">
                        {reportsData.revenueByCategory.map((entry, index) => (
                          <div key={entry.category} className="flex items-center space-x-2 text-xs font-semibold">
                            <div className="h-3.5 w-3.5 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-muted-foreground">{entry.category}:</span>
                            <span className="text-foreground font-bold">₹{entry.revenue}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Structured Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Selling Items Table */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Popular Dishes Standings</span>
                </h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 text-muted-foreground font-bold text-xs uppercase border-b border-border">
                        <th className="p-3">Dish Name</th>
                        <th className="p-3 text-center">Portions Ordered</th>
                        <th className="p-3 text-right">Revenue Produced</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reportsData.popularItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="p-3 font-semibold text-foreground">{item.food_name}</td>
                          <td className="p-3 text-center text-foreground font-bold">{item.orderCount}</td>
                          <td className="p-3 text-right text-primary font-black">₹{item.totalRevenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Business Summary Cards */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span>Business Highlights</span>
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Average Order Ticket</p>
                    <p className="text-lg font-black text-foreground">
                      ₹
                      {reportsData.totalOrders > 0
                        ? Math.round(reportsData.totalRevenue / reportsData.totalOrders)
                        : 0}
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Cancelled Percentage</p>
                    <p className="text-lg font-black text-destructive">
                      {reportsData.totalOrders > 0
                        ? Math.round((reportsData.statusBreakdown.cancelled / reportsData.totalOrders) * 100)
                        : 0}
                      %
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Active Preparations</p>
                    <p className="text-lg font-black text-amber-500">
                      {reportsData.statusBreakdown.preparing} orders
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-xl border border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">Meals Ready (Awaiting Pickup)</p>
                    <p className="text-lg font-black text-emerald-500">
                      {reportsData.statusBreakdown.ready} orders
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
