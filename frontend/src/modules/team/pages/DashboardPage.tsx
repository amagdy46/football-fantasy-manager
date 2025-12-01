import { TeamHeader, PlayerGrid, SoccerPitch } from "../components";
import { useSquadSplit } from "../hooks";
import { useTeamQuery } from "../queries";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRightLeft, LogOut } from "lucide-react";
import { useAuth } from "@/modules/auth";

const DashboardPage = () => {
  const { data: team, isLoading, error } = useTeamQuery();
  const { starters, bench } = useSquadSplit(team?.players);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Error loading team data
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-900 text-white p-4 md:p-8"
      data-testid="team-ready"
    >
      <div className="max-w-7xl mx-auto">
        <TeamHeader team={team} />

        <div className="flex justify-end gap-3 mb-6">
          <Link
            to="/transfers"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            <ArrowRightLeft size={20} />
            Go to Transfer Market
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-green-500 rounded-sm"></span>
              Starting XI
            </h2>
            <SoccerPitch players={starters} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-yellow-500 rounded-sm"></span>
              Bench & Reserves
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-h-[800px] overflow-y-auto">
              <PlayerGrid players={bench} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
