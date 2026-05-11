import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProgress, fetchDailyStats, fetchResume } from '../store/progressSlice';
import type { RootState, AppDispatch } from '../store';

export default function Progress() {
  const { report, daily, resume } = useSelector((s: RootState) => s.progress);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchProgress());
    dispatch(fetchDailyStats());
    dispatch(fetchResume());
  }, [dispatch]);

  if (!report) return <div className="loading">Loading...</div>;

  const pct = report.total > 0 ? Math.round((report.solved / report.total) * 100) : 0;

  return (
    <div className="progress-page">
      <h1 className="page-title">Your Progress</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{report.solved}/{report.total}</div>
          <div className="stat-label">Problems Solved</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-num">{daily?.streak ?? 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>

      {resume && (
        <div className="resume-card">
          <h3>Continue Where You Left Off</h3>
          <a href={resume.url} target="_blank">{resume.title}</a>
        </div>
      )}

      <section>
        <h2>Daily Activity</h2>
        {daily?.daily && Object.keys(daily.daily).length > 0 ? (
          <div className="daily-grid">
            {Object.entries(daily.daily)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 30)
              .map(([date, count]) => (
                <div key={date} className="daily-cell" style={{ opacity: Math.min(1, 0.2 + (count as number) * 0.3) }}>
                  <span className="daily-count">{count as number}</span>
                  <span className="daily-date">{date.slice(5)}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="empty">No activity yet. Start solving problems!</p>
        )}
      </section>

      <section>
        <h2>Solved Problems</h2>
        {report.records?.length > 0 ? (
          <div className="solved-list">
            {report.records.map((r: any) => (
              <div key={r.id} className="solved-item">
                <a href={r.problem?.url} target="_blank">{r.problem?.title}</a>
                <span className="date">{r.solvedDate}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">No problems solved yet</p>
        )}
      </section>
    </div>
  );
}
