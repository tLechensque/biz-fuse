import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Proposals from "./pages/Proposals";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/proposals" element={
            <Layout>
              <Proposals />
            </Layout>
          } />
          <Route path="/products" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Produtos</h1>
                <p className="text-muted-foreground">Módulo de produtos em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/clients" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Clientes</h1>
                <p className="text-muted-foreground">Módulo de clientes em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/kits" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Kits</h1>
                <p className="text-muted-foreground">Módulo de kits em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/briefing" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Briefing</h1>
                <p className="text-muted-foreground">Módulo de briefing em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/templates" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Templates</h1>
                <p className="text-muted-foreground">Módulo de templates em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/portfolio" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Portfólio</h1>
                <p className="text-muted-foreground">Módulo de portfólio em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/payment-methods" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Métodos de Pagamento</h1>
                <p className="text-muted-foreground">Módulo de métodos de pagamento em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          <Route path="/organization" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Organização</h1>
                <p className="text-muted-foreground">Configurações da organização em desenvolvimento...</p>
              </div>
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
