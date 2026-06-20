import { API_BASE } from '@/lib/api';
import ApplyButton from '../../components/ApplyButton';
import Link from 'next/link';

async function getInternship(id) {
  const res = await fetch(`${API_BASE}/api/internships/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

function formatStipend(value) {
  return `₹${value.toLocaleString('en-IN')}/mo`;
}

export default async function InternshipDetailPage({ params }) {
  const internship = await getInternship(params.id);

  if (!internship) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Internship not found.</p>
        <Link href="/" className="text-accent text-sm mt-2 inline-block">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-slate-500 hover:text-accent">
        ← Back to catalog
      </Link>

      <header className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              {internship.title}
            </h1>
            <p className="text-slate-600 mt-1">{internship.company}</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {internship.workMode}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
          <span>📍 {internship.location}</span>
          <span>⏱ {internship.durationMonths} months</span>
          <span>💰 {formatStipend(internship.stipendPerMonth)}</span>
          <span>🗂 {internship.domain}</span>
        </div>
      </header>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-ink mb-3">About this internship</h2>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
          {internship.description}
        </p>

        {internship.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-ink mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {internship.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="mt-6">
        <ApplyButton internshipId={internship._id} />
      </div>
    </article>
  );
}
