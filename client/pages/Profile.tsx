import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Phone, Mail, Save } from "lucide-react";

export default function Profile() {
  const { user, loginUser } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view profile");
      navigate("/login");
      return;
    }
    setName(user.name);
    setPhone(user.phone);
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name || !phone) {
      toast.error("Name and phone fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to update profile");
      } else {
        toast.success(data.message || "Profile updated successfully!");
        loginUser(data.user); // Save to AppContext & localStorage
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error while updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information and contact numbers</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-md">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Email (Readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Cannot be changed)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full flex items-center justify-center space-x-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "Saving Changes..." : "Save Profile Details"}</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
