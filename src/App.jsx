import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Editor from './pages/Editor';
import Preview from './pages/Preview';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return children;
  }
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          {/* Public profile route */}
          <Route path="/:username" element={<Preview />} />
          {/* Fallback old preview route */}
          <Route path="/preview" element={<Preview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
