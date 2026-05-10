import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function CatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    api.get('/products', { params }).then(res => setProducts(res.data));
  }, [search, categoryId]);

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Product Catalog</h2>
      <div style={styles.filters}>
        <input style={styles.search} placeholder="Search products..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select style={styles.select} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card} onClick={() => navigate(`/products/${p.id}`)}>
            <img src={p.imageUrl} alt={p.name} style={styles.image} />
            <div style={styles.info}>
              <p style={styles.category}>{p.categoryName}</p>
              <h3 style={styles.name}>{p.name}</h3>
              <p style={styles.price}>{p.price.toFixed(2)} MAD</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  heading: { marginBottom: '1.5rem', color: '#1a1a2e' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  search: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  select: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', minWidth: '180px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } },
  image: { width: '100%', height: '180px', objectFit: 'cover' },
  info: { padding: '1rem' },
  category: { color: '#888', fontSize: '0.8rem', marginBottom: '4px' },
  name: { fontSize: '1rem', margin: '0 0 8px', color: '#1a1a2e' },
  price: { color: '#e63946', fontWeight: 'bold', fontSize: '1rem' },
};