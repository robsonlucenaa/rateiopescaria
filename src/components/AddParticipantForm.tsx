
import React from "react";
import { Plus } from "lucide-react";

interface AddParticipantFormProps {
  newParticipantName: string;
  setNewParticipantName: (name: string) => void;
  addParticipant: () => void;
}

const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  newParticipantName,
  setNewParticipantName,
  addParticipant
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Nome do participante"
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-background border input-effect focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && addParticipant()}
        />
        <button
          onClick={addParticipant}
          className="p-3 bg-primary text-white rounded-xl button-effect"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AddParticipantForm;
