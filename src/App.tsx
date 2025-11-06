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
import ClientsPage from "./pages/clients/ClientsPage";
import UsersManagement from "./pages/admin/UsersManagement";
import PermissionsManagement from "./pages/admin/PermissionsManagement";
import CategoriesManagement from "./pages/management/CategoriesManagement";
import TagsManagement from "./pages/management/TagsManagement";
import BrandsManagement from "./pages/management/BrandsManagement";
import PaymentsManagement from "./pages/management/PaymentsManagement";
import SuppliersManagement from "./pages/management/SuppliersManagement";
import PriceTablesManagement from "./pages/management/PriceTablesManagement";
import OrganizationSettings from "./pages/management/OrganizationSettings";
import DiscountsManagement from "./pages/management/DiscountsManagement";
import PortfolioManagement from "./pages/management/PortfolioManagement";
import TemplatesManagement from "./pages/management/TemplatesManagement";
import ProposalPreview from "./pages/preview/ProposalPreview";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProfileSetup } from "./components/ProfileSetup";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";

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
              <Route path="/" element={<Index />} />
              
              {/* Preview route (can be public for PDF generation) */}
              <Route path="/preview/:proposalId" element={<ProposalPreview />} />
              
              {/* Protected routes with Layout */}
              <Route element={<ProtectedLayout />}>
                <Route path="/proposals" element={<Proposals />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/kits" element={
                  <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">Kits</h1>
                    <p className="text-muted-foreground">Módulo de kits em desenvolvimento...</p>
                  </div>
                } />
                <Route path="/briefing" element={
                  <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">Briefing</h1>
                    <p className="text-muted-foreground">Módulo de briefing em desenvolvimento...</p>
                  </div>
                } />
                <Route path="/templates" element={<TemplatesManagement />} />
                <Route path="/portfolio" element={<PortfolioManagement />} />
                <Route path="/payment-methods" element={<PaymentsManagement />} />
                <Route path="/organization" element={<OrganizationSettings />} />
                <Route path="/categories" element={<CategoriesManagement />} />
                <Route path="/tags" element={<TagsManagement />} />
                <Route path="/brands" element={<BrandsManagement />} />
                <Route path="/suppliers" element={<SuppliersManagement />} />
                <Route path="/price-tables" element={<PriceTablesManagement />} />
                <Route path="/discounts" element={<DiscountsManagement />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/permissions" element={<PermissionsManagement />} />
              </Route>
              
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
