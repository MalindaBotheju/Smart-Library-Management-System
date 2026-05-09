import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search input

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('https://smart-library-backend-72me.onrender.com/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleDelete = async (book) => {
    // Logic: If available is less than total, someone has it.
    const borrowedCount = book.copies - book.availableCopies;

    if (borrowedCount > 0) {
        alert(`Restriction: "${book.title}" cannot be deleted because ${borrowedCount} student(s) currently have it. Please wait for the return.`);
        return;
    }

    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
        try {
        await axios.delete(`https://smart-library-backend-72me.onrender.com/api/books/${book._id}`);
        setBooks(books.filter(b => b._id !== book._id));
        } catch (error) {
        // This catches the 400 error from the backend if someone tries to bypass the UI
        alert(error.response?.data?.message || 'Error deleting book');
        }
    }
  };

  // Logic to filter books based on the search term (Title or Author)
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Manage Library Books</h2>
      
      {/* SEARCH BAR SECTION */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by Title or Author..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 20px',
            fontSize: '1rem',
            border: '2px solid #ddd',
            borderRadius: '25px', // Rounded modern look
            outline: 'none',
            transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          {searchTerm ? `No books matching "${searchTerm}"` : "No books found in the database."}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Author</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Available</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{book.title}</td>
                <td style={{ padding: '12px' }}>{book.author}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                   {/* Displaying available count based on our previous logic */}
                   <span style={{ 
                     padding: '4px 10px', 
                     borderRadius: '12px', 
                     fontSize: '0.85rem', 
                     backgroundColor: book.availableCopies > 0 ? '#d4edda' : '#f8d7da',
                     color: book.availableCopies > 0 ? '#155724' : '#721c24',
                     fontWeight: 'bold'
                    }}>
                    {book.availableCopies}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <Link 
                    to={`/admin/edit-book/${book._id}`} 
                    style={{ marginRight: '10px', textDecoration: 'none', backgroundColor: '#007bff', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.9rem' }}
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(book)} // Pass the whole book object here
                    style={{ 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem' 
                    }}
                    >
                    Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageBooks;