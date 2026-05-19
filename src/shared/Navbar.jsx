import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-brand">E-Store</Link>
      <div className="navbar-links">
        <Link to="/catalog" className="navbar-link">Catalog</Link>
        {user ? (
          <>
            <Link to="/cart" className="navbar-link">🛒 Cart</Link>
            <Link to="/orders" className="navbar-link">Orders</Link>
            <Link to="/profile" className="navbar-link">Profile</Link>
            {user.role == 'ADMIN' && (
              <Link to="/admin" className="navbar-admin-link">⚙ Admin</Link>
            )}
            <span className="navbar-user">Hi, {user.firstName}</span>
            <button onClick={handleLogout} className="navbar-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}