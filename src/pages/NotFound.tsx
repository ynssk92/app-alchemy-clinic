import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="container relative mx-auto max-w-2xl px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );

};

export default NotFound;
