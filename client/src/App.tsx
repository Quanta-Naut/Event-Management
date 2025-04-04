import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileMenu from "@/components/layout/mobile-menu";
import CommandBar from "@/components/layout/command-bar";
import PortfolioModal from "@/components/portfolio/portfolio-modal";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthProvider } from "@/lib/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Home />}</Route>
      <Route path="/auth">{() => <AuthPage />}</Route>
      <ProtectedRoute path="/admin" component={Admin} />
      <ProtectedRoute path="/admin/*" component={Admin} />
      <Route>{() => <NotFound />}</Route>
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const toggleCommandBar = () => setCommandBarOpen(prev => !prev);
  
  const openPortfolioModal = (id: number) => {
    setSelectedPortfolioId(id);
    setPortfolioModalOpen(true);
  };
  
  const closePortfolioModal = () => {
    setPortfolioModalOpen(false);
    // Clear the selected portfolio item after animation completes
    setTimeout(() => setSelectedPortfolioId(null), 300);
  };

  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
          {/* Only show header on non-admin pages */}
          {!isAdminPage && (
            <Header 
              toggleMobileMenu={toggleMobileMenu}
              toggleCommandBar={toggleCommandBar}
            />
          )}
          <main className={`flex-grow ${isAdminPage ? 'pt-0' : ''}`}>
            <Router />
          </main>
          {/* Only show footer on non-admin pages */}
          {!isAdminPage && <Footer />}
          
          <AnimatePresence>
            {mobileMenuOpen && (
              <MobileMenu 
                isOpen={mobileMenuOpen} 
                onClose={() => setMobileMenuOpen(false)} 
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {commandBarOpen && (
              <CommandBar 
                isOpen={commandBarOpen} 
                onClose={() => setCommandBarOpen(false)} 
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {portfolioModalOpen && selectedPortfolioId !== null && (
              <PortfolioModal 
                isOpen={portfolioModalOpen}
                onClose={closePortfolioModal}
                portfolioId={selectedPortfolioId}
              />
            )}
          </AnimatePresence>
        </div>
        
        {/* Global context for portfolio modal */}
        <div className="hidden">
          <div id="portfolio-modal-context" 
            data-open={openPortfolioModal.toString()} 
            data-close={closePortfolioModal.toString()}
          />
        </div>
        
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
