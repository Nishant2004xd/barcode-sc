import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import './MobileScan.css';

export default function MobileScan() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | scanning | error
  const [errorMsg, setErrorMsg] = useState('');
  const [cameras, setCameras] = useState([]);
  const [activeCam, setActiveCam] = useState(null);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length === 0) {
          setErrorMsg('No camera found on this device.');
          setStatus('error');
          return;
        }
        setCameras(devices);
        // prefer back camera
        const back = devices.find((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        setActiveCam(back?.id || devices[0].id);
      })
      .catch(() => {
        setErrorMsg('Camera permission denied. Please allow camera access and reload.');
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    if (!activeCam) return;

    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;
    setStatus('scanning');

    html5QrCode
      .start(
        activeCam,
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          // Stop scanner
          html5QrCode.stop().catch(() => {});

          // Extract item code from URL or use raw value
          let itemCode = decodedText;
          try {
            const url = new URL(decodedText);
            const parts = url.pathname.split('/').filter(Boolean);
            // pathname like /product/CY1813
            if (parts.length >= 2 && parts[0] === 'product') {
              itemCode = parts[1];
            }
          } catch {
            // not a URL — treat the raw text as item code directly
          }

          navigate(`/product/${itemCode}`);
        },
        () => {} // suppress frame errors
      )
      .catch((err) => {
        setErrorMsg(`Could not start camera: ${err}`);
        setStatus('error');
      });

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [activeCam, navigate]);

  const switchCamera = (camId) => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).finally(() => {
        setActiveCam(camId);
      });
    } else {
      setActiveCam(camId);
    }
  };

  return (
    <div className="scan-page">
      {/* Header */}
      <div className="scan-header">
        <h1>Scan QR Code</h1>
        <p>Point your camera at a product QR code</p>
      </div>

      {/* Camera switcher */}
      {cameras.length > 1 && (
        <div className="cam-switcher">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              className={`cam-btn ${activeCam === cam.id ? 'active' : ''}`}
              onClick={() => switchCamera(cam.id)}
            >
              {cam.label.length > 22 ? cam.label.slice(0, 22) + '…' : cam.label}
            </button>
          ))}
        </div>
      )}

      {/* Scanner viewport */}
      <div className="scan-viewport">
        <div id="qr-reader" className="qr-reader" />

        {status === 'scanning' && (
          <div className="scan-overlay">
            <div className="scan-frame">
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
              <div className="scan-line" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="scan-error">
            <span>📷</span>
            <p>{errorMsg}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}
      </div>

      <p className="scan-hint">
        Make sure the QR code is within the frame and well-lit
      </p>
    </div>
  );
}
