'use client';

import { useEffect, useState } from 'react';

/**
 * Debounced search input. Fires onSearch with the latest query after the user
 * stops typing for ~300ms.
 */
export default function SearchBar({ onSearch, placeholder = 'Search internships…' }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(handle);
  }, [value, onSearch]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
    />
  );
}
