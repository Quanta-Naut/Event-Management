import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Dashboard } from "@/components/admin/dashboard";
import { PortfolioManager } from "@/components/admin/portfolio-manager";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import { ContactManager } from "@/components/admin/contact-manager";
import NotFound from "@/pages/not-found";

const Admin = () => {
  const [location, setLocation] = useLocation();
  
  // Redirect to main admin page if on /admin/
  useEffect(() => {
    if (location === "/admin/" || location === "/admin") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  // A more flexible routing approach
  return (
    <AdminLayout>
      {location === "/admin" && <AdminDashboard />}
      {location === "/admin/portfolio" && <AdminPortfolio />}
      {location === "/admin/testimonials" && <AdminTestimonials />}
      {location === "/admin/inquiries" && <AdminInquiries />}
      {!["/admin", "/admin/portfolio", "/admin/testimonials", "/admin/inquiries"].includes(location) && <AdminNotFound />}
    </AdminLayout>
  );
};

const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
    <Dashboard />
  </div>
);

const AdminPortfolio = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Portfolio Management</h1>
    <PortfolioManager />
  </div>
);

const AdminTestimonials = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Testimonial Management</h1>
    <TestimonialManager />
  </div>
);

const AdminInquiries = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Contact Inquiries</h1>
    <ContactManager />
  </div>
);

const AdminNotFound = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Admin Page Not Found</h1>
    <p className="text-muted-foreground mb-6">The requested admin page does not exist.</p>
  </div>
);

export default Admin;
