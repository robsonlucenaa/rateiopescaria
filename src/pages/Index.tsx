
import React, { useEffect } from "react";
import ExpenseSplitter from "@/components/ExpenseSplitter";
import { Fish } from "lucide-react";
import { useParams } from "react-router-dom";

const Index = () => {
  const { tripId } = useParams();
  
  // Set the page title to include the trip ID if available
  useEffect(() => {
    if (tripId) {
      document.title = `Pescaria #${tripId} - Rateio de Pescaria`;
    } else {
      document.title = "Rateio de Pescaria";
    }
  }, [tripId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 px-4 py-12">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <div className="inline-block px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium mb-4 animate-float">
          Simplifique suas pescarias
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2 flex items-center justify-center gap-2">
          <Fish className="h-7 w-7 text-primary" />
          Rateio de Pescaria
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Calcule facilmente quanto cada participante deve pagar ou receber após uma boa pescaria!!!
        </p>
      </div>
      
      <ExpenseSplitter />
      
      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>
          Desenvolvido por Lucena Solutions
        </p>
      </footer>
    </div>
  );
};

export default Index;
