'use client';

export default function FilterSidebar({ facets, filters, onChange }) {
  const toggle = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const clearAll = () => {
    onChange({
      ...filters,
      domain: [],
      workMode: [],
      location: [],
      minStipend: '',
    });
  };

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Filters</h2>
        <button
          onClick={clearAll}
          className="text-xs text-slate-500 hover:text-accent underline-offset-2 hover:underline"
        >
          Clear all
        </button>
      </div>

      <FacetGroup
        title="Domain"
        options={facets?.domains || []}
        selected={filters.domain || []}
        onToggle={(v) => toggle('domain', v)}
      />

      <FacetGroup
        title="Work mode"
        options={facets?.workModes || []}
        selected={filters.workMode || []}
        onToggle={(v) => toggle('workMode', v)}
      />

      <FacetGroup
        title="Location"
        options={facets?.locations || []}
        selected={filters.location || []}
        onToggle={(v) => toggle('location', v)}
      />

      <div>
        <h3 className="text-sm font-medium text-ink mb-2">Min stipend (₹/mo)</h3>
        <input
          type="number"
          min={0}
          step={5000}
          value={filters.minStipend || ''}
          onChange={(e) =>
            onChange({ ...filters, minStipend: e.target.value })
          }
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          placeholder="e.g. 20000"
        />
      </div>
    </aside>
  );
}

function FacetGroup({ title, options, selected, onToggle }) {
  if (!options.length) return null;
  return (
    <div>
      <h3 className="text-sm font-medium text-ink mb-2">{title}</h3>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="rounded border-slate-300 text-accent focus:ring-accent"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
