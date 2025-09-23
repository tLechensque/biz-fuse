import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Proposals from "./pages/Proposals";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProductsPage from "./pages/products/ProductsPage";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ProfileSetup } from "./components/ProfileSetup";

// Create QueryClient instance outside component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileSetup>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/proposals" element={
                <ProtectedRoute>
                  <Layout>
                    <Proposals />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductsPage />
                  </Layout>
                </ProtectedRoute>
              } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Clientes</h1>
                  <p className="text-muted-foreground">Módulo de clientes em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/kits" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Kits</h1>
                  <p className="text-muted-foreground">Módulo de kits em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/briefing" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Briefing</h1>
                  <p className="text-muted-foreground">Módulo de briefing em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Templates</h1>
                  <p className="text-muted-foreground">Módulo de templates em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Portfólio</h1>
                  <p className="text-muted-foreground">Módulo de portfólio em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/payment-methods" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Métodos de Pagamento</h1>
                  <p className="text-muted-foreground">Módulo de métodos de pagamento em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/organization" element={
            <ProtectedRoute>
              <Layout>
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">Organização</h1>
                  <p className="text-muted-foreground">Configurações da organização em desenvolvimento...</p>
                </div>
              </Layout>
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileSetup>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
