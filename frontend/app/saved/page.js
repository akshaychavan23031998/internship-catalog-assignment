'use client';

import { useEffect, useState } from 'react';
import InternshipCard from '../components/InternshipCard';
import { getSavedInternships } from '@/lib/api';

export default function SavedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    getSavedInternships()
      .then((data) => {
        if (ignore) return;
        const internships = (data.items || [])
          .map((bookmark) => bookmark.internshipId)
          .filter(Boolean);
        setItems(internships);
      })
      .catch(() => {
        if (!ignore) setError('Failed to load saved internships');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const removeSaved = (internshipId) => {
    setItems((current) => current.filter((item) => item._id !== internshipId));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Saved internships
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {items.length} saved opportunit{items.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 text-red-700 text-sm p-3">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No saved internships yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((internship) => (
            <InternshipCard
              key={internship._id}
              internship={internship}
              bookmarkInitialSaved
              onBookmarkChange={(saved) => {
                if (!saved) removeSaved(internship._id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
