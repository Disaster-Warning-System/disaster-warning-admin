const buttonClass =
  "inline-flex min-h-10 items-center rounded-lg border border-[#DDE5EE] bg-white px-4 text-sm font-semibold text-[#1877B9] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] disabled:cursor-not-allowed disabled:opacity-50";

export default function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1) {
    return <p className="text-sm text-[#6B7C8F]">{total} report{total === 1 ? "" : "s"}</p>;
  }
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-[#6B7C8F]">
        Page {page} of {pages} · {total} reports
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
