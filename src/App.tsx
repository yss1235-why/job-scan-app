import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminJobEdit from "./pages/AdminJobEdit";
import AdminBookings from "./pages/AdminBookings"; // NEW IMPORT
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Index />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/job/:jobId" element={<AdminJobEdit />} />
          <Route path="/admin/bookings" element={<AdminBookings />} /> {/* NEW ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
