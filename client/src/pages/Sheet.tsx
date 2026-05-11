import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTopics } from '../store/topicsSlice';
import { markSolved } from '../store/progressSlice';
import type { RootState, AppDispatch } from '../store';

export default function Sheet() {
  const { list: topics, loading } = useSelector((s: RootState) => s.topics);
  const dispatch = useDispatch<AppDispatch>();
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  const handleMarkSolved = async (problemId: number) => {
    try {
      await dispatch(markSolved(problemId)).unwrap();
      setSolved((prev) => new Set(prev).add(problemId));
      setMsg('Marked solved!');
    } catch (e: any) {
      setMsg(e.message);
    }
    setTimeout(() => setMsg(''), 2000);
  };

  if (loading) return <div className="loading">Loading...</div>;

  const diffColor = (d: string) => {
    if (d === 'EASY') return '#22c55e';
    if (d === 'HARD') return '#ef4444';
    return '#eab308';
  };

  const allProblems = topics.flatMap((t) =>
    t.problems.map((p) => ({ ...p, topicName: t.name }))
  );

  return (
    <div className="sheet-page">
      {msg && <div className="toast">{msg}</div>}
      <h1 className="page-title">DSA Sheet</h1>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Topic</th>
              <th>Problem</th>
              <th>Difficulty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allProblems.length === 0 && (
              <tr><td colSpan={5} className="empty-cell">No problems yet. Upload an Excel sheet from Admin panel.</td></tr>
            )}
            {allProblems.map((p, i) => (
              <tr key={p.id} className={solved.has(p.id) ? 'solved-row' : ''}>
                <td className="num">{i + 1}</td>
                <td>{p.topicName}</td>
                <td>
                  <a href={p.url} target="_blank" className={solved.has(p.id) ? 'done' : ''}>
                    {p.title}
                  </a>
                </td>
                <td>
                  <span className="diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={solved.has(p.id)}
                    onChange={() => handleMarkSolved(p.id)}
                    disabled={solved.has(p.id)}
                    className="solved-check"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
