import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Widget routes
import StatusWidget from "./widgets/StatusWidget";
import AssistantWidget from "./widgets/AssistantWidget";
import MicWidget from "./widgets/MicWidget";
import CommandWidget from "./widgets/CommandWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Widget routes for Electron */}
          <Route path="/widgets/status" element={<StatusWidget />} />
          <Route path="/widgets/assistant" element={<AssistantWidget />} />
          <Route path="/widgets/mic" element={<MicWidget />} />
          <Route path="/widgets/command" element={<CommandWidget />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
