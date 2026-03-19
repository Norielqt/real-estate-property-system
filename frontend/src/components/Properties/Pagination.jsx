import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;

  const { current_page, last_page } = meta;

  const pages = [];
  const range = 2;
  for (let i = Math.max(1, current_page - range); i <= Math.min(last_page, current_page + range); i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        disabled={current_page === 1}
        onClick={() => onPageChange(current_page - 1)}
      >
        <ChevronLeft size={15} />
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span style={{ padding: '0 .25rem' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={p === current_page ? 'active' : ''}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < last_page && (
        <>
          {pages[pages.length - 1] < last_page - 1 && <span style={{ padding: '0 .25rem' }}>…</span>}
          <button onClick={() => onPageChange(last_page)}>{last_page}</button>
        </>
      )}

      <button
        disabled={current_page === last_page}
        onClick={() => onPageChange(current_page + 1)}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
