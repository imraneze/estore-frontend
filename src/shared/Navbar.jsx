import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/catalog" style={styles.brand}>🛍 E-Store</Link>
      <div style={styles.links}>
        <Link to="/catalog" style={styles.link}>Catalog</Link>
        {user ? (
          <>
            <Link to="/cart" style={styles.link}>🛒 Cart</Link>
            <Link to="/orders" style={styles.link}>Orders</Link>
            <Link to="/profile" style={styles.link}>Profile</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={styles.adminLink}>⚙ Admin</Link>
            )}
            <span style={styles.user}>Hi, {user.firstName}</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 2rem', height: '60px', background: '#1a1a2e', color: 'white' },
  brand: { color: 'white', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 'bold' },
  links: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  link: { color: '#ccc', textDecoration: 'none', fontSize: '0.95rem' },
  adminLink: { color: '#ffd166', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 'bold' },
  user: { color: '#009036', fontSize: '0.9rem' },
  button: { background: '#e63946', color: 'white', border: 'none',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' },
};