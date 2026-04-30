import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import our Lego Pieces
import Navbar from './components/Navbar';

// Import our Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyBooks from './pages/MyBooks';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* Putting the Navbar outside the Routes means it stays on top all the time! */}
      <Navbar />
      
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* The Traffic Cop Rules */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* Protected Route for logged-in regular users */}
          <Route 
            path="/mybooks" 
            element={
              <ProtectedRoute requireAdmin={false}>
                <MyBooks />
              </ProtectedRoute>
            } 
          />

          {/* Protected Route strictly for Admins */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;