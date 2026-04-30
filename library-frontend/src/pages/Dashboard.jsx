import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  // --- STATE FOR DASHBOARD NAVIGATION ---
  const [activeView, setActiveView] = useState('manageBooks');

  // --- STATE FOR SEARCH BARS ---
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [loanSearchTerm, setLoanSearchTerm] = useState('');

  // --- STATE FOR ADDING BOOKS ---
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [copies, setCopies] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [bookMessage, setBookMessage] = useState('');
  const [genre, setGenre] = useState('');
  const [dailyFineRate, setDailyFineRate] = useState(1.00);

  // --- STATE FOR MANAGING LOANS ---
  const [loans, setLoans] = useState([]);
  const [loanMessage, setLoanMessage] = useState('');

  // --- STATE FOR MANAGING BOOKS ---
  const [books, setBooks] = useState([]); 
  const [editingBook, setEditingBook] = useState(null); 

  // --- NEW: PAGINATION STATE ---
  const [currentBookPage, setCurrentBookPage] = useState(1);
  const [currentLoanPage, setCurrentLoanPage] = useState(1);
  const itemsPerPage = 5; // Adjust this number to show more/less rows!

  // Reset to page 1 if the user types in the search bar
  useEffect(() => { setCurrentBookPage(1); }, [bookSearchTerm]);
  useEffect(() => { setCurrentLoanPage(1); }, [loanSearchTerm]);

  useEffect(() => {
    fetchLoans();
    fetchBooks();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/loans`);
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/books`);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault(); 
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/books`, {
        title, author, isbn, total_copies: copies, available_copies: copies, image_url: imageUrl, genre, daily_fine_rate: dailyFineRate
      });
      setBookMessage('✅ Book added successfully!');
      setTitle(''); setAuthor(''); setIsbn(''); setCopies(1); setImageUrl(''); setGenre(''); setDailyFineRate(1.00);
      fetchBooks(); 
    } catch (error) {
      console.error(error);
      setBookMessage('❌ Failed to add book.');
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn,
        total_copies: editingBook.total_copies,
        image_url: editingBook.image_url,
        genre: editingBook.genre,
        daily_fine_rate: editingBook.daily_fine_rate 
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/api/books/${editingBook.id}`, payload);
      alert('Book updated successfully!');
      setEditingBook(null);
      fetchBooks(); 
    } catch (error) {
      console.error("Error updating book", error);
      alert('Failed to update book.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) return; 
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`);
      alert('Book deleted successfully!');
      fetchBooks(); 
    } catch (error) {
      console.error("Error deleting book", error);
      alert(error.response?.data?.error || 'Failed to delete book.');
    }
  };

  const handleAction = async (action, loanId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/loans/${action}/${loanId}`);
      setLoanMessage(`✅ Successfully processed ${action}!`);
      fetchLoans(); 
    } catch (error) {
      setLoanMessage(`❌ Error: ${error.response?.data?.error || 'Failed'}`);
    }
  };

  // --- FILTERING & PAGINATION MATH FOR BOOKS ---
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    (book.genre && book.genre.toLowerCase().includes(bookSearchTerm.toLowerCase()))
  );
  const indexOfLastBook = currentBookPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalBookPages = Math.ceil(filteredBooks.length / itemsPerPage);

  // --- FILTERING & PAGINATION MATH FOR LOANS ---
  const filteredLoans = loans.filter(loan => 
    loan.user_name.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
    loan.book_title.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
    loan.status.toLowerCase().includes(loanSearchTerm.toLowerCase())
  );
  const indexOfLastLoan = currentLoanPage * itemsPerPage;
  const indexOfFirstLoan = indexOfLastLoan - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstLoan, indexOfLastLoan);
  const totalLoanPages = Math.ceil(filteredLoans.length / itemsPerPage);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #f4f4f4' }}>
        <h1 style={{ margin: 0 }}>Librarian Dashboard</h1>
        <select 
          value={activeView} 
          onChange={(e) => setActiveView(e.target.value)} 
          style={{ padding: '10px 15px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white', fontWeight: 'bold' }}
        >
          <option value="manageBooks">Manage Catalog</option>
          <option value="manageLoans">Manage Loans</option>
          <option value="addBook">Add a New Book</option>
        </select>
      </div>

      {/* --- SECTION 1: ADD A NEW BOOK --- */}
      {activeView === 'addBook' && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Add a New Book</h2>
          {bookMessage && <p style={{ fontWeight: 'bold' }}>{bookMessage}</p>}
          <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            <input type="text" placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '8px' }}/>
            <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required style={{ padding: '8px' }}/>
            <input type="text" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} required style={{ padding: '8px' }}/>
            <input type="text" placeholder="Cover Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ padding: '8px' }}/>
            <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} required style={{ padding: '8px' }}/>
            <input type="number" placeholder="Total Copies" value={copies} min="1" onChange={(e) => setCopies(e.target.value)} required style={{ padding: '8px' }}/>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Daily Fine Rate ($)</label>
            <input type="number" step="0.01" value={dailyFineRate} onChange={(e) => setDailyFineRate(e.target.value)} required style={{ padding: '8px' }}/>
            <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: 'white', cursor: 'pointer', borderRadius: '4px', border: 'none' }}>Add Book</button>
          </form>
        </div>
      )}

      {/* --- SECTION 2: MANAGE EXISTING BOOKS --- */}
      {activeView === 'manageBooks' && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Manage Catalog</h2>
          
          <input 
            type="text" 
            placeholder="🔍 Search books by title, author, or genre..." 
            value={bookSearchTerm}
            onChange={(e) => setBookSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #aaa', fontSize: '1rem' }}
          />
          
          {editingBook && (
            <div style={{ border: '2px solid #007bff', padding: '20px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3>Editing: {editingBook.title}</h3>
              <form onSubmit={handleUpdateBook} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                <input type="text" value={editingBook.title} onChange={(e) => setEditingBook({...editingBook, title: e.target.value})} required />
                <input type="text" value={editingBook.author} onChange={(e) => setEditingBook({...editingBook, author: e.target.value})} required />
                <input type="text" value={editingBook.isbn} onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})} required />
                <input type="text" value={editingBook.image_url || ''} onChange={(e) => setEditingBook({...editingBook, image_url: e.target.value})} />
                <input type="text" value={editingBook.genre || ''} onChange={(e) => setEditingBook({...editingBook, genre: e.target.value})} required />
                <input type="number" value={editingBook.total_copies} onChange={(e) => setEditingBook({...editingBook, total_copies: e.target.value})} required />
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Daily Fine Rate ($)</label>
                <input type="number" step="0.01" value={editingBook.daily_fine_rate || 1.00} onChange={(e) => setEditingBook({...editingBook, daily_fine_rate: e.target.value})} required style={{ padding: '8px' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>Save Changes</button>
                  <button type="button" onClick={() => setEditingBook(null)} style={{ flex: 1, backgroundColor: '#ccc', padding: '10px', border: 'none', borderRadius: '4px' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Title</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Author</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Genre</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Copies</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map((book) => (
                <tr key={book.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{book.title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{book.author}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{book.genre || 'N/A'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{book.total_copies}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <button onClick={() => setEditingBook(book)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', marginRight: '5px' }}>Edit</button>
                    <button onClick={() => handleDeleteBook(book.id)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {currentBooks.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No books found.</td></tr>
              )}
            </tbody>
          </table>

          {/* BOOK PAGINATION BUTTONS */}
          {totalBookPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button onClick={() => setCurrentBookPage(prev => Math.max(prev - 1, 1))} disabled={currentBookPage === 1} style={{ padding: '8px 16px', cursor: currentBookPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
              <span style={{ alignSelf: 'center' }}>Page {currentBookPage} of {totalBookPages}</span>
              <button onClick={() => setCurrentBookPage(prev => Math.min(prev + 1, totalBookPages))} disabled={currentBookPage === totalBookPages} style={{ padding: '8px 16px', cursor: currentBookPage === totalBookPages ? 'not-allowed' : 'pointer' }}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* --- SECTION 3: MANAGE LOANS --- */}
      {activeView === 'manageLoans' && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Manage Loans</h2>
          
          <input 
            type="text" 
            placeholder="🔍 Search loans by user, book, or status..." 
            value={loanSearchTerm}
            onChange={(e) => setLoanSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #aaa', fontSize: '1rem' }}
          />

          {loanMessage && <p style={{ fontWeight: 'bold' }}>{loanMessage}</p>}
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>User</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Book</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Actions</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Fine</th>
              </tr>
            </thead>
            <tbody>
              {currentLoans.map((loan) => (
                <tr key={loan.id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{loan.id}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{loan.user_name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{loan.book_title}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: 'white',
                      backgroundColor: loan.status === 'reserved' ? 'orange' : loan.status === 'borrowed' ? 'blue' : 'green' 
                    }}>
                      {loan.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                    {loan.status === 'reserved' && (
                      <button onClick={() => handleAction('checkout', loan.id)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Checkout</button>
                    )}
                    {loan.status === 'borrowed' && (
                      <button onClick={() => handleAction('return', loan.id)} style={{ cursor: 'pointer', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Process Return</button>
                    )}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd', fontWeight: parseFloat(loan.fine_amount) > 0 ? 'bold' : 'normal', color: parseFloat(loan.fine_amount) > 0 ? '#dc3545' : 'inherit' }}>
                    ${parseFloat(loan.fine_amount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {currentLoans.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No loans found matching your search.</td></tr>
              )}
            </tbody>
          </table>

          {/* LOAN PAGINATION BUTTONS */}
          {totalLoanPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button onClick={() => setCurrentLoanPage(prev => Math.max(prev - 1, 1))} disabled={currentLoanPage === 1} style={{ padding: '8px 16px', cursor: currentLoanPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
              <span style={{ alignSelf: 'center' }}>Page {currentLoanPage} of {totalLoanPages}</span>
              <button onClick={() => setCurrentLoanPage(prev => Math.min(prev + 1, totalLoanPages))} disabled={currentLoanPage === totalLoanPages} style={{ padding: '8px 16px', cursor: currentLoanPage === totalLoanPages ? 'not-allowed' : 'pointer' }}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}