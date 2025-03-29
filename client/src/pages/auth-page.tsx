import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const authFormSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    // Redirect to admin page if already authenticated
    if (isAuthenticated) {
      setLocation('/admin');
    }
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (values: AuthFormValues) => {
    await login(values.username, values.password);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Auth Form */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Event Horizon</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access the admin dashboard
            </p>
          </div>

          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-gray-900 to-black flex-col justify-center p-12">
        <div className="mx-auto max-w-md text-white">
          <h2 className="text-4xl font-bold mb-6">Event Management Dashboard</h2>
          <p className="text-lg mb-6">
            Welcome to the admin portal for Event Horizon. Manage your portfolio, testimonials,
            and contact submissions all in one place.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Portfolio Management
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Testimonial Handling
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Contact Form Submissions
            </li>
            <li className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              User Management
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}