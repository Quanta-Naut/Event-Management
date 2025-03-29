import { useState } from "react";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Form schema
const authFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Create form
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    if (activeTab === "login") {
      loginMutation.mutate(values);
    } else {
      registerMutation.mutate(values);
    }
  };

  // If the user is already logged in, redirect to home page
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Auth Form Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Log in to manage your event portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
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
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                        ) : (
                          'Log In'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Create a username" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
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
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <p>Don't have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")}>Sign up</Button></p>
              ) : (
                <p>Already have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("login")}>Log in</Button></p>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        {/* Hero Column */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden md:flex flex-col justify-center h-full"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Event Management Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your portfolio, testimonials, and client inquiries from a single, intuitive dashboard.
            </p>
            <div className="flex flex-col space-y-2 mt-6">
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Create and update portfolio showcases</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Add client testimonials and feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Respond to client inquiries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Manage user accounts</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}