import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ user, handleLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // 1. Initialize the navigate hook
  const navigate = useNavigate();

  // 2. Create a wrapper function for logging out
  const onLogoutClick = () => {
    handleLogout();      // This calls the function from App.jsx to clear state/storage
    navigate('/login');  // This forcefully redirects the user to the login screen
  };

  // Reusable style for the Pill Buttons (Login/Logout)
  const buttonStyle = {
    padding: '8px 20px',
    cursor: 'pointer',
    borderRadius: '20px',
    border: '1px solid #fff',
    background: 'transparent',
    color: '#fff',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  };

  return (
    <nav style={{ 
      background: '#333', 
      color: '#fff', 
      padding: '15px 40px', 
      display: 'flex', 
      gap: '30px', 
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      {/* Title / Logo Area */}
      <h2 style={{ margin: 0, marginRight: 'auto', color: '#fff', fontSize: '1.4rem' }}>
        📚 Smart Library System
      </h2>
      
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
      
      {/* ADMIN DROPDOWN */}
      {user && user.role === 'admin' && (
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '16px',
              padding: 0
            }}
          >
            Librarian Dashboard ▼
          </button>
          
          {dropdownOpen && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              left: '0', 
              backgroundColor: '#444', 
              display: 'flex', 
              flexDirection: 'column', 
              minWidth: '180px',
              borderRadius: '6px',
              marginTop: '15px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <Link 
                to="/admin/add-book" 
                style={{ padding: '12px 15px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid #555' }}
                onClick={() => setDropdownOpen(false)}
              >
                Add a Book
              </Link>
              <Link 
                to="/admin/manage-books" 
                style={{ padding: '12px 15px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid #555' }}
                onClick={() => setDropdownOpen(false)}
              >
                Manage Books
              </Link>
              <Link 
                to="/admin/borrow-history" 
                style={{ padding: '12px 15px', color: '#fff', textDecoration: 'none' }}
                onClick={() => setDropdownOpen(false)}
              >
                Borrowing History
              </Link>
            </div>
          )}
        </div>
      )}

      {/* AUTH BUTTONS (Login or Logout) */}
      {user ? (
        <button 
          onClick={onLogoutClick} // 3. Use the new wrapper function here!
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#fff';
          }}
        >
          Logout
        </button>
      ) : (
        <Link 
          to="/login" 
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#fff';
          }}
        >
          Login
        </Link>
      )}
    </nav>
  );
}

export default Navbar;