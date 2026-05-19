import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './ProductDetailPage.css';

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

  if (!product) return <p className="loading">Loading...</p>;

  return (
    <div className="product-detail-page">
      <div className="product-top">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
        <div className="product-details">
          <p className="product-category">{product.categoryName}</p>
          <h2 className="product-name">{product.name}</h2>
          <p className="product-description">{product.description}</p>
          <p className="product-price">{product.price.toFixed(2)} MAD</p>
          <p className="product-stock">
            {inventory ? (inventory.quantity > 0 ? `✅ In stock (${inventory.quantity} left)` : '❌ Out of stock') : 'Stock unknown'}
          </p>
          {message && <p className="product-message">{message}</p>}
          <button className="add-to-cart-button" onClick={handleAddToCart}
            disabled={inventory && inventory.quantity === 0}>
            Add to Cart
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        {user && (
          <form onSubmit={handleReview} className="review-form">
            <select className="review-input" value={reviewForm.rating}
              onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)}</option>)}
            </select>
            <textarea className="review-textarea"
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
            <button className="review-submit-button" type="submit">Submit Review</button>
          </form>
        )}
        {reviews.length === 0 ? <p className="no-reviews">No reviews yet.</p> :
          reviews.map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{r.authorName}</strong>
                <span>{'⭐'.repeat(r.rating)}</span>
              </div>
              <p className="review-comment">{r.comment}</p>
            </div>
          ))}
      </div>
    </div>
  );
}