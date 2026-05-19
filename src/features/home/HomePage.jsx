import React, { useState, useEffect } from 'react';
import './HomePage.css';
import HeaderImg from '../../assets/tiny-shopping-cart-on-laptop.jpg';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const icons = {
  Electronics: '📱', Fashion: '👔', 'Home & Garden': '🏠',
  Sports: '⚽', Books: '📚', Beauty: '💄',
  Toys: '🧸', Groceries: '🛒', Health: '⚕️',
  Automotive: '🚗', 'Office Supplies': '📎', 'Pet Supplies': '🐾',
};

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/catalog?categoryId=${categoryId}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <img src={HeaderImg} alt="" />
        <div className="hero-content">
          <h1>Welcome to Your Store</h1>
          <p>Discover amazing products across multiple categories</p>
          <Link to="/catalog"><button className="cta-button">Start Shopping</button></Link>
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-icon">
                {icons[category.name] || '🛍'}
              </div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <button className="category-button">Explore</button>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      <div className="featured-section">
        <h2>Featured Products</h2>
        <p>Check out our best sellers this week</p>
        <Link to="/catalog"><button className="cta-button">View All</button></Link>
      </div>
    </div>
  );
};

export default HomePage;