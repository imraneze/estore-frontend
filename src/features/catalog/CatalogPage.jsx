import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import './CatalogPage.css'

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');

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
    <div className="catalog-page">
      <h2 className="catalog-heading">Product Catalog</h2>
      <div className="catalog-filters">
        <input className="catalog-search" placeholder="Search products..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="catalog-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="catalog-grid">
        {products.map(p => (
          <div key={p.id} className="catalog-card" onClick={() => navigate(`/products/${p.id}`)}>
            <img src={p.imageUrl} alt={p.name} className="catalog-image" />
            <div className="catalog-info">
              <p className="catalog-category">{p.categoryName}</p>
              <h3 className="catalog-name">{p.name}</h3>
              <p className="catalog-price">{p.price.toFixed(2)} MAD</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}