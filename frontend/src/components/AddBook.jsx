import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [copies, setCopies] = useState(''); // Changed from 1 to '' so the placeholder shows!
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post('http://localhost:5000/api/books', {
        title,
        author,
        isbn: isbn || undefined, 
        genre,
        copies: parseInt(copies), // Converts the typed text into a proper number
        imageUrl
      });

      setMessage('Book added successfully!');
      
      // Clear the form
      setTitle('');
      setAuthor('');
      setIsbn('');
      setGenre('');
      setCopies('');
      setImageUrl('');
      
      setTimeout(() => navigate('/admin/manage-books'), 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Error adding book');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Add a New Book</h2>
      
      {message && <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="number" placeholder="Number of Copies" value={copies} onChange={(e) => setCopies(e.target.value)} required min="1"
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="text" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="url" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button type="submit" style={{ padding: '12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Book to Inventory
        </button>
      </form>
    </div>
  );
}

export default AddBook;