import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import './ProductDetail.css';

export default function ProductDetail() {
  const { itemCode } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${itemCode}/`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [itemCode]);

  if (loading) return <div className="pd-center">Loading...</div>;
  if (error) return <div className="pd-center pd-error">{error}</div>;

  const discount = product.mrp > product.selling_price
    ? Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)
    : 0;

  return (
    <div className="pd-page">
      <div className="pd-card">
        {/* Header */}
        <div className="pd-header">
          <span className="pd-category">{product.category}</span>
          <span className={`pd-status ${product.status.toLowerCase()}`}>{product.status}</span>
        </div>

        <h1 className="pd-name">{product.name}</h1>
        <p className="pd-brand">{product.brand}</p>
        <p className="pd-code">Item Code: <strong>{product.item_code}</strong></p>

        {/* Price */}
        <div className="pd-price-box">
          <div className="pd-selling">
            ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
          </div>
          {discount > 0 && (
            <div className="pd-mrp-row">
              <span className="pd-mrp">MRP ₹{parseFloat(product.mrp).toLocaleString('en-IN')}</span>
              <span className="pd-discount">{discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="pd-details">
          <div className="pd-detail-row">
            <span className="pd-label">HSN Code</span>
            <span className="pd-value">{product.hsn}</span>
          </div>
          <div className="pd-detail-row">
            <span className="pd-label">Stock Qty</span>
            <span className="pd-value">{product.qty}</span>
          </div>
          <div className="pd-detail-row">
            <span className="pd-label">Available Online</span>
            <span className="pd-value">{product.show_online ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Barcode */}
        {product.barcode_image_url && (
          <div className="pd-barcode-section">
            <img src={product.barcode_image_url} alt="barcode" className="pd-barcode" />
            <p className="pd-barcode-label">{product.item_code}</p>
          </div>
        )}
      </div>
    </div>
  );
}
