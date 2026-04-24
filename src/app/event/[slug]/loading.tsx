import { Wrapper } from '@/components/layout';

export default function LoadingEventDetail() {
  return (
    <Wrapper>
      <div className="mx-auto max-w-[860px] space-y-4">
        <div className="h-4 w-28 rounded bg-slate-800/80 animate-pulse" />
        <div className="h-10 w-full max-w-[680px] rounded bg-slate-800/80 animate-pulse" />
        <div className="h-4 w-full max-w-[740px] rounded bg-slate-800/70 animate-pulse" />
        <div className="h-4 w-52 rounded bg-slate-800/70 animate-pulse" />

        <div className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-4">
          <div className="mb-2 h-3 w-40 rounded bg-slate-800/80 animate-pulse" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_auto_220px] gap-3 py-3 border-b border-slate-800/80 last:border-b-0">
              <div className="h-4 w-full rounded bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-32 rounded bg-slate-800/70 animate-pulse" />
              <div className="h-3 w-full rounded bg-slate-800/70 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
