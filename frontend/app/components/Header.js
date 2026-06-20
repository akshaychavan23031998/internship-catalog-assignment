import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          Internship<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-ink">
            Browse
          </Link>
          <Link href="/find" className="hover:text-ink">
            Find your internship
          </Link>
          <Link href="/saved" className="hover:text-ink">
            Saved
          </Link>
        </nav>
      </div>
    </header>
  );
}
