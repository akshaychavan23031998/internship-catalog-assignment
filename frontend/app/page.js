'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildUrl } from '@/lib/api';
import InternshipCard from './components/InternshipCard';
import FilterSidebar from './components/FilterSidebar';
import SearchBar from './components/SearchBar';

const PAGE_SIZE = 9;

export default function HomePage() {
  const [facets, setFacets] = useState({ domains: [], workModes: [], locations: [] });
  const [filters, setFilters] = useState({
    q: '',
    domain: [],
    workMode: [],
    location: [],
    minStipend: '',
  });
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load facets once.
  useEffect(() => {
    fetch(buildUrl('/api/internships/facets'))
      .then((r) => r.json())
      .then(setFacets)
      .catch(() => {});
  }, []);

  // Fetch internships whenever filters or page change.
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      buildUrl('/api/internships', {
        q: filters.q,
        domain: filters.domain,
        workMode: filters.workMode,
        location: filters.location,
        minStipend: filters.minStipend,
        page,
        limit: PAGE_SIZE,
      })
    )
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load internships');
        setLoading(false);
      });
  }, [filters, page]);

  const handleSearch = useCallback((q) => {
    setFilters((f) => ({ ...f, q }));
    setPage(1);
  }, []);

  const handleFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8">
      <div>
        <FilterSidebar
          facets={facets}
          filters={filters}
          onChange={handleFiltersChange}
        />
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Browse internships
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {data.total} opportunit{data.total === 1 ? 'y' : 'ies'} matching your filters
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        {error && (
          <div className="rounded-md bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : data.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No internships match these filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.items.map((i) => (
              <InternshipCard key={i._id} internship={i} />
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
