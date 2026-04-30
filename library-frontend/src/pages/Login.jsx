import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for registration
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload);
      
      // Save the token and user info to the browser's memory
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setMessage(`Success! Welcome ${response.data.user.name}`);
      
      // Redirect to Home after 1 second
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
      
      {message && <p style={{ color: 'blue' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isRegistering && (
          <input 
            type="text" placeholder="Full Name" 
            value={name} onChange={(e) => setName(e.target.value)} required 
          />
        )}
        <input 
          type="email" placeholder="Email Address" 
          value={email} onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="Password" 
          value={password} onChange={(e) => setPassword(e.target.value)} required 
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#333', color: 'white', cursor: 'pointer' }}>
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Login here' : 'Register here'}
        </button>
      </p>
    </div>
  );
}