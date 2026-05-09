import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function BorrowBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. Calculate today's date
  const today = new Date();
  const defaultBorrowDate = today.toISOString().split('T')[0];
  
  // 2. Calculate the due date (14 days from today)
  const due = new Date();
  due.setDate(today.getDate() + 14);
  const defaultDueDate = due.toISOString().split('T')[0];

  const [bookTitle, setBookTitle] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  
  // 3. Set up our state with the auto-filled dates
  const [borrowDate, setBorrowDate] = useState(defaultBorrowDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  
  const [message, setMessage] = useState('');

  // Fetch the book title so the librarian knows which book they are lending out
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`https://smart-library-backend-72me.onrender.com/api/books/${id}`);
        setBookTitle(response.data.title);
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };
    fetchBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 4. Send the calculated dates to the backend alongside the other info
      await axios.post('https://smart-library-backend-72me.onrender.com/api/transactions', {
        bookId: id,
        bookTitle: bookTitle,
        borrowerName: borrowerName,
        borrowDate: borrowDate,
        dueDate: dueDate
      });

      setMessage('Book borrowed successfully!');
      setTimeout(() => navigate('/admin/borrow-history'), 1500);
    } catch (error) {
      console.error('Error borrowing book:', error);
      setMessage('Error processing transaction.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Borrow Book</h2>
      <h3 style={{ textAlign: 'center', color: '#555', marginBottom: '20px', fontStyle: 'italic' }}>{bookTitle || 'Loading...'}</h3>
      
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Borrower Name */}
        <div>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Borrower's Full Name:</label>
          <input 
            type="text" 
            placeholder="John Doe" 
            value={borrowerName} 
            onChange={(e) => setBorrowerName(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
          />
        </div>

        {/* Borrow Date (Auto-filled and LOCKED) */}
        <div>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Borrow Date:</label>
          <input 
            type="date" 
            value={borrowDate}
            readOnly // Locks the input
            style={{ 
              width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', 
              border: '1px solid #ccc', backgroundColor: '#e9ecef', color: '#666', 
              cursor: 'not-allowed', boxSizing: 'border-box' 
            }} 
          />
        </div>

        {/* Due Date (Auto-filled 14 days later and LOCKED) */}
        <div>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Return Due Date (14 Days):</label>
          <input 
            type="date" 
            value={dueDate}
            readOnly // Locks the input
            style={{ 
              width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', 
              border: '1px solid #ccc', backgroundColor: '#e9ecef', color: '#666', 
              cursor: 'not-allowed', boxSizing: 'border-box' 
            }} 
          />
        </div>

        <button type="submit" style={{ padding: '12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Confirm Borrow
        </button>
      </form>
    </div>
  );
}

export default BorrowBook;