
import React from "react";
import { RefreshCw, Copy, Check } from "lucide-react";

interface TripControlBarProps {
  currentTripId: string;
  isRefreshing: boolean;
  isSaving: boolean;
  copied: boolean;
  forceRefresh: () => void;
  copyShareLink: () => void;
  startNewTrip: () => void;
}

const TripControlBar: React.FC<TripControlBarProps> = ({
  currentTripId,
  isRefreshing,
  isSaving,
  copied,
  forceRefresh,
  copyShareLink,
  startNewTrip
}) => {
  return (
    <div className="bg-primary/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-medium text-primary">ID da Pescaria: {currentTripId}</h3>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={forceRefresh}
          className={`flex items-center space-x-1 ${isRefreshing ? 'bg-primary/20' : 'bg-secondary'} px-3 py-1.5 rounded-lg text-sm button-effect`}
          title="Atualizar dados"
          disabled={isRefreshing || isSaving}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
        <button
          onClick={copyShareLink}
          className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg text-sm button-effect"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          <span>Copiar Link</span>
        </button>
        <button
          onClick={startNewTrip}
          className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm button-effect"
        >
          Nova Pescaria
        </button>
      </div>
    </div>
  );
};

export default TripControlBar;
