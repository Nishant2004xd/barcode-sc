import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [printTarget, setPrintTarget] = useState(null); // product to print

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await api.get('/products/', { params });
      setProducts(data);
    } catch {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const doPrint = (product, type) => {
    const isBarcode = type === 'barcode';
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${isBarcode ? 'Barcode' : 'QR Code'} - ${product.item_code}</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 24px; margin: 0; }
        .label { display: inline-block; border: 1px solid #ddd; padding: 20px 24px; border-radius: 10px; }
        img { display: block; margin: 0 auto; }
        h3 { margin: 10px 0 4px; font-size: 13px; color: #222; }
        p { margin: 2px 0; font-size: 11px; color: #666; }
        .price { font-size: 20px; font-weight: bold; color: #059669; margin: 6px 0; }
        .code { font-size: 11px; color: #888; }
      </style></head>
      <body onload="window.print()">
        <div class="label">
          ${isBarcode
            ? `<img src="${product.barcode_image_url}" alt="barcode" style="max-width:280px; height:70px; object-fit:contain;"/>`
            : `<img src="${product.qr_image_url}" alt="qr" style="width:180px; height:180px;"/>`
          }
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
          <p class="price">₹${parseFloat(product.selling_price).toLocaleString('en-IN')}</p>
          <p class="code">${product.item_code} &nbsp;|&nbsp; HSN: ${product.hsn}</p>
        </div>
      </body></html>
    `);
    win.document.close();
    setPrintTarget(null);
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Products</h1>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or item code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty">
          No products found.{' '}
          <Link to="/">Upload an Excel file</Link> to get started.
        </div>
      ) : (
        <>
          <p className="count">{products.length} product{products.length !== 1 ? 's' : ''}</p>
          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>MRP</th>
                  <th>Selling Price</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Barcode</th>
                  <th>QR Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><span className="code-badge">{p.item_code}</span></td>
                    <td className="name-cell">{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td>₹{parseFloat(p.mrp).toLocaleString('en-IN')}</td>
                    <td className="selling-price">₹{parseFloat(p.selling_price).toLocaleString('en-IN')}</td>
                    <td>{p.qty}</td>
                    <td>
                      <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>
                      {p.barcode_image_url && (
                        <img src={p.barcode_image_url} alt="barcode" className="barcode-thumb"
                          onClick={() => setSelectedProduct(p)} />
                      )}
                    </td>
                    <td>
                      {p.qr_image_url && (
                        <img src={p.qr_image_url} alt="qr" className="qr-thumb"
                          onClick={() => setSelectedProduct(p)} />
                      )}
                    </td>
                    <td>
                      <button className="btn-print" onClick={() => setPrintTarget(p)}>
                        Print Label
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Print type chooser */}
      {printTarget && (
        <div className="modal-overlay" onClick={() => setPrintTarget(null)}>
          <div className="modal print-chooser" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPrintTarget(null)}>✕</button>
            <h2>Print Label</h2>
            <p className="modal-name">{printTarget.item_code} — {printTarget.name}</p>
            <p className="chooser-hint">What would you like to print?</p>
            <div className="chooser-options">
              <button className="chooser-btn" onClick={() => doPrint(printTarget, 'barcode')}>
                <img src={printTarget.barcode_image_url} alt="barcode" />
                <span>Barcode</span>
                <small>Code128 — scanner-friendly</small>
              </button>
              <button className="chooser-btn" onClick={() => doPrint(printTarget, 'qr')}>
                <img src={printTarget.qr_image_url} alt="qr" />
                <span>QR Code</span>
                <small>Scan with any phone camera</small>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
            <h2>{selectedProduct.item_code}</h2>
            <p className="modal-name">{selectedProduct.name}</p>
            <div className="modal-images">
              <div>
                <p className="img-label">Barcode (Code128)</p>
                <img src={selectedProduct.barcode_image_url} alt="barcode" />
              </div>
              <div>
                <p className="img-label">QR Code (Scan for details)</p>
                <img src={selectedProduct.qr_image_url} alt="qr" />
              </div>
            </div>
            <button className="btn-print" onClick={() => { setSelectedProduct(null); setPrintTarget(selectedProduct); }}>
              🖨 Print Label
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
