import { usePortfolioItems } from "@/lib/hooks/use-portfolio";
import { useTestimonials, useContactSubmissions } from "@/lib/hooks/use-testimonials";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Dashboard() {
  console.log("Dashboard component is rendering");
  
  const { data: portfolioItems } = usePortfolioItems();
  const { data: testimonials } = useTestimonials();
  const { data: contactSubmissions } = useContactSubmissions();
  
  console.log("Dashboard data:", { 
    portfolioItems: portfolioItems?.length || 0, 
    testimonials: testimonials?.length || 0,
    contactSubmissions: contactSubmissions?.length || 0
  });

  // Count unread messages
  const unreadCount = contactSubmissions?.filter((submission: any) => !submission.read).length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portfolioItems?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total portfolio projects
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/portfolio">
            <Button variant="ghost" className="w-full">Manage Portfolio</Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{testimonials?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            Client testimonials
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/testimonials">
            <Button variant="ghost" className="w-full">Manage Testimonials</Button>
          </Link>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contact Inquiries</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{contactSubmissions?.length || 0}</div>
            {unreadCount > 0 && (
              <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1">
                {unreadCount} new
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Total contact submissions
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/admin/inquiries">
            <Button variant="ghost" className="w-full">Manage Inquiries</Button>
          </Link>
        </CardFooter>
      </Card>
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your website content and respond to inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/portfolio">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Portfolio Item
            </Button>
          </Link>
          <Link href="/admin/testimonials">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Testimonial
            </Button>
          </Link>
          <Link href="/admin/inquiries">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              View Messages
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              View Website
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
