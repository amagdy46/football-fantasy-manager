import { TransferFilters as FilterType } from "../types";

interface TransferFiltersProps {
  filters: FilterType;
  onFilterChange: (newFilters: FilterType) => void;
}

export const TransferFilters = ({
  filters,
  onFilterChange,
}: TransferFiltersProps) => {
  const handleChange = (
    key: keyof FilterType,
    value: string | number | undefined
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-fit sticky top-4">
      <h2 className="text-xl font-bold text-white mb-4">Filters</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="playerName"
            className="block text-slate-400 text-sm mb-2"
          >
            Player Name
          </label>
          <input
            id="playerName"
            type="text"
            value={filters.playerName || ""}
            onChange={(e) => handleChange("playerName", e.target.value)}
            placeholder="Search player..."
            className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="teamName"
            className="block text-slate-400 text-sm mb-2"
          >
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={filters.teamName || ""}
            onChange={(e) => handleChange("teamName", e.target.value)}
            placeholder="Search team..."
            className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="position"
            className="block text-slate-400 text-sm mb-2"
          >
            Position
          </label>
          <select
            id="position"
            value={filters.position || ""}
            onChange={(e) =>
              handleChange("position", e.target.value || undefined)
            }
            className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
          >
            <option value="">All Positions</option>
            <option value="GK">Goalkeeper</option>
            <option value="DEF">Defender</option>
            <option value="MID">Midfielder</option>
            <option value="ATT">Attacker</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              aria-label="Min Price"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Min"
              className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
            />
            <input
              type="number"
              aria-label="Max Price"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Max"
              className="w-full bg-slate-700 text-white border border-slate-600 rounded p-2 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
