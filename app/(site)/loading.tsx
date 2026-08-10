/**
 * Shown while a `force-dynamic` page waits on its database round trip.
 *
 * Every public page reads Supabase from the server, which is a second or so
 * away, so without this the old page is already gone and the new one has not
 * arrived — the reader stares at an empty white screen and reads the delay as
 * a broken animation.
 */
export default function SiteLoading() {
  return (
    <div className="container-page animate-pulse py-16" aria-hidden="true">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-6 h-10 w-3/4 max-w-2xl rounded bg-slate-200" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-slate-100" />
      <div className="mt-2 h-4 w-5/6 max-w-lg rounded bg-slate-100" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 rounded-2xl border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    </div>
  );
}
