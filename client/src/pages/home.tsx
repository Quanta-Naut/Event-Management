import { useRef, useState, useEffect } from "react";
import { motion, useInView, useAnimation, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import PortfolioItem from "@/components/portfolio/portfolio-item";
import TestimonialCard from "@/components/testimonials/testimonial-card";
import BackgroundGradient from "@/components/animations/background-gradient";
import type { PortfolioItem as PortfolioItemType, Testimonial } from "@shared/schema";
import { smoothScrollToElement } from "@/lib/utils";

// Extend the contact form schema with additional validation for Indian phone numbers
const contactFormSchema = insertContactSubmissionSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  // Updated regex for Indian phone numbers (supports formats like +91 XXXXXXXXXX, 0XXXXXXXXXX, etc.)
  phone: z.string().optional().refine(val => !val || /^(?:\+91|0)?[6789]\d{9}$/.test(val), {
    message: "Please enter a valid Indian phone number",
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Home = () => {
  // Get context for portfolio modal
  const [openPortfolioModal, setOpenPortfolioModal] = useState<(id: number) => void>(() => () => {});
  
  useEffect(() => {
    const contextElement = document.getElementById('portfolio-modal-context');
    if (contextElement) {
      const openFnStr = contextElement.getAttribute('data-open');
      if (openFnStr) {
        try {
          // eslint-disable-next-line no-new-func
          setOpenPortfolioModal(() => (id: number) => new Function(openFnStr)(id));
        } catch (e) {
          console.error('Failed to parse portfolio modal open function', e);
        }
      }
    }
  }, []);

  return (
    <>
      <HeroSection />
      <PortfolioSection openPortfolioModal={openPortfolioModal} />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
};

const HeroSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Function to scroll to contact section with enhanced animation
  const scrollToContact = () => {
    smoothScrollToElement("contact", { 
      offsetPx: 80,  
      duration: 1200 
    });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center">
      <BackgroundGradient />
      
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10">
        <motion.div
          ref={ref}
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold leading-tight tracking-tight"
            variants={itemVariants}
          >
            Crafting Unforgettable <span className="text-primary">Experiences</span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
            variants={itemVariants}
          >
            We transform your vision into seamless, memorable events. From corporate gatherings to dream weddings—we orchestrate every detail.
          </motion.p>
          
          <motion.div 
            className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            variants={itemVariants}
          >
            <Button 
              size="lg" 
              className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              onClick={scrollToContact}
            >
              Book an Event
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => smoothScrollToElement("portfolio", { duration: 1200 })}
            >
              Explore Portfolio
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const PortfolioSection = ({ openPortfolioModal }: { openPortfolioModal: (id: number) => void }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const { data: portfolioItems, isLoading } = useQuery<PortfolioItemType[]>({
    queryKey: ['/api/portfolio'],
  });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Our Portfolio</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            A showcase of our finest events, each crafted with precision and passion.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {isLoading ? (
            // Skeleton loaders
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl overflow-hidden aspect-[4/3]"
                variants={itemVariants}
              >
                <div className="w-full h-full bg-muted animate-pulse"></div>
              </motion.div>
            ))
          ) : portfolioItems && portfolioItems.length > 0 ? (
            portfolioItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <PortfolioItem item={item} onClick={openPortfolioModal} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No portfolio items found</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button variant="outline" size="lg">
            View All Projects
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const ServicesSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  // Track which cards are being hovered
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const services = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Corporate Events",
      description: "From product launches to conferences, we create professional events that strengthen your brand.",
      bgImage: "asiri/other/landscapes/other-event-18.jpg"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Social Gatherings",
      description: "Elevate birthdays, anniversaries and special celebrations with our creative planning.",
      bgImage: "/asiri/concerts/concert-event-1.jpg"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Weddings",
      description: "We transform your dream wedding into reality with meticulous planning and execution.",
      bgImage: "/asiri/weddings/wedding-event-1.jpg"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Festivals & Concerts",
      description: "Complete logistics and production management for large-scale entertainment events.",
      bgImage: "/asiri/concerts/concert-event-1.jpg"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Non-Profit Events",
      description: "Strategic fundraisers and charity events that maximize impact and donations.",
      bgImage: "/asiri/other/portraits/other-event-31.jpg"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Virtual Events",
      description: "Engaging digital experiences with seamless technology integration and production.",
      bgImage: "/asiri/other/miscellaneous/other-event-5.jpg"
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Comprehensive event management solutions tailored to your needs.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="relative bg-card rounded-xl overflow-hidden h-64 shadow-md border border-primary/40"
              variants={itemVariants}
              animate={{ 
                y: hoveredCardIndex === index ? -4 : 0 
              }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setHoveredCardIndex(index)}
              onHoverEnd={() => setHoveredCardIndex(null)}
            >
              {/* Background Image with subtle blur */}
              <div 
                className="absolute inset-0 z-0" 
                style={{
                  backgroundImage: `url(${service.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(3px) brightness(0.8)',
                }}
              ></div>
              
              {/* Gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-0"></div>
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="w-12 h-12 mb-4 rounded-lg bg-primary/30 backdrop-blur-sm flex items-center justify-center">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{service.title}</h3>
                <p className="text-white/80">
                  {service.description}
                </p>
                <div className="mt-auto">
                  <div className="inline-flex items-center text-primary hover:text-primary/80 transition-colors cursor-pointer pt-2">
                    <span className="text-sm font-medium">Learn more</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  // Auto-scroll testimonials
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials]);

  // Scroll to the active testimonial
  useEffect(() => {
    if (!testimonialContainerRef.current || !testimonials) return;
    
    const container = testimonialContainerRef.current;
    const cardWidth = container.querySelector('div')?.offsetWidth || 0;
    const scrollPosition = activeIndex * (cardWidth + 24); // Width + gap
    
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  }, [activeIndex, testimonials]);

  // Handle manual navigation
  const goToTestimonial = (index: number) => {
    setActiveIndex(index);
  };

  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col items-center text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Client Testimonials</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            What our clients say about their experience working with us.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          className="relative"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {isLoading ? (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="min-w-[325px] md:min-w-[400px] snap-center bg-card p-6 rounded-xl animate-pulse h-64">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="ml-3 space-y-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <>
              <div 
                ref={testimonialContainerRef}
                className="flex overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide gap-6"
              >
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard 
                    key={testimonial.id} 
                    testimonial={testimonial}
                    isActive={index === activeIndex}
                  />
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === activeIndex ? "bg-primary" : "bg-border"
                      }`}
                      onClick={() => goToTestimonial(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No testimonials found</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });
  const controls = useAnimation();
  
  // State to track successful submission for animation
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Set up form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventType: undefined,
      message: "",
    },
  });

  // Handle form submission
  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) => {
      return apiRequest("POST", "/api/contact", values);
    },
    onSuccess: async () => {
      // Show success animation
      setFormSubmitted(true);
      
      // Show success toast
      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      
      // Reset form after a delay to let animation complete
      setTimeout(() => {
        form.reset();
        setFormSubmitted(false);
      }, 2000);
      
      // Invalidate queries if needed
      await queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          "Failed to send your message. Please try again later.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Contact form error:", error);
      
      // Check if this is a database connection issue
      if (errorMessage.includes("DATABASE_URL") || error.message?.includes("database")) {
        toast({
          title: "Database Connection Issue",
          description: "Our database is currently experiencing issues. Your information was not saved. Please try again later or contact us directly by phone.",
          variant: "destructive",
          duration: 7000,
        });
      }
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    // Display loading toast to give immediate feedback
    const loadingToast = toast({
      title: "Sending message...",
      description: "Please wait while we process your submission.",
    });

    mutation.mutate(values, {
      onSettled: () => {
        // Dismiss loading toast when the request completes (success or error)
        loadingToast.dismiss();
      }
    });
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Success animation variants
  const successVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 } 
    },
    exit: { 
      scale: 1.2, 
      opacity: 0,
      transition: { duration: 0.5 } 
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              Ready to create an unforgettable event? Let's discuss your vision.
            </p>
          </motion.div>

          <motion.div
            ref={formRef}
            className="bg-card rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            <AnimatePresence>
              {formSubmitted && (
                <motion.div
                  className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  variants={successVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div 
                    className="bg-primary text-primary-foreground h-20 w-20 rounded-full flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20, 
                      delay: 0.1 
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <motion.p 
                    className="text-xl font-bold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Message Sent!
                  </motion.p>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    We'll get back to you shortly
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field} 
                            disabled={mutation.isPending || formSubmitted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email"
                            {...field} 
                            disabled={mutation.isPending || formSubmitted}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-muted-foreground">+91</span>
                          </div>
                          <Input 
                            placeholder=""
                            type="tel"
                            className="pl-12"
                            {...field}
                            onChange={(e) => {
                              // Allow only numbers and limit to 10 digits (for Indian mobile numbers)
                              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                              field.onChange(value ? `+91${value}` : '');
                              
                              // Update input field to show only numbers (without +91)
                              e.target.value = value;
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              // Format properly when losing focus
                              if (field.value && !field.value.startsWith('+91')) {
                                field.onChange(`+91${field.value}`);
                              }
                            }}
                            // Display value without prefix in the input
                            value={field.value ? field.value.replace('+91', '') : ''}
                            disabled={mutation.isPending || formSubmitted}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={mutation.isPending || formSubmitted}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="social">Social Gathering</SelectItem>
                          <SelectItem value="concert">Concert/Festival</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit Event</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your event, including date, location, estimated guest count, and any special requirements."
                          className="min-h-[120px]"
                          {...field} 
                          disabled={mutation.isPending || formSubmitted}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                  disabled={mutation.isPending || formSubmitted}
                >
                  {mutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Message"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Home;
