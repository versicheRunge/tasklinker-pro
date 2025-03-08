
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-6 max-w-md animate-fade-in">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">Seite nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
