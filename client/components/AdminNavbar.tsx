import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LayoutDashboard, Utensils, ClipboardList, Users, BarChart3, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminNavbar: React.FC = () => {
  const { admin, logoutAdmin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  if (!admin) return null;

  const adminLinks = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Food Items", path: "/admin/items", icon: Utensils },
    { label: "Orders Queue", path: "/admin/orders", icon: ClipboardList },
    { label: "Manage Users", path: "/admin/users", icon: Users },
    { label: "Sales Reports", path: "/admin/reports", icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="font-extrabold tracking-tight text-foreground">
              Canteen<span className="text-primary">Admin</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Session actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Logged in as: <strong className="text-foreground">{admin.username}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1.5 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Bar - horizontal scrolling links on small screens */}
      <div className="flex md:hidden border-t border-border overflow-x-auto bg-card scrollbar-none px-4 py-2 space-x-5">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-1 text-xs font-bold whitespace-nowrap py-1 ${
                isActive(link.path) ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
