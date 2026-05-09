import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8; 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setBooks(response.data.length === 0 ? getDummyBooks() : response.data);
      } catch (error) {
        setBooks(getDummyBooks());
      }
    };
    fetchBooks();
  }, []);

  const getDummyBooks = () => [
    { _id: '1', title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', availableCopies: 2, imageUrl: 'https://covers.openlibrary.org/b/id/8406786-L.jpg' },
    { _id: '2', title: '1984', author: 'George Orwell', genre: 'Dystopian', availableCopies: 0, imageUrl: 'https://covers.openlibrary.org/b/id/153153-L.jpg' },
    // ... add more to test pagination if needed
  ];

  // Reset to page 1 when searching or filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre]);

  const genres = ['All', ...new Set(books.map((book) => book.genre).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2rem' }}>Library Inventory</h2>

      {/* FILTER SECTION */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginBottom: '40px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by title or author..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 20px', width: '100%', maxWidth: '400px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Genre:</label>
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      
      {/* BOOK GRID - Rendering currentBooks instead of filteredBooks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
        {currentBooks.map((book) => (
          <div key={book._id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 6px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', height: '280px', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <img src={book.imageUrl || 'https://via.placeholder.com/150x220?text=No+Cover'} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
            </div>
            <h3 style={{ margin: '5px 0', fontSize: '1.1rem', color: '#333' }}>{book.title}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{book.author}</p>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>{book.genre}</p>
            <span style={{ marginTop: 'auto', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: book.availableCopies > 0 ? '#169916' : '#ff0000', color: '#fff' }}>
              {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Out of Stock'}
            </span>
            {user?.role === 'admin' && book.availableCopies > 0 && (
              <Link to={`/admin/borrow-book/${book._id}`} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '15px', padding: '8px', backgroundColor: '#ffc107', color: '#000', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Lend Book</Link>
            )}
          </div>
        ))}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '40px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: '#fff' }}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                backgroundColor: currentPage === index + 1 ? '#333' : '#fff',
                color: currentPage === index + 1 ? '#fff' : '#333',
                fontWeight: 'bold'
              }}
            >
              {index + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: '#fff' }}
          >
            Next
          </button>
        </div>
      )}

      {filteredBooks.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>No books found.</p>}
    </div>
  );
}

export default Home;