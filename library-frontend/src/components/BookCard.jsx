import axios from 'axios';
import { useState } from 'react';

export default function BookCard({ book }) {
  const [message, setMessage] = useState('');

  const handleReserve = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Security check: Make sure they are logged in!
    if (!user) {
      alert("Please login first to reserve a book!");
      return;
    }

    try {
      // Send the request to your backend loans table
      await axios.post(`${import.meta.env.VITE_API_URL}/api/loans/reserve`, {
        user_id: user.id,
        book_id: book.id
      });
      setMessage('✅ Reserved!');
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Failed'));
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '15px', 
      width: '250px',
      boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column' // Helps keep the button at the bottom
    }}>
      
      {/* --- NEW IMAGE SECTION --- */}
      {book.image_url ? (
        <img 
          src={book.image_url} 
          alt={`Cover of ${book.title}`} 
          style={{ 
            width: '100%', 
            height: '300px', 
            objectFit: 'contain', // Prevents the image from stretching weirdly
            borderRadius: '4px',
            marginBottom: '15px',
            backgroundColor: '#f8f9fa'
          }} 
        />
      ) : (
        <div style={{ 
            width: '100%', 
            height: '300px', 
            backgroundColor: '#f4f4f4', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '4px',
            marginBottom: '15px',
            color: '#888'
        }}>
          <span>No Cover Image</span>
        </div>
      )}
      
      {/* Book Details */}
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{book.title}</h3>
      <p style={{ margin: '5px 0' }}><strong>Author:</strong> {book.author}</p>
      <p style={{ margin: '5px 0' }}><strong>ISBN:</strong> {book.isbn}</p>
      
      {/* Show dynamic message if reserved */}
      {message && <p style={{ fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red', margin: '5px 0' }}>{message}</p>}
      
      <p style={{ color: book.available_copies > 0 ? 'green' : 'red', marginTop: 'auto', marginBottom: '15px' }}>
        {book.available_copies > 0 ? `${book.available_copies} Copies Available` : 'Out of Stock'}
      </p>
      
      <button 
        onClick={handleReserve}
        disabled={book.available_copies === 0}
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: book.available_copies > 0 ? '#007bff' : '#ccc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: book.available_copies > 0 ? 'pointer' : 'not-allowed',
          fontWeight: 'bold'
        }}>
        {book.available_copies > 0 ? 'Reserve' : 'Unavailable'}
      </button>
    </div>
  );
}