import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-semibold text-slate-800">Event not found</p>
      <p className="text-sm text-slate-500">The slug may be invalid or Gamma returned no data.</p>
      <Link className="text-sm font-medium text-emerald-600 hover:underline" href="/">
        Back to events
      </Link>
    </div>
  );
}
