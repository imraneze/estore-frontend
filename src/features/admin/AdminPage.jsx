import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const emptyProduct = { name: '', description: '', price: '', imageUrl: '', categoryId: '' };

export default function AdminPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // category form
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [editingCatId, setEditingCatId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return navigate('/catalog');
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = () => api.get('/products').then(res => setProducts(res.data));
  const loadCategories = () => api.get('/categories').then(res => setCategories(res.data));

  // ── Products ──────────────────────────────────────────────

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId) };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('✅ Product updated successfully');
      } else {
        await api.post('/products', payload);
        setMessage('✅ Product created successfully');
      }
      setForm(emptyProduct);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Operation failed'));
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
    });
    setEditingId(product.id);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage('✅ Product deleted');
      loadProducts();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Delete failed'));
    }
  };

  const handleCancel = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setMessage('');
  };

  // ── Categories ────────────────────────────────────────────

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingCatId) {
        await api.put(`/categories/${editingCatId}`, catForm);
        setMessage('✅ Category updated');
      } else {
        await api.post('/categories', catForm);
        setMessage('✅ Category created');
      }
      setCatForm({ name: '', description: '' });
      setEditingCatId(null);
      loadCategories();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Operation failed'));
    }
  };

  const handleEditCat = (cat) => {
    setCatForm({ name: cat.name, description: cat.description });
    setEditingCatId(cat.id);
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage('✅ Category deleted');
      loadCategories();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Delete failed'));
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>⚙ Admin Dashboard</h2>

      {message && <p style={styles.message}>{message}</p>}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={activeTab === 'products' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('products')}>Products</button>
        <button style={activeTab === 'categories' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('categories')}>Categories</button>
      </div>

      {/* ── Products Tab ── */}
      {activeTab === 'products' && (
        <>
          {/* Product Form */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <input style={styles.input} placeholder="Product name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input style={styles.input} placeholder="Price (MAD)"
                  type="number" step="0.01" min="0"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input style={styles.input} placeholder="Image URL"
                  value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
                <select style={styles.input} value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <textarea style={styles.textarea} placeholder="Description"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div style={styles.formActions}>
                <button style={styles.submitBtn} type="submit">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button style={styles.cancelBtn} type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products Table */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>All Products ({products.length})</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Price</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <img src={p.imageUrl} alt={p.name} style={styles.thumb} />
                      </td>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.categoryName}</td>
                      <td style={styles.td}>{parseFloat(p.price).toFixed(2)} MAD</td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Categories Tab ── */}
      {activeTab === 'categories' && (
        <>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>{editingCatId ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
            <form onSubmit={handleCatSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <input style={styles.input} placeholder="Category name"
                  value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                <input style={styles.input} placeholder="Description"
                  value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
              </div>
              <div style={styles.formActions}>
                <button style={styles.submitBtn} type="submit">
                  {editingCatId ? 'Update Category' : 'Add Category'}
                </button>
                {editingCatId && (
                  <button style={styles.cancelBtn} type="button"
                    onClick={() => { setCatForm({ name: '', description: '' }); setEditingCatId(null); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>All Categories ({categories.length})</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} style={styles.tableRow}>
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{c.description}</td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => handleEditCat(c)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => handleDeleteCat(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { marginBottom: '1.5rem', color: '#1a1a2e' },
  message: { padding: '0.8rem 1rem', background: '#f0fdf4', borderRadius: '8px', marginBottom: '1rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: { padding: '8px 20px', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white', color: '#666', fontSize: '0.95rem' },
  tabActive: { padding: '8px 20px', border: '2px solid #1a1a2e', borderRadius: '8px', cursor: 'pointer', background: '#1a1a2e', color: 'white', fontSize: '0.95rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardTitle: { marginBottom: '1.2rem', color: '#1a1a2e', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  input: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical' },
  formActions: { display: 'flex', gap: '1rem' },
  submitBtn: { padding: '10px 24px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  cancelBtn: { padding: '10px 24px', background: '#888', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#666', borderBottom: '2px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '0.9rem', verticalAlign: 'middle' },
  thumb: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' },
  editBtn: { padding: '5px 12px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', fontSize: '0.85rem' },
  deleteBtn: { padding: '5px 12px', background: '#e63946', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
};