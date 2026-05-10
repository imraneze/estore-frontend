import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [form, setForm] = useState({ phone: '', address: '', city: '', country: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get(`/users/${user.id}/profile`)
      .then(res => setForm(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}/profile`, form);
      setMessage('✅ Profile updated successfully!');
    } catch (err) {
      setMessage('❌ Update failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>My Profile</h2>
        <p style={styles.name}>{user?.firstName} {user?.lastName}</p>
        <p style={styles.email}>{user?.email}</p>
        {message && <p style={styles.message}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Phone"
            value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input style={styles.input} placeholder="Address"
            value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />
          <input style={styles.input} placeholder="City"
            value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
          <input style={styles.input} placeholder="Country"
            value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} />
          <button style={styles.button} type="submit">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', padding: '2rem', background: '#f0f2f5', minHeight: 'calc(100vh - 60px)' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '12px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: 'fit-content' },
  title: { marginBottom: '0.5rem', color: '#1a1a2e' },
  name: { fontWeight: 'bold', margin: '0 0 4px', fontSize: '1.1rem' },
  email: { color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' },
  message: { padding: '0.8rem', background: '#f0fdf4', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  input: { width: '100%', padding: '10px', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.95rem' },
  button: { width: '100%', padding: '11px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
};