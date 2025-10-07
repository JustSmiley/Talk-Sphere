import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-card to-background">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</h1>
        <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
