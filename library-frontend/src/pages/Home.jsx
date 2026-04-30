import { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  // --- NEW: PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Shows 8 books per page (2 rows of 4)

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- NEW: RESET PAGE WHEN FILTER CHANGES ---
  // If the user changes the genre, bump them back to Page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books`);
      setBooks(response.data); 
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const uniqueGenres = ['All', ...new Set(books.map(book => book.genre).filter(Boolean))];

  const filteredBooks = selectedGenre === 'All' 
    ? books 
    : books.filter(book => book.genre === selectedGenre);

  // --- NEW: PAGINATION MATH ---
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  // Slice the filtered array to only grab the books for the current page
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ textAlign: 'center' }}>Library Catalog</h1>
      
      {/* The Filter Panel */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Filter by Genre:</label>
        <select 
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)}
          style={{ padding: '5px', fontSize: '1rem', borderRadius: '4px' }}
        >
          {uniqueGenres.map((genre, index) => (
            <option key={index} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* The Book Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
        {/* Map over 'currentBooks' instead of 'filteredBooks' */}
        {currentBooks.length > 0 ? (
          currentBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <p>No books found for this category...</p>
        )}
      </div>

      {/* --- NEW: PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px',
          marginTop: '40px' 
        }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            style={{ 
              padding: '10px 20px', 
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              backgroundColor: currentPage === 1 ? '#ccc' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Previous
          </button>
          
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            style={{ 
              padding: '10px 20px', 
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: currentPage === totalPages ? '#ccc' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}