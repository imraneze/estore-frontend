import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data));
    api.get(`/inventory/product/${id}`).then(res => setInventory(res.data)).catch(() => setInventory(null));
    api.get(`/reviews/product/${id}`).then(res => setReviews(res.data));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart/add', { userId: user.id, productId: product.id, quantity: 1 });
      setMessage('✅ Added to cart!');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Could not add to cart'));
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const res = await api.post('/reviews', {
        productId: product.id, userId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        rating: reviewForm.rating, comment: reviewForm.comment,
      });
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setMessage('❌ Could not submit review');
    }
  };

  if (!product) return <p style={{ padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <img src={product.imageUrl} alt={product.name} style={styles.image} />
        <div style={styles.details}>
          <p style={styles.category}>{product.categoryName}</p>
          <h2 style={styles.name}>{product.name}</h2>
          <p style={styles.description}>{product.description}</p>
          <p style={styles.price}>{product.price.toFixed(2)} MAD</p>
          <p style={styles.stock}>
            {inventory ? (inventory.quantity > 0 ? `✅ In stock (${inventory.quantity} left)` : '❌ Out of stock') : 'Stock unknown'}
          </p>
          {message && <p style={styles.message}>{message}</p>}
          <button style={styles.button} onClick={handleAddToCart}
            disabled={inventory && inventory.quantity === 0}>
            Add to Cart
          </button>
        </div>
      </div>

      <div style={styles.reviewsSection}>
        <h3>Customer Reviews</h3>
        {user && (
          <form onSubmit={handleReview} style={styles.reviewForm}>
            <select style={styles.input} value={reviewForm.rating}
              onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)}</option>)}
            </select>
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
            <button style={styles.reviewButton} type="submit">Submit Review</button>
          </form>
        )}
        {reviews.length === 0 ? <p style={{ color: '#888' }}>No reviews yet.</p> :
          reviews.map(r => (
            <div key={r.id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <strong>{r.authorName}</strong>
                <span>{'⭐'.repeat(r.rating)}</span>
              </div>
              <p style={styles.reviewComment}>{r.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  top: { display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' },
  image: { width: '300px', height: '300px', objectFit: 'cover', borderRadius: '12px' },
  details: { flex: 1, minWidth: '260px' },
  category: { color: '#888', fontSize: '0.85rem' },
  name: { fontSize: '1.6rem', margin: '0.3rem 0', color: '#1a1a2e' },
  description: { color: '#555', margin: '0.8rem 0' },
  price: { fontSize: '1.4rem', color: '#e63946', fontWeight: 'bold' },
  stock: { margin: '0.5rem 0', fontSize: '0.9rem' },
  message: { color: '#2a9d8f', margin: '0.5rem 0' },
  button: { marginTop: '1rem', padding: '12px 28px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  reviewsSection: { borderTop: '1px solid #eee', paddingTop: '1.5rem' },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', maxWidth: '500px' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  reviewButton: { padding: '10px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  reviewCard: { background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '0.8rem' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' },
  reviewComment: { color: '#444', margin: 0 },
};