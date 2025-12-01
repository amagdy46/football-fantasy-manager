import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Team } from "../types";
import { useUpdateTeamNameMutation } from "../mutations";
import { formatCurrency } from "@/lib/utils";

interface TeamHeaderProps {
  team: Team;
}

export const TeamHeader = ({ team }: TeamHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(team.name);

  const updateNameMutation = useUpdateTeamNameMutation();

  const handleSave = () => {
    updateNameMutation.mutate(name, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    setName(team.name);
    setIsEditing(false);
  };

  const totalValue = team.players.reduce(
    (sum, player) => sum + parseFloat(player.value),
    0
  );

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8 border border-slate-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-slate-400 text-sm uppercase tracking-wider mb-1">
            Team Name
          </h2>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700 text-white text-2xl font-bold px-3 py-1 rounded border border-slate-600 focus:outline-none focus:border-green-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                disabled={updateNameMutation.isPending}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={20} />
              </button>
              <button
                onClick={handleCancel}
                disabled={updateNameMutation.isPending}
                className="p-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Pencil size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          <div>
            <h2 className="text-slate-400 text-sm uppercase tracking-wider mb-1">
              Budget
            </h2>
            <p
              className="text-2xl font-bold text-green-400"
              data-testid="team-budget"
            >
              {formatCurrency(team.budget)}
            </p>
          </div>
          <div>
            <h2 className="text-slate-400 text-sm uppercase tracking-wider mb-1">
              Team Value
            </h2>
            <p
              className="text-2xl font-bold text-blue-400"
              data-testid="team-value"
            >
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div>
            <h2 className="text-slate-400 text-sm uppercase tracking-wider mb-1">
              Players
            </h2>
            <p
              className="text-2xl font-bold text-white"
              data-testid="team-player-count"
            >
              {team.players.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
