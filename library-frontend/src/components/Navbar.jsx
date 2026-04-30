import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  // Safely check the browser's memory for a logged-in user
  // We check if it exists first so JSON.parse doesn't crash on an empty value!
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.clear(); // Wipe the browser memory
    navigate('/login');   // Send them back to the login page
  };

  return (
    <nav style={{ padding: '15px', backgroundColor: '#333', color: 'white', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h2 style={{ display: 'inline', marginRight: '30px' }}>📚 Library System</h2>
        <Link to="/" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</Link>
        
        {/* Show "My Books" ONLY if a user is logged in AND they are NOT an admin */}
        {user &&(
          <Link to="/mybooks" style={{ color: 'white', marginLeft: '15px', textDecoration: 'none' }}>My Books</Link>
        )}

        {/* Show "Dashboard" ONLY if a user is logged in AND they ARE an admin */}
        {user && user.role === 'admin' && (
          <Link to="/dashboard" style={{ color: 'white', marginLeft: '15px', textDecoration: 'none' }}>Dashboard</Link>
        )}
      </div>
      
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px', fontWeight: 'bold' }}>Hi, {user.name}!</span>
            <button onClick={handleLogout} style={{ cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}