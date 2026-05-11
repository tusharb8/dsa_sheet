import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../store/authSlice';
import type { AppDispatch } from '../store';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try {
      if (isRegister) {
        await dispatch(register({ email, password, name })).unwrap();
      } else {
        await dispatch(login({ email, password })).unwrap();
      }
      nav('/sheet');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handle} className="login-form">
        <h1>DSA Sheet</h1>
        <p className="sub">{isRegister ? 'Create account' : 'Sign in to continue'}</p>

        {err && <div className="error">{err}</div>}

        {isRegister && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">{isRegister ? 'Register' : 'Sign In'}</button>

        <p className="switch">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" className="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </form>
    </div>
  );
}
