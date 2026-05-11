import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTopic } from '../store/topicsSlice';
import { markSolved } from '../store/progressSlice';
import type { RootState, AppDispatch } from '../store';

export default function TopicDetail() {
  const { id } = useParams();
  const topic = useSelector((s: RootState) => s.topics.current);
  const dispatch = useDispatch<AppDispatch>();
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchTopic(+id));
  }, [id, dispatch]);

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

  if (!topic) return <div className="loading">Loading...</div>;

  const diffColor = (d: string) => {
    if (d === 'EASY') return '#22c55e';
    if (d === 'HARD') return '#ef4444';
    return '#eab308';
  };

  return (
    <div className="detail-page">
      {msg && <div className="toast">{msg}</div>}
      <h1 className="page-title">{topic.name}</h1>

      <section>
        <h2>Theory Resources</h2>
        {topic.resources.length === 0 && <p className="empty">No resources yet</p>}
        <div className="link-list">
          {topic.resources.map((r) => (
            <a key={r.id} href={r.url} target="_blank" className="link-item">
              <span className={`badge ${r.type === 'VIDEO' ? 'video' : 'article'}`}>
                {r.type}
              </span>
              <span>{r.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2>Problems</h2>
        {topic.problems.length === 0 && <p className="empty">No problems yet</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {topic.problems.map((p, i) => (
                <tr key={p.id} className={solved.has(p.id) ? 'solved-row' : ''}>
                  <td className="num">{i + 1}</td>
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
      </section>
    </div>
  );
}
