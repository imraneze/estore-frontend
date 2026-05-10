import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function CartPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get(`/cart/${user.id}`).then(res => setCart(res.data));
  }, []);

  const handleRemove = async (itemId) => {
    await api.delete(`/cart/remove/${itemId}`);
    const res = await api.get(`/cart/${user.id}`);
    setCart(res.data);
  };

  const handleUpdate = async (itemId, quantity) => {
    if (quantity < 1) return;
    await api.put(`/cart/update/${itemId}`, { quantity });
    const res = await api.get(`/cart/${user.id}`);
    setCart(res.data);
  };

  const handleOrder = async () => {
    try {
      await api.post('/orders', { userId: user.id });
      setMessage('✅ Order placed successfully!');
      const res = await api.get(`/cart/${user.id}`);
      setCart(res.data);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Order failed'));
    }
  };

  if (!cart) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Your Cart</h2>
      {message && <p style={styles.message}>{message}</p>}
      {cart.items.length === 0 ? (
        <p style={{ color: '#888' }}>Your cart is empty. <span style={{ cursor: 'pointer', color: '#1a1a2e' }} onClick={() => navigate('/catalog')}>Browse products →</span></p>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.id} style={styles.item}>
              <img src={item.productImageUrl} alt={item.productName} style={styles.image} />
              <div style={styles.info}>
                <p style={styles.name}>{item.productName}</p>
                <p style={styles.price}>{item.unitPrice.toFixed(2)} MAD each</p>
              </div>
              <div style={styles.controls}>
                <button style={styles.qtyBtn} onClick={() => handleUpdate(item.id, item.quantity - 1)}>−</button>
                <span style={styles.qty}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
              </div>
              <p style={styles.subtotal}>{item.subtotal.toFixed(2)} MAD</p>
              <button style={styles.remove} onClick={() => handleRemove(item.id)}>✕</button>
            </div>
          ))}
          <div style={styles.footer}>
            <p style={styles.total}>Total: <strong>{cart.total.toFixed(2)} MAD</strong></p>
            <button style={styles.orderBtn} onClick={handleOrder}>Place Order</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  heading: { marginBottom: '1.5rem', color: '#1a1a2e' },
  message: { padding: '0.8rem', background: '#f0fdf4', borderRadius: '8px', marginBottom: '1rem' },
  item: { display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  image: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' },
  info: { flex: 1 },
  name: { fontWeight: 'bold', margin: 0, color: '#1a1a2e' },
  price: { color: '#888', fontSize: '0.85rem', margin: '4px 0 0' },
  controls: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qtyBtn: { width: '28px', height: '28px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: 'white', fontSize: '1rem' },
  qty: { minWidth: '24px', textAlign: 'center', fontWeight: 'bold' },
  subtotal: { minWidth: '100px', textAlign: 'right', fontWeight: 'bold', color: '#1a1a2e' },
  remove: { background: 'none', border: 'none', color: '#e63946', cursor: 'pointer', fontSize: '1.1rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  total: { fontSize: '1.1rem', margin: 0 },
  orderBtn: { padding: '12px 28px', background: '#e63946', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
};