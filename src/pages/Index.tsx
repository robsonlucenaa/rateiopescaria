
import React, { useEffect, useState } from "react";
import ExpenseSplitter from "@/components/ExpenseSplitter";
import TripFinder from "@/components/TripFinder";
import { Fish, RefreshCw, History, Copy, Plus, CloudSun } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { tripId } = useParams();
  const { toast } = useToast();
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  
  // Define o título da página para incluir o ID da viagem se disponível
  useEffect(() => {
    if (tripId) {
      document.title = `Pescaria #${tripId} - Rateio de Pescaria`;
    } else {
      document.title = "Rateio de Pescaria";
    }
  }, [tripId]);

  const handleCopyLink = () => {
    if (tripId) {
      const url = `${window.location.origin}/trip/${tripId}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "Link da pescaria copiado para a área de transferência.",
      });
    }
  };

  const openTripFinder = () => {
    setIsFinderOpen(true);
  };
  
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
        <p className="text-muted-foreground max-w-lg mx-auto mb-6">
          Calcule facilmente quanto cada participante deve pagar ou receber após uma boa pescaria!!!
        </p>
        
        {/* Barra de botões reorganizada: Atualizar, Histórico, Copiar Link, Nova Pescaria */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {/* Primeira linha: Atualizar e Histórico */}
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {tripId && (
              <>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-1" />
                  Atualizar
                </Button>
                
                <Button variant="outline" onClick={openTripFinder}>
                  <History className="mr-1" />
                  Histórico
                </Button>
              </>
            )}
          </div>
          
          {/* Segunda linha: Copiar Link e Nova Pescaria */}
          <div className="flex flex-wrap gap-2 justify-center w-full">
            {tripId && (
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-1" />
                Copiar Link
              </Button>
            )}
            
            <Button variant="default" onClick={() => window.location.href = "/"}>
              <Plus className="mr-1" />
              Nova Pescaria
            </Button>
          </div>
        </div>
        
        {/* TripFinder componente que será controlado pelo botão de histórico */}
        <TripFinder isOpen={isFinderOpen} setIsOpen={setIsFinderOpen} />
        
        {tripId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center justify-center gap-2 max-w-md mx-auto">
            <CloudSun className="h-4 w-4" />
            <span>
              Os dados da pescaria são armazenados automaticamente. Clique no botão "Atualizar" para sincronizar manualmente.
            </span>
          </div>
        )}
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
