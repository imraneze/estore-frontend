import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function OrdersPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get(`/orders/user/${user.id}`).then(res => setOrders(res.data));
  }, []);

  if (orders.length === 0) return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Orders</h2>
      <p style={{ color: '#888' }}>No orders yet.</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>My Orders</h2>
      {orders.map(order => (
        <div key={order.id} style={styles.card}>
          <div style={styles.orderHeader}>
            <span style={styles.orderId}>Order #{order.id}</span>
            <span style={styles.status}>{order.status}</span>
            <span style={styles.date}>{new Date(order.orderDate).toLocaleDateString()}</span>
            <span style={styles.total}>{order.totalAmount.toFixed(2)} MAD</span>
          </div>
          <div style={styles.items}>
            {order.items.map(item => (
              <div key={item.id} style={styles.item}>
                <span>{item.productName}</span>
                <span style={{ color: '#888' }}>x{item.quantity}</span>
                <span>{item.subtotal.toFixed(2)} MAD</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  heading: { marginBottom: '1.5rem', color: '#1a1a2e' },
  card: { background: 'white', borderRadius: '10px', padding: '1.2rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' },
  orderId: { fontWeight: 'bold', color: '#1a1a2e' },
  status: { background: '#d4edda', color: '#155724', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem' },
  date: { color: '#888', fontSize: '0.85rem' },
  total: { fontWeight: 'bold', color: '#e63946' },
  items: { borderTop: '1px solid #f0f0f0', paddingTop: '0.8rem' },
  item: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem', color: '#444' },
};