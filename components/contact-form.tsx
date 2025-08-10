"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    interestedIn: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you! We'll get back to you within 24 hours.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          interestedIn: "",
        });
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again or call us directly.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
      setStatus("error");
      setMessage("Something went wrong. Please try again or call us directly.");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Get In Touch</CardTitle>
        <p className="text-center text-gray-600">
          Ready to start your boxing journey? Send us a message and we'll get back to you within 24 hours.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestedIn">Interested In</Label>
              <Select
                value={formData.interestedIn}
                onValueChange={(value) => setFormData({ ...formData, interestedIn: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boxing">Boxing Classes</SelectItem>
                  <SelectItem value="strength">Strength & Conditioning</SelectItem>
                  <SelectItem value="juniors">Junior Jabbers</SelectItem>
                  <SelectItem value="personal">Personal Training</SelectItem>
                  <SelectItem value="membership">Membership Information</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us about your fitness goals, experience level, or any questions you have..."
              required
            />
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send Message"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Or call us directly at{" "}
            <a href="tel:2898925430" className="text-red-600 hover:underline font-semibold">
              (289) 892-5430
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
