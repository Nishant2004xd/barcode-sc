import { useState, useRef } from 'react';
import api from '../api/axios';
import './Upload.css';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/products/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Make sure the backend is running on port 8001.');
      } else {
        setError(`Upload failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1 className="upload-title">Upload Price List</h1>
        <p className="upload-subtitle">
          Upload an Excel file (.xlsx / .xls) — barcodes and QR codes will be
          auto-generated for each product.
        </p>

        <div
          className={`drop-zone ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <>
              <span className="file-icon">📄</span>
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <span className="file-icon">📂</span>
              <p>Drag & drop your Excel file here</p>
              <p className="drop-hint">or click to browse</p>
            </>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {result && (
          <div className="alert alert-success">
            ✅ {result.message}
            <div className="result-stats">
              <span>Created: {result.created}</span>
              <span>Updated: {result.updated}</span>
              <span>Total: {result.total}</span>
            </div>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : 'Upload & Generate Barcodes'}
        </button>
      </div>

      <div className="columns-hint">
        <h3>Expected Excel Columns</h3>
        <div className="columns-grid">
          {['Sr.No', 'Item Code', 'Category', 'Brand', 'Name', 'MRP', 'Selling Price', 'HSN', 'Qty', 'Status', 'Show Online'].map(col => (
            <span key={col} className="col-tag">{col}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
