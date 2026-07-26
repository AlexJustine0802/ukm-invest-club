/**
 * Shown while a member-dashboard page's data is being fetched.
 *
 * The block sizes deliberately mirror the real dashboard — a top bar, a
 * banner, a two-up stat row, then two panels — so the swap to real content
 * lands in roughly the same places instead of jolting the page.
 */
export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>

      <div className="skeleton h-[216px] w-full rounded-2xl" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-[104px] rounded-2xl" />
        <div className="skeleton h-[104px] rounded-2xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
