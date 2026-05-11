import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { adminCreateUser } from '../store/authSlice';
import { fetchRoles, createRole, updateRole, deleteRole } from '../store/rolesSlice';
import { fetchRights, createRight, deleteRight } from '../store/rightsSlice';
import { fetchUsers, toggleDisableUser, changePassword } from '../store/usersSlice';
import { fetchStudentProgress, fetchStudentDaily } from '../store/progressSlice';
import { uploadFile } from '../store/api';
import type { RootState, AppDispatch } from '../store';

type Tab = 'upload' | 'create-student' | 'users' | 'students' | 'roles' | 'rights';

export default function Admin() {
  const user = useSelector((s: RootState) => s.auth.user);
  const [tab, setTab] = useState<Tab>('upload');

  if (!user?.roles.includes('ADMIN')) {
    return <div className="loading">Access denied</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="page-title">Admin Panel</h1>

      <nav className="admin-tabs">
        {(['upload', 'create-student', 'users', 'students', 'roles', 'rights'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t === 'upload' ? 'Upload Excel' : t === 'create-student' ? 'Create User' : t === 'users' ? 'All Users' : t === 'students' ? 'Student Progress' : t === 'roles' ? 'Roles' : 'Rights'}
          </button>
        ))}
      </nav>

      {tab === 'upload' && <UploadSection />}
      {tab === 'create-student' && <CreateStudentSection />}
      {tab === 'users' && <UsersTableSection />}
      {tab === 'students' && <StudentProgressSection />}
      {tab === 'roles' && <RolesSection />}
      {tab === 'rights' && <RightsSection />}
    </div>
  );
}

function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const res = await uploadFile('/upload', file);
      setMsg(`Uploaded: ${res.topics} topics created`);
    } catch (e: any) {
      setMsg(e.message);
    }
    setUploading(false);
  };

  return (
    <section className="upload-section">
      <h2>Upload DSA Sheet Excel</h2>
      <p>Upload an Excel file with columns: <strong>Topic</strong>, <strong>Theory Link</strong>, <strong>Problem Link</strong>, <strong>Difficulty</strong></p>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
        <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
      </form>
      {msg && <div className="msg">{msg}</div>}
      <p className="sample-link">
        <a href="/sample-dsa-sheet.xlsx" download>Download sample Excel template</a>
      </p>
    </section>
  );
}

function CreateStudentSection() {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((s: RootState) => s.roles.list);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const res = await dispatch(adminCreateUser({ email, password, name, role })).unwrap();
      setMsg(`Created user: ${res.name} (${res.email}) with role ${res.roles[0]}. Email sent.`);
      setEmail('');
      setPassword('');
      setName('');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <section>
      <h2>Create User Account</h2>
      <p>An email with login credentials will be sent to the user.</p>
      <form onSubmit={handle} className="create-user-form">
        {err && <div className="error">{err}</div>}
        {msg && <div className="msg">{msg}</div>}
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r: any) => <option key={r.name} value={r.name}>{r.name}</option>)}
        </select>
        <button type="submit">Create User</button>
      </form>
    </section>
  );
}

function UsersTableSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { list: users, loading } = useSelector((s: RootState) => s.users);
  const roles = useSelector((s: RootState) => s.roles.list);
  const [roleFilter, setRoleFilter] = useState('');
  const [pwModal, setPwModal] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dispatch(fetchUsers(roleFilter || undefined));
  }, [dispatch, roleFilter]);

  const handleToggle = async (id: number) => {
    await dispatch(toggleDisableUser(id)).unwrap();
    dispatch(fetchUsers(roleFilter || undefined));
  };

  const handlePasswordChange = async () => {
    if (!pwModal || !newPassword) return;
    try {
      await dispatch(changePassword({ id: pwModal.id, password: newPassword })).unwrap();
      setMsg(`Password changed for ${pwModal.name}. Email sent.`);
      setPwModal(null);
      setNewPassword('');
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <section>
      <h2>All Users</h2>
      {msg && <div className="msg">{msg}</div>}

      <div className="filter-bar">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {roles.map((r: any) => <option key={r.name} value={r.name}>{r.name}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className={u.disabled ? 'disabled-row' : ''}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.roles?.map((r: any) => r.name).join(', ')}</td>
                  <td>
                    <span className={`badge ${u.disabled ? 'badge-red' : 'badge-green'}`}>
                      {u.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="btn-sm" onClick={() => handleToggle(u.id)}>
                      {u.disabled ? 'Enable' : 'Disable'}
                    </button>
                    <button className="btn-sm btn-outline" onClick={() => setPwModal({ id: u.id, name: u.name })}>
                      Change Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pwModal && (
        <div className="modal-overlay" onClick={() => setPwModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password for {pwModal.name}</h3>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handlePasswordChange}>Save</button>
              <button className="btn-outline" onClick={() => setPwModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RolesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((s: RootState) => s.roles.list);
  const rights = useSelector((s: RootState) => s.rights.list);
  const [name, setName] = useState('');
  const [selectedRights, setSelectedRights] = useState<number[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchRights());
  }, [dispatch]);

  const resetForm = () => { setName(''); setSelectedRights([]); setEditing(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await dispatch(updateRole({ id: editing.id, data: { name, rights: selectedRights.map((id) => ({ id })) } })).unwrap();
        setMsg('Role updated');
      } else {
        await dispatch(createRole({ name, rights: selectedRights.map((id) => ({ id })) })).unwrap();
        setMsg('Role created');
      }
      resetForm();
      dispatch(fetchRoles());
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const handleEdit = (role: any) => {
    setName(role.name);
    setSelectedRights(role.rights?.map((r: any) => r.id) ?? []);
    setEditing(role);
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteRole(id)).unwrap();
    setMsg('Role deleted');
  };

  const toggleRight = (id: number) => {
    setSelectedRights((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  return (
    <section>
      <h2>{editing ? 'Edit Role' : 'Create Role'}</h2>
      {msg && <div className="msg">{msg}</div>}
      <form onSubmit={handleCreate}>
        <input placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="rights-checklist">
          {rights.map((r: any) => (
            <label key={r.id}>
              <input type="checkbox" checked={selectedRights.includes(r.id)} onChange={() => toggleRight(r.id)} />
              {r.name}
            </label>
          ))}
        </div>
        <button type="submit">{editing ? 'Update' : 'Create'}</button>
        {editing && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Existing Roles</h3>
      <ul className="role-list">
        {roles.map((r: any) => (
          <li key={r.id}>
            <strong>{r.name}</strong>
            <span className="rights-badge">{r.rights?.map((rt: any) => rt.name).join(', ')}</span>
            <button onClick={() => handleEdit(r)}>Edit</button>
            <button onClick={() => handleDelete(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StudentProgressSection() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((s: RootState) => s.users.list);
  const { studentReport, studentDaily } = useSelector((s: RootState) => s.progress);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const viewProgress = (id: number) => {
    setSelectedId(id);
    dispatch(fetchStudentProgress(id));
    dispatch(fetchStudentDaily(id));
  };

  const pct = studentReport && studentReport.total > 0
    ? Math.round((studentReport.solved / studentReport.total) * 100) : 0;

  return (
    <section>
      <h2>Student Progress</h2>
      <div className="student-select">
        <select onChange={(e) => viewProgress(+e.target.value)} value={selectedId ?? ''}>
          <option value="" disabled>Select a student...</option>
          {users.filter((u: any) => u.roles?.some((r: any) => r.name === 'STUDENT')).map((u: any) => (
            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
          ))}
        </select>
      </div>

      {studentReport && (
        <div className="stats-grid" style={{ marginTop: '1rem' }}>
          <div className="stat-card">
            <div className="stat-num">{studentReport.solved}/{studentReport.total}</div>
            <div className="stat-label">Problems Solved</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{studentDaily?.streak ?? 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      )}

      {studentReport?.records?.length > 0 && (
        <section>
          <h3>Solved Problems</h3>
          <div className="solved-list">
            {studentReport.records.map((r: any) => (
              <div key={r.id} className="solved-item">
                <a href={r.problem?.url} target="_blank">{r.problem?.title}</a>
                <span className="date">{r.solvedDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function RightsSection() {
  const dispatch = useDispatch<AppDispatch>();
  const rights = useSelector((s: RootState) => s.rights.list);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { dispatch(fetchRights()); }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createRight({ name })).unwrap();
      setMsg(`Right "${name}" created`);
      setName('');
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteRight(id)).unwrap();
    setMsg('Right deleted');
  };

  return (
    <section>
      <h2>Manage Rights</h2>
      {msg && <div className="msg">{msg}</div>}
      <form onSubmit={handleCreate}>
        <input placeholder="Right name (e.g. VIEW_CONTENT)" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} required />
        <button type="submit">Create Right</button>
      </form>

      <ul className="rights-list">
        {rights.map((r: any) => (
          <li key={r.id}>
            <span>{r.name}</span>
            <button onClick={() => handleDelete(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
