import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Editor from './pages/Editor';
import Preview from './pages/Preview';
import './App.css';

// A simple protected route wrapper.
// Since we have a local bypass for dev mode, we check that too.
function ProtectedRoute({ children }) {
  const isLocalBypass = localStorage.getItem('local_auth_bypass') === 'true';
  // In a real app with Firebase fully set up, you would also check `auth.currentUser`.
  // For now, checking the bypass is enough to let you build the UI.
  if (isLocalBypass) {
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
