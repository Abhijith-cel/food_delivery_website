import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    // Simulate API feedback post
    setTimeout(() => {
      toast.success("Feedback submitted successfully! Thank you.");
      setName("");
      setEmail("");
      setMsg("");
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Contact & Feedback</h1>
          <p className="text-sm text-muted-foreground mt-1">Get in touch with the canteen administration or leave your feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info Block */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-foreground">Canteen Information</h3>
            <p className="text-sm text-muted-foreground">
              We aim to provide fresh, delicious, and healthy meals for everyone in the campus. If you have any dietary queries, bulk requests, or order complaints, please contact us.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Location</h4>
                  <p className="text-xs text-muted-foreground">Main Food Court, Ground Floor, Academic Block-B</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Operating Hours</h4>
                  <p className="text-xs text-muted-foreground">Monday - Saturday: 8:00 AM - 8:00 PM</p>
                  <p className="text-xs text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Phone Support</h4>
                  <p className="text-xs text-muted-foreground">+91 98765 43210 (Canteen Desk)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Email Help</h4>
                  <p className="text-xs text-muted-foreground">canteen.support@college.edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4 shadow-md">
            <h3 className="text-xl font-bold text-foreground">Send Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="msg">Message / Suggestion</Label>
                <Textarea id="msg" rows={4} placeholder="Your suggestions help us improve food quality and service..." value={msg} onChange={(e) => setMsg(e.target.value)} required />
              </div>

              <Button type="submit" className="w-full flex items-center justify-center space-x-2" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Send Feedback"}</span>
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
