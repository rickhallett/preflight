import { Authenticated, Unauthenticated, useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import QuestionnaireWizard from "./QuestionnaireWizard";
import QuestionnaireList from "./QuestionnaireList";
import { useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "@/components/ui/button";

export default function App() {
  const user = useQuery(api.auth.loggedInUser);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [isStartingNew, setIsStartingNew] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">


      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold accent-text">PreFlight Intake</h2>
          <SignOutButton />
        </header>
        <main className="flex-1 p-8">
          <div className="w-full max-w-4xl mx-auto">
            <Unauthenticated>
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Welcome to PreFlight</h1>
                <SignInForm />
              </div>
            </Unauthenticated>
            <Authenticated>
              {user?.role === "guest" && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Upgrade to Access</h2>
                  <Button
                    onClick={() => {
                      void createCheckoutSession().then((url) => {
                        if (url) window.location.href = url;
                      });
                    }}
                  >
                    Upgrade Now
                  </Button>
                </div>
              )}
              {user?.role === "paid" && (
                isStartingNew ? (
                  <div>
                    <Button
                      variant="link"
                      onClick={() => setIsStartingNew(false)}
                      className="mb-4"
                    >
                      ← Back to home
                    </Button>
                    <QuestionnaireWizard onComplete={() => setIsStartingNew(false)} />
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-12">
                      <h1 className="text-4xl font-bold mb-6">Welcome to PreFlight</h1>
                      <p className="text-gray-600 mb-8 text-lg">
                        Start your journey by completing our comprehensive questionnaire
                      </p>
                      <Button
                        size="lg"
                        onClick={() => setIsStartingNew(true)}
                      >
                        Start New Questionnaire
                      </Button>
                    </div>
                    <QuestionnaireList onStartNew={() => setIsStartingNew(true)} />
                  </div>
                )
              )}
              {user?.role === "admin" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                  {/* Admin dashboard will go here */}
                </div>
              )}
            </Authenticated>
          </div>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
