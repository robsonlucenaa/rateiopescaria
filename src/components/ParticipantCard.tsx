
import React, { useState } from "react";
import { X, Edit2, Save, User } from "lucide-react";
import { Participant } from "./ExpenseSplitter";

interface ParticipantCardProps {
  participant: Participant;
  onRemove: (id: string) => void;
  onPaidChange: (id: string, paid: number) => void;
  formatCurrency: (value: number) => string;
  readOnly?: boolean;
}

const ParticipantCard = ({
  participant,
  onRemove,
  onPaidChange,
  formatCurrency,
  readOnly = false,
}: ParticipantCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPaid, setEditedPaid] = useState(participant.paid.toString());

  const handleEditSave = () => {
    if (isEditing) {
      const paidValue = parseFloat(editedPaid) || 0;
      onPaidChange(participant.id, paidValue);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md group animate-scale-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">{participant.name}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {!readOnly && (
            <button
              onClick={handleEditSave}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 button-effect"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => onRemove(participant.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 button-effect"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-sm text-muted-foreground mb-1">Total pago:</div>
        {isEditing && !readOnly ? (
          <input
            type="number"
            value={editedPaid}
            onChange={(e) => setEditedPaid(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-background border input-effect focus:outline-none"
            autoFocus
          />
        ) : (
          <div className="font-medium text-foreground">
            {formatCurrency(participant.paid)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantCard;
