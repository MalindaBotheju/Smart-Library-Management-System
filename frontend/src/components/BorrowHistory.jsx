import { useState, useEffect } from 'react';
import axios from 'axios';

function BorrowHistory() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  
  // States to control our pop-up "Return Form" (Modal)
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actualReturnDate, setActualReturnDate] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter logic: Search by Borrower Name, Book Title, or Status
  const filteredTransactions = transactions.filter((t) =>
    t.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (transaction) => {
    setSelectedTransaction(transaction);
    const today = new Date().toISOString().split('T')[0];
    setActualReturnDate(today);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/transactions/${selectedTransaction._id}/return`, {
        actualReturnDate: actualReturnDate,
        status: 'Returned'
      });
      
      alert('Book returned successfully!');
      setSelectedTransaction(null); 
      fetchHistory(); 
      
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Failed to return book. Check backend connection.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Library Borrowing History</h2>
      
      {/* --- SEARCH BAR --- */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Search by Borrower, Book Title, or Status..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '12px 25px',
            fontSize: '1rem',
            border: '2px solid #eee',
            borderRadius: '30px',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#28a745';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#eee';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
          }}
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>
          {searchTerm ? `No results found for "${searchTerm}"` : 'No books have been borrowed yet.'}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'center', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#333', color: '#fff' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Borrower Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Book Title</th>
              <th style={{ padding: '12px' }}>Borrow Date</th>
              <th style={{ padding: '12px' }}>Due Date</th>
              <th style={{ padding: '12px' }}>Actual Return Date</th>
              <th style={{ padding: '12px' }}>Fine</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>{t.borrowerName}</td>
                <td style={{ padding: '12px', textAlign: 'left' }}>{t.bookTitle}</td>
                
                <td style={{ padding: '12px' }}>{new Date(t.borrowDate).toLocaleDateString()}</td>
                
                <td style={{ padding: '12px' }}>
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                
                <td style={{ padding: '12px' }}>
                  {t.status === 'Returned' && t.actualReturnDate 
                    ? new Date(t.actualReturnDate).toLocaleDateString() 
                    : '-'}
                </td>

                <td style={{ padding: '12px', fontWeight: 'bold', color: t.fine > 0 ? '#dc3545' : '#28a745' }}>
                  {t.status === 'Returned' 
                    ? (t.fine && t.fine > 0 ? `Rs. ${t.fine}` : 'No Fine') 
                    : '-'}
                </td>
                
                <td style={{ padding: '12px' }}>
                  {t.status === 'Returned' ? (
                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#d4edda', color: '#155724' }}>
                      Returned
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleOpenModal(t)}
                      style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      title="Click to process return"
                    >
                      Borrowed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- RETURN MODAL --- */}
      {selectedTransaction && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>Process Book Return</h3>
            
            <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.95rem', color: '#444' }}>
              <p style={{ margin: '5px 0' }}><strong>Book:</strong> {selectedTransaction.bookTitle}</p>
              <p style={{ margin: '5px 0' }}><strong>Borrower:</strong> {selectedTransaction.borrowerName}</p>
              <p style={{ margin: '5px 0' }}><strong>Due Date:</strong> {selectedTransaction.dueDate ? new Date(selectedTransaction.dueDate).toLocaleDateString() : 'N/A'}</p>
            </div>

            <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Actual Return Date:</label>
                <input 
                    type="date" 
                    value={actualReturnDate}
                    // Removing onChange ensures the state isn't updated by user input
                    // readOnly prevents the date picker from opening
                    readOnly 
                    required
                    style={{ 
                    width: '100%', 
                    padding: '10px', 
                    marginTop: '5px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc', 
                    boxSizing: 'border-box',
                    // Visual feedback: gray background and disabled cursor
                    backgroundColor: '#f0f0f0', 
                    cursor: 'not-allowed',
                    color: '#666'
                    }}
                />
                </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedTransaction(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#e2e3e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowHistory;