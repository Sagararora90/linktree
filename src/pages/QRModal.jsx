import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRModal({ url, onClose }) {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="drawing-modal-overlay" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="drawing-modal" style={{ width: '300px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-elevated)', borderRadius: '12px' }} onClick={e => e.stopPropagation()}>
        <div className="drawing-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Your QR Code</h3>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <QRCodeCanvas id="qr-code-canvas" value={url} size={200} />
        </div>
        <button className="action-btn primary" onClick={downloadQR} style={{ width: '100%' }}>
          Download QR
        </button>
      </div>
    </div>
  );
}
