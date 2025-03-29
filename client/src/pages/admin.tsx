import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Dashboard } from "@/components/admin/dashboard";
import { PortfolioManager } from "@/components/admin/portfolio-manager";
import { TestimonialManager } from "@/components/admin/testimonial-manager";
import { ContactManager } from "@/components/admin/contact-manager";
import { UserManager } from "@/components/admin/user-manager";
import NotFound from "@/pages/not-found";

const Admin = () => {
  const [location, setLocation] = useLocation();
  
  // Make sure the dashboard is displayed for root admin page
  useEffect(() => {
    console.log("Admin page effect running, location:", location);
    // Only redirect if we're on /admin/ with trailing slash
    if (location === "/admin/") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  // Debugging the current location
  console.log("Current location in admin:", location);
  
  // Determine which component to show based on path
  let currentView;
  if (location === "/admin" || location === "/admin/") {
    currentView = <AdminDashboard />;
  } else if (location === "/admin/portfolio") {
    currentView = <AdminPortfolio />;
  } else if (location === "/admin/testimonials") {
    currentView = <AdminTestimonials />;
  } else if (location === "/admin/inquiries") {
    currentView = <AdminInquiries />;
  } else if (location === "/admin/users") {
    currentView = <AdminUsers />;
  } else {
    currentView = <AdminNotFound />;
  }
  
  return (
    <AdminLayout>
      {currentView}
    </AdminLayout>
  );
};

const AdminDashboard = () => {
  console.log("AdminDashboard component is rendering");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard />
    </div>
  );
};

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

const AdminUsers = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">User Management</h1>
    <UserManager />
  </div>
);

const AdminNotFound = () => (
  <div className="text-center">
    <h1 className="text-2xl font-bold mb-4">Admin Page Not Found</h1>
    <p className="text-muted-foreground mb-6">The requested admin page does not exist.</p>
  </div>
);

export default Admin;
