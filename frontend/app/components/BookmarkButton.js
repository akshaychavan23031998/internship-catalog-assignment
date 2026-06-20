'use client';

import { useEffect, useState } from 'react';
import {
  getBookmarkState,
  saveInternship,
  unsaveInternship,
} from '@/lib/api';

export default function BookmarkButton({
  internshipId,
  initialSaved = null,
  onChange,
  size = 'default',
}) {
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [loading, setLoading] = useState(initialSaved === null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSaved !== null) return;

    let ignore = false;
    setLoading(true);

    getBookmarkState(internshipId)
      .then((data) => {
        if (!ignore) setSaved(Boolean(data.saved));
      })
      .catch(() => {
        if (!ignore) setError('Could not load saved state');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [initialSaved, internshipId]);

  const toggle = async () => {
    setLoading(true);
    setError('');

    try {
      if (saved) {
        await unsaveInternship(internshipId);
        setSaved(false);
        onChange?.(false);
      } else {
        await saveInternship(internshipId);
        setSaved(true);
        onChange?.(true);
      }
    } catch (err) {
      setError(err.message || 'Could not update saved state');
    } finally {
      setLoading(false);
    }
  };

  const compact = size === 'compact';

  return (
    <div className={compact ? 'flex flex-col items-start gap-1' : 'flex items-center gap-3'}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={
          compact
            ? 'px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:border-accent hover:text-accent disabled:opacity-60'
            : 'px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:border-accent hover:text-accent disabled:opacity-60'
        }
      >
        {loading ? 'Saving...' : saved ? 'Saved' : 'Save'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
