const fs = require('fs');
let content = fs.readFileSync('src/pages/Editor.jsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { Link as LinkIcon, Trash2, ExternalLink, GripVertical, Brush, Save, Image as ImageIcon, Copy } from 'lucide-react';",
  "import { Link as LinkIcon, Trash2, ExternalLink, GripVertical, Brush, Save, Image as ImageIcon, Copy, User, Check, Loader2 } from 'lucide-react';"
);
content = content.replace(
  "import { ReactSketchCanvas } from 'react-sketch-canvas';",
  "import { ReactSketchCanvas } from 'react-sketch-canvas';\nimport Cropper from 'react-easy-crop';"
);

// 2. State
content = content.replace(
  "  const [isLoaded, setIsLoaded] = useState(false);\n\n  const canvasRef = useRef(null);",
  "  const [isLoaded, setIsLoaded] = useState(false);\n  const [saveStatus, setSaveStatus] = useState('');\n\n  const [cropImage, setCropImage] = useState(null);\n  const [crop, setCrop] = useState({ x: 0, y: 0 });\n  const [zoom, setZoom] = useState(1);\n  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);\n\n  const canvasRef = useRef(null);"
);

// 3. Save logic
content = content.replace(
  "    const timer = setTimeout(() => {\n      fetch(`${API_BASE_URL}/api/user/data`, {",
  "    const timer = setTimeout(() => {\n      setSaveStatus('saving');\n      fetch(`${API_BASE_URL}/api/user/data`, {"
);
content = content.replace(
  "        if (data.username) {\n          localStorage.setItem('username', data.username);\n        }\n      })\n      .catch(err => setSaveError('Failed to save to cloud.'));",
  "        if (data.username) {\n          localStorage.setItem('username', data.username);\n        }\n        setSaveStatus('saved');\n        setTimeout(() => setSaveStatus(''), 2000);\n      })\n      .catch(err => {\n        setSaveError(err.message || 'Failed to save to cloud.');\n        setSaveStatus('');\n      });"
);

// 4. Avatar Upload logic
const oldAvatarLogic = `  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await fileToCompressedDataURL(file, 500, 0.85);
      setProfile(p => ({ ...p, avatar: dataUrl }));
    } catch (err) {
      setUploadError(err.message || 'Could not load that image.');
    }
  };`;
  
const newAvatarLogic = `  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await fileToCompressedDataURL(file, 1000, 0.9);
      setCropImage(dataUrl);
    } catch (err) {
      setUploadError(err.message || 'Could not load that image.');
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = cropImage;
      await new Promise(resolve => image.onload = resolve);

      canvas.width = 500;
      canvas.height = 500;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        500,
        500
      );
      
      setProfile(p => ({ ...p, avatar: canvas.toDataURL('image/jpeg', 0.85) }));
      setCropImage(null);
    } catch (e) {
      setUploadError('Failed to crop image.');
      setCropImage(null);
    }
  };`;

content = content.replace(oldAvatarLogic, newAvatarLogic);

// 5. Avatar UI
content = content.replace(
  "<div className=\"avatar-placeholder\" />}",
  "<div className=\"avatar-placeholder\"><User size={24} color=\"var(--text-secondary)\" /></div>}"
);

// 6. Save Status UI
content = content.replace(
  "        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>\n          <button className=\"action-btn primary\" onClick={() => {",
  "        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>\n          <div className=\"save-status-container\">\n            {saveStatus === 'saving' && <span className=\"save-status saving\"><Loader2 size={14} className=\"spin\" /> Saving...</span>}\n            {saveStatus === 'saved' && <span className=\"save-status saved\"><Check size={14} /> Saved</span>}\n          </div>\n          <button className=\"action-btn primary\" onClick={() => {"
);

// 7. Cropper Modal
const oldFooter = "      <div className=\"preview-container\">\n        <div className=\"phone-mockup\">\n          <div className=\"phone-screen\">\n            <Preview />\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}";
const newFooter = `      <div className="preview-container">
        <div className="phone-mockup">
          <div className="phone-screen">
            <Preview />
          </div>
        </div>
      </div>

      {cropImage && (
        <div className="drawing-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="drawing-modal" style={{ width: '400px', height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div className="drawing-header">
              <h3>Crop Avatar</h3>
              <button className="close-btn" onClick={() => setCropImage(null)}>×</button>
            </div>
            <div style={{ position: 'relative', flex: 1, background: '#000' }}>
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                aria-labelledby="Zoom" 
                onChange={(e) => setZoom(e.target.value)} 
                style={{ flex: 1 }} 
              />
              <button className="add-btn" onClick={getCroppedImg} style={{ padding: '8px 16px', width: 'auto', marginBottom: 0 }}>Crop & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/pages/Editor.jsx', content);
console.log('Patched Editor.jsx');
