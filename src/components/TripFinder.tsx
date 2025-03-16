
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription, Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { History, Search } from "lucide-react";
import { apiService } from "@/services/apiService";

interface Trip {
  id: string;
  lastUpdated: number;
  participants: number;
}

const TripFinder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [tripId, setTripId] = useState("");
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = async () => {
    setIsOpen(true);
    setTripId(""); // Limpa o campo de ID ao abrir o diálogo
    // Carrega as pescarias recentes quando o diálogo é aberto
    setIsLoading(true);
    try {
      const trips = await apiService.getAllTrips();
      setRecentTrips(trips.slice(0, 5)); // Exibe apenas as 5 mais recentes
    } catch (error) {
      console.error("Erro ao carregar pescarias recentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const findTrip = () => {
    if (!tripId.trim()) {
      toast({
        title: "ID necessário",
        description: "Por favor, insira o ID da pescaria.",
        variant: "destructive",
      });
      return;
    }

    // Verifica se o ID da pescaria existe antes de navegar
    apiService.fetchTrip(tripId)
      .then(data => {
        if (data) {
          navigate(`/trip/${tripId}`);
          setIsOpen(false);
        } else {
          toast({
            title: "Pescaria não encontrada",
            description: `Não foi possível encontrar a pescaria com ID: ${tripId}`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error("Erro ao buscar pescaria:", error);
        toast({
          title: "Erro ao buscar",
          description: "Houve um erro ao buscar a pescaria. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <Button 
        onClick={openDialog} 
        variant="outline" 
        className="flex items-center space-x-1"
      >
        <History className="w-4 h-4" />
        <span>Histórico</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar Pescaria</DialogTitle>
            <DialogDescription>
              Digite o ID da pescaria que deseja encontrar ou selecione uma recente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <Input
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="ID da pescaria"
              className="flex-1"
            />
            <Button onClick={findTrip} type="submit">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-4 text-center text-muted-foreground">Carregando...</div>
          ) : (
            <>
              {recentTrips.length > 0 ? (
                <>
                  <h4 className="font-medium text-sm mb-2">Pescarias Recentes</h4>
                  <div className="space-y-2">
                    {recentTrips.map((trip) => (
                      <Button
                        key={trip.id}
                        variant="outline"
                        className="w-full justify-between text-left font-normal"
                        onClick={() => {
                          navigate(`/trip/${trip.id}`);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">Pescaria #{trip.id}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(trip.lastUpdated)} • {trip.participants} participantes
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  Nenhuma pescaria encontrada no histórico.
                </div>
              )}
            </>
          )}

          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TripFinder;
