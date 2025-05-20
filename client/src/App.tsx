import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import FilesPage from "@/pages/FilesPage";
import SchedulePage from "@/pages/SchedulePage";
import LoginPage from "@/pages/LoginPage";
import QuizzesPage from "@/pages/QuizzesPage";
import QuizDetail from "@/pages/QuizDetail";
import TakeQuiz from "@/pages/TakeQuiz";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={FilesPage} />
      <Route path="/schedule" component={SchedulePage} />
      <Route path="/quizzes" component={QuizzesPage} />
      <Route path="/quizzes/:id" component={QuizDetail} />
      <Route path="/take-quiz/:code" component={TakeQuiz} />
      <Route path="/login" component={LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-background">
              <Navigation />
              <main className="flex-grow">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
