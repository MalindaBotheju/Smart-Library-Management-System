import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Home from './components/Home';
import AddBook from './components/AddBook';
import ManageBooks from './components/ManageBooks';
import EditBook from './components/EditBook';
import BorrowBook from './components/BorrowBook';
import BorrowHistory from './components/BorrowHistory';

function App() {
  const [user, setUser] = useState(null);

  // REAL LOGOUT LOGIC
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div style={{ backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
        <Navbar user={user} handleLogout={handleLogout} />

        <div style={{ padding: '20px' }}>
          <Routes>
            {/* 1. Show the beautiful book cards on the home page */}
            <Route path="/" element={<Home user={user} />} />
            
            <Route path="/login" element={<Auth setUser={setUser} />} />

            {/* 2. Admin Protected Route: Add Book */}
            <Route path="/admin/add-book" element={
              user?.role === 'admin' 
                ? <AddBook />
                : <h2 style={{ color: 'red', textAlign: 'center' }}>Access Denied: You must be an admin.</h2>
            } />

            {/* 3. Admin Protected Route: Manage Books */}
            <Route path="/admin/manage-books" element={
              user?.role === 'admin' 
                ? <ManageBooks />
                : <h2 style={{ color: 'red', textAlign: 'center' }}>Access Denied: You must be an admin.</h2>
            } />

            {/* 4. Admin Protected Route: Edit Book */}
            <Route path="/admin/edit-book/:id" element={
              user?.role === 'admin' 
                ? <EditBook />
                : <h2 style={{ color: 'red', textAlign: 'center' }}>Access Denied: You must be an admin.</h2>
            } />
            {/* Admin Protected Route: Borrow Book Form */}
            <Route path="/admin/borrow-book/:id" element={
              user?.role === 'admin' ? <BorrowBook /> : <h2 style={{ color: 'red', textAlign: 'center' }}>Access Denied.</h2>
            } />

            {/* Admin Protected Route: Borrowing History Table */}
            <Route path="/admin/borrow-history" element={
              user?.role === 'admin' ? <BorrowHistory /> : <h2 style={{ color: 'red', textAlign: 'center' }}>Access Denied.</h2>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;