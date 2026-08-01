import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './store/authSlice';
import { fetchTopics } from './store/topicsSlice';
import ChatWidget from './components/ChatWidget';
import type { RootState, AppDispatch } from './store';

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark((d) => !d)] as const;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const topics = useSelector((s: RootState) => s.topics.list);
  const dispatch = useDispatch<AppDispatch>();
  const [dark, toggleTheme] = useTheme();

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">DSA Sheet</div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <NavLink to="/sheet" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">&#9776;</span>
              All Topics
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Topics</div>
            {topics.map((t) => (
              <NavLink
                key={t.id}
                to={`/topic/${t.id}`}
                className={({ isActive }) => `nav-link nav-link-sub ${isActive ? 'active' : ''}`}
              >
                {t.name}
              </NavLink>
            ))}
          </div>

          <NavLink to="/progress" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">&#9654;</span>
            Progress
          </NavLink>

          {user?.roles.includes('ADMIN') && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon">&#9881;</span>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">{user?.name}</div>
          <button className="btn-sm sidebar-logout" onClick={toggleTheme}>
            {dark ? '\u2600 Light' : '\u263E Dark'}
          </button>
          <button className="btn-sm sidebar-logout" onClick={() => dispatch(logout())}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <ChatWidget />
    </div>
  );
}
