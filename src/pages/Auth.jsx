import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isFirebaseConfigured, auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If Firebase isn't configured, bypass auth and just log them in locally
    if (!isFirebaseConfigured) {
      console.warn("Firebase not configured. Bypassing auth for local development.");
      localStorage.setItem('local_auth_bypass', 'true');
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-mesh-bg"></div>
      <div className="auth-card">
        <h1 className="auth-title">vibe.page</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Welcome back. Let\'s get aesthetic.' : 'Claim your space on the internet.'}
        </p>

        {!isFirebaseConfigured && (
          <div className="auth-alert">
            <strong>Dev Mode Active</strong>
            <p>Firebase is not connected. You can click submit to bypass login and test locally.</p>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com" 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
