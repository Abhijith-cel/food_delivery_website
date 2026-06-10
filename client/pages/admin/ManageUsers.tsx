import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminNavbar } from "../../components/AdminNavbar";
import { useApp } from "../../context/AppContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, UserCheck } from "lucide-react";
import { UserType } from "@shared/api";

export default function ManageUsers() {
  const { admin } = useApp();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (!admin) {
      toast.error("Access denied. Please log in.");
      navigate("/admin/login");
    }
  }, [admin]);

  const loadUsers = async () => {
    if (!admin) return;
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [admin]);

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Manage Users</h1>
            <p className="text-sm text-muted-foreground mt-1">View list of registered canteen customers</p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table list */}
        {isLoading ? (
          <div className="border border-border bg-card rounded-xl h-96 animate-pulse" />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <p className="text-muted-foreground text-sm font-semibold">No registered users found.</p>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 text-muted-foreground font-bold text-xs uppercase border-b border-border">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4">Customer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-semibold text-foreground flex items-center space-x-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4 text-foreground">{user.phone}</td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center space-x-1 text-emerald-500 font-bold text-xs">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
