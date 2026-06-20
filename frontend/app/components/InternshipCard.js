import Link from 'next/link';

function formatStipend(value) {
  return `₹${value.toLocaleString('en-IN')}/mo`;
}

export default function InternshipCard({ internship }) {
  return (
    <Link
      href={`/internships/${internship._id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-accent hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink leading-tight">{internship.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{internship.company}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
          {internship.workMode}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>📍 {internship.location}</span>
        <span>⏱ {internship.durationMonths} months</span>
        <span>💰 {formatStipend(internship.stipendPerMonth)}</span>
      </div>

      {internship.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {internship.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
