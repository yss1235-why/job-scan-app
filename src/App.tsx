import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminJobEdit from "./pages/AdminJobEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Admin routes MUST come before Index */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/job/:jobId" element={<AdminJobEdit />} />
          
          {/* User routes */}
          <Route path="/" element={<Index />} />
          <Route path="/saved" element={<Index />} />
          <Route path="/notifications" element={<Index />} />
          <Route path="/more" element={<Index />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
