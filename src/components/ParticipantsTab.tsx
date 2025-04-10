
import React from "react";
import { Participant } from "@/types/fishingTrip";
import ParticipantCard from "./ParticipantCard";
import AddParticipantForm from "./AddParticipantForm";

interface ParticipantsTabProps {
  participants: Participant[];
  newParticipantName: string;
  setNewParticipantName: (name: string) => void;
  addParticipant: () => void;
  removeParticipant: (id: string) => void;
  formatCurrency: (value: number) => string;
  onNext: () => void;
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
  newParticipantName,
  setNewParticipantName,
  addParticipant,
  removeParticipant,
  formatCurrency,
  onNext
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-medium text-foreground/90">
        Quem participou da pescaria?
      </h2>
      
      <AddParticipantForm 
        newParticipantName={newParticipantName}
        setNewParticipantName={setNewParticipantName}
        addParticipant={addParticipant}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            onRemove={removeParticipant}
            onPaidChange={() => {}}
            formatCurrency={formatCurrency}
            readOnly={true}
          />
        ))}
      </div>

      {participants.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-primary text-white rounded-xl button-effect"
          >
            Próximo: Despesas
          </button>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
