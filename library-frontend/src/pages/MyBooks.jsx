import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyBooks() {
  const [myLoans, setMyLoans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Grab the logged-in user from local storage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      fetchMyLoans(user.id);
    } else {
      setError('Please log in to view your books.');
    }
  }, []);

  const fetchMyLoans = async (userId) => {
    try {
      // 2. Fetch only the loans belonging to this user
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/loans/user/${userId}`);
      setMyLoans(response.data);
    } catch (err) {
      console.error("Error fetching my loans", err);
      setError('Failed to load your books.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>My Borrowed Books</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {myLoans.length === 0 && !error ? (
        <p>You haven't reserved or borrowed any books yet!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Book Title</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {myLoans.map((loan) => (
              <tr key={loan.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <strong>{loan.book_title}</strong> <br/>
                  <small style={{ color: '#666' }}>{loan.author}</small>
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'white',
                    backgroundColor: loan.status === 'reserved' ? 'orange' : loan.status === 'borrowed' ? 'blue' : 'green' 
                  }}>
                    {loan.status}
                  </span>
                </td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {/* Format the date nicely, or show N/A if it hasn't been checked out yet */}
                  {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : 'Pending Checkout'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}