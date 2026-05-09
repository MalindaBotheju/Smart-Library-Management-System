import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [copies, setCopies] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/books/${id}`);
        const book = response.data;
        
        setTitle(book.title);
        setAuthor(book.author);
        setIsbn(book.isbn || '');
        setGenre(book.genre || '');
        setCopies(book.copies || 1);
        setImageUrl(book.imageUrl || '');
        setIsAvailable(book.isAvailable);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };
    fetchBookDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, {
        title,
        author,
        isbn: isbn || undefined,
        genre,
        copies: parseInt(copies),
        imageUrl,
        isAvailable
      });

      setMessage('Book updated successfully!');
      setTimeout(() => navigate('/admin/manage-books'), 1500);
    } catch (error) {
      console.error('Error updating book:', error);
      setMessage('Error updating book.');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Book</h2>
      
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px' }} />
        <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required style={{ padding: '10px' }} />
        <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '10px' }} />
        <input type="number" placeholder="Number of Copies" value={copies} onChange={(e) => setCopies(e.target.value)} required min="1" style={{ padding: '10px' }} />
        <input type="text" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} style={{ padding: '10px' }} />
        <input type="url" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ padding: '10px' }} />
        
        <select value={isAvailable} onChange={(e) => setIsAvailable(e.target.value === 'true')} style={{ padding: '10px' }}>
          <option value="true">Available</option>
          <option value="false">Borrowed</option>
        </select>

        <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Update Book
        </button>
      </form>
    </div>
  );
}

export default EditBook;