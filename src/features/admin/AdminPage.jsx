import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './AdminPage.css'

const emptyProduct = {
  name: '', description: '', price: '',
  imageUrl: '', categoryId: '', initialStock: 0
};

export default function AdminPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMode, setUploadMode] = useState('url');

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
    initialStock: product.stock ?? 0,
  });
  setEditingId(product.id);
  setImagePreview(product.imageUrl || '');
  setImageFile(null);
  setUploadMode('url');
  setActiveTab('products');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this product?')) return;
  try {
    await api.delete(`/products/${id}`);
    setMessage('✅ Product deleted successfully');
    loadProducts();
    loadCategories(); // reload inventory too
  } catch (err) {
    setMessage('❌ ' + (err.response?.data?.error || 'Delete failed — check the console'));
    console.error(err);
  }
};

  const handleCancel = () => {
  setForm(emptyProduct);
  setEditingId(null);
  setMessage('');
  setImagePreview('');
  setImageFile(null);
  setUploadMode('url');
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
    setMessage('✅ Category deleted successfully');
    loadCategories();
  } catch (err) {
    setMessage('❌ ' + (err.response?.data?.error || 'Delete failed — check the console'));
    console.error(err);
  }
};

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8080/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm({ ...form, imageUrl: data.imageUrl });
      setImagePreview(data.imageUrl);
    } catch (err) {
      setMessage('❌ Image upload failed');
    }
  };

  return (
    <div className="admin-page">
      <h2 className="admin-page__heading">⚙ Admin Dashboard</h2>

      {message && <p className="admin-page__message">{message}</p>}

      {/* Tabs */}
      <div className="admin-page__tabs">
        <button
          type="button"
          className={`admin-page__tab ${activeTab === 'products' ? 'admin-page__tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          type="button"
          className={`admin-page__tab ${activeTab === 'categories' ? 'admin-page__tab--active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      {/* ── Products Tab ── */}
      {activeTab === 'products' && (
        <>
          {/* Product Form */}
          <div className="admin-page__card">
            <h3 className="admin-page__card-title">{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
            <form className="admin-page__form" onSubmit={handleProductSubmit}>
              <div className="admin-page__form-grid">
                <input
                  className="admin-page__input"
                  placeholder="Product name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
                <select
                  className="admin-page__select"
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                
                <div className="admin-page__upload-group">
                  <div className="admin-page__toggle">
                    <button
                      type="button"
                      className={`admin-page__toggle-btn ${uploadMode === 'url' ? 'admin-page__toggle-btn--active' : ''}`}
                      onClick={() => { setUploadMode('url'); setImagePreview(''); }}
                    >
                      🔗 URL
                    </button>
                    <button
                      type="button"
                      className={`admin-page__toggle-btn ${uploadMode === 'file' ? 'admin-page__toggle-btn--active' : ''}`}
                      onClick={() => { setUploadMode('file'); setImagePreview(''); }}
                    >
                      📁 Upload
                    </button>
                  </div>

                  {uploadMode === 'url' ? (
                    <input
                      className="admin-page__input"
                      placeholder="Image URL"
                      value={form.imageUrl}
                      onChange={e => {
                        setForm({ ...form, imageUrl: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                    />
                  ) : (
                    <div
                      className="admin-page__upload-zone"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) { setImageFile(file); handleImageUpload(file); }
                      }}
                    >
                      <input
                        className="admin-page__file-input"
                        type="file"
                        accept="image/*"
                        id="imageUpload"
                        hidden
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) { setImageFile(file); handleImageUpload(file); }
                        }}
                      />
                      <label className="admin-page__upload-label" htmlFor="imageUpload">
                        {imageFile ? imageFile.name : '📂 Click to choose or drag & drop an image'}
                      </label>
                    </div>
                  )}

                  {(imagePreview || form.imageUrl) && (
                    <img
                      className="admin-page__image-preview"
                      src={imagePreview || form.imageUrl}
                      alt="preview"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                </div>
                <textarea
                className="admin-page__textarea"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              </div>
              <div className="admin-page__form-grid">
              <input
                  className="admin-page__input"
                  placeholder="Price (MAD)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                />
                <div className="admin-page__form-grid">
                  <input
                    className="admin-page__input"
                    placeholder="Stock quantity"
                    type="number"
                    min="0"
                    value={form.initialStock}
                    onChange={e => setForm({ ...form, initialStock: parseInt(e.target.value) || 0 })}
                  />
                  <span className="admin-page__stock-label">
                    {editingId ? 'Current stock' : 'Initial stock'}
                  </span>
                  </div>
                </div>
              <div className="admin-page__form-actions">
                <button className="admin-page__button admin-page__button--primary" type="submit">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                {editingId && (
                  <button className="admin-page__button admin-page__button--secondary" type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products Table */}
          <div className="admin-page__card">
            <h3 className="admin-page__card-title">All Products ({products.length})</h3>
            <div className="admin-page__table-wrapper">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img className="admin-page__thumb" src={p.imageUrl} alt={p.name} />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.categoryName}</td>
                      <td>{parseFloat(p.price).toFixed(2)} MAD</td>
                      <td>
                        <span>
                          {p.stock ?? 0}
                        </span>
                      </td>
                      <td>
                        <button className="admin-page__button admin-page__button--secondary" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="admin-page__button admin-page__button--danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
          <div className="admin-page__card">
            <h3 className="admin-page__card-title">{editingCatId ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
            <form className="admin-page__form" onSubmit={handleCatSubmit}>
              <div className="admin-page__form-grid">
                <input
                  className="admin-page__input"
                  placeholder="Category name"
                  value={catForm.name}
                  onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  required
                />
                <input
                  className="admin-page__input"
                  placeholder="Description"
                  value={catForm.description}
                  onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                />
              </div>
              <div className="admin-page__form-actions">
                <button className="admin-page__button admin-page__button--primary" type="submit">
                  {editingCatId ? 'Update Category' : 'Add Category'}
                </button>
                {editingCatId && (
                  <button className="admin-page__button admin-page__button--secondary" type="button"
                    onClick={() => { setCatForm({ name: '', description: '' }); setEditingCatId(null); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-page__card">
            <h3 className="admin-page__card-title">All Categories ({categories.length})</h3>
            <div className="admin-page__table-wrapper">
              <table className="admin-page__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.description}</td>
                      <td>
                        <button className="admin-page__button admin-page__button--secondary" onClick={() => handleEditCat(c)}>Edit</button>
                        <button className="admin-page__button admin-page__button--danger" onClick={() => handleDeleteCat(c.id)}>Delete</button>
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

