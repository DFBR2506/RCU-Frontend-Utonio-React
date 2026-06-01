import './SkeletonPage.css';

export default function SkeletonPage() {
  return (
    <div className="app-layout">
      <div className="page-header">
        <div className="skeleton" style={{ height: '32px', width: '220px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '320px' }} />
      </div>

      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card stat-card skeleton" style={{ height: '100px' }} />
        ))}
      </div>

      <div className="skeleton-grid">
        <div className="card skeleton" style={{ height: '320px' }} />
        <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  );
}
