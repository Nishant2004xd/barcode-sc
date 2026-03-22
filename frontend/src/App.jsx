import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Upload from './pages/Upload';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import MobileScan from './pages/MobileScan';
import './App.css';

function Layout({ children }) {
  return (
    <div className="app">
      <nav className="navbar">
        <span className="nav-brand">BarcodeApp</span>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Upload</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
          <NavLink to="/scan" className={({ isActive }) => isActive ? 'active mobile-link' : 'mobile-link'}>📱 Scan</NavLink>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile-only pages — no navbar */}
        <Route path="/product/:itemCode" element={<ProductDetail />} />
        <Route path="/scan" element={<MobileScan />} />

        {/* Admin pages with navbar */}
        <Route path="/" element={<Layout><Upload /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
