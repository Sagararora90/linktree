import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link as LinkIcon, Trash2, ExternalLink, GripVertical, Brush, Save, Image as ImageIcon, Copy, User, Check, Loader2 } from 'lucide-react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Cropper from 'react-easy-crop';
import { IconInstagram, IconTwitter, IconTikTok, IconYouTube } from './SocialIcons';
import { API_BASE_URL } from '../config';
import { fileToCompressedDataURL } from './storage';
import './Editor.css';
import './EditorResponsive.css';
import './ButtonStyles.css';

// ── THEMES ──
const THEMES = [
  { id: 'aura', label: '🫧 Aura Dream' },
  { id: 'brutalist', label: '🧃 Brutalism' },
  { id: 'midnight-bento', label: '🛹 Midnight Bento' },
  { id: 'vintage-scrapbook', label: '☕ Vintage Scrapbook' },
  { id: 'dark-academia', label: '🌿 Academia' },
  { id: 'custom', label: '🎨 Custom' },
];

const DEFAULT_LINKS = [
  { id: '1', content: 'My Portfolio', url: 'https://example.com', font: "'Inter', sans-serif", color: '', bgColor: '' },
  { id: '2', content: 'GitHub', url: 'https://github.com', font: "'Inter', sans-serif", color: '', bgColor: '' },
  { id: '3', content: 'My Blog', url: 'https://blog.example.com', font: "'Inter', sans-serif", color: '', bgColor: '' },
];
const DEFAULT_PROFILE = { name: 'Your Name', username: '@handle', bio: 'Welcome to my page ✨', avatar: '' };
const DEFAULT_SOCIALS = { instagram: '', twitter: '', tiktok: '', youtube: '' };

// ── SORTABLE LINK ITEM ──
function SortableLinkItem({ item, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isSelected ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`link-item ${isSelected ? 'selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
    >
      <div className="link-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div
        className="link-item-content"
        style={{
          fontFamily: item.font || "'Inter', sans-serif",
          color: item.color || 'var(--text-primary)',
          backgroundColor: item.bgColor || 'var(--bg-elevated)',
        }}
      >
        {item.content || 'Untitled'}
      </div>
    </div>
  );
}

export default function Editor() {
  // ── STATE ──
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);
  const [bgImage, setBgImage] = useState('');
  const [theme, setTheme] = useState('default');
  const [btnStyle, setBtnStyle] = useState('style-solid');
  const [btnShape, setBtnShape] = useState('shape-rounded');
  const [profileLayout, setProfileLayout] = useState('layout-classic');
  const [customColors, setCustomColors] = useState({
    bgPrimary: '#1a1a1a',
    bgSecondary: '#222222',
    bgElevated: '#333333',
    textPrimary: '#ffffff',
    textSecondary: '#aaaaaa',
    accent: '#3b82f6'
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingBg, setDrawingBg] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('links');
  const [saveError, setSaveError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const canvasRef = useRef(null);
  const bgInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // ── LOAD DATA ON MOUNT ──
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoaded(true); // Let them play around locally if no auth
      return;
    }

    fetch(`${API_BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          if (data.links && data.links.length > 0) setLinks(data.links);
          if (data.profile) setProfile(data.profile);
          if (data.socials) setSocials(data.socials);
          if (data.theme) setTheme(data.theme);
          if (data.btnStyle) setBtnStyle(data.btnStyle);
          if (data.btnShape) setBtnShape(data.btnShape);
        if (data.profileLayout) setProfileLayout(data.profileLayout);
          if (data.customColors) setCustomColors(data.customColors);
          if (data.bgImage) setBgImage(data.bgImage);
          if (data.drawingBg) setDrawingBg(data.drawingBg);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setIsLoaded(true);
      });
  }, []);

  // ── AUTO-SAVE TO BACKEND ──
  useEffect(() => {
    if (!isLoaded) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const payload = {
      profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg, profileLayout
    };

    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/user/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          localStorage.setItem('username', data.username);
        }
      })
      .catch(err => setSaveError('Failed to save to cloud.'));
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg, profileLayout, isLoaded]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── DND (Sortable for link reordering) ──
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setLinks((prev) => {
        const oldIdx = prev.findIndex(i => i.id === active.id);
        const newIdx = prev.findIndex(i => i.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  // ── ACTIONS ──
  const addLink = () => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const newLink = { id: newId, content: 'New Link', url: 'https://', font: "'Inter', sans-serif", color: '', bgColor: '', gridSize: 'bento-2x1', cardStyle: 'default' };
    setLinks(prev => [...prev, newLink]);
    setSelectedId(newId);
    setActiveTab('links');
  };

  const duplicateLink = () => {
    const source = links.find(l => l.id === selectedId);
    if (!source) return;
    const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const copy = { ...source, id: newId, content: `${source.content} (copy)` };
    setLinks(prev => {
      const idx = prev.findIndex(l => l.id === selectedId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedId(newId);
  };

  const updateLink = (key, value) => {
    setLinks(prev => prev.map(l => l.id === selectedId ? { ...l, [key]: value } : l));
  };

  const deleteLink = () => {
    const link = links.find(l => l.id === selectedId);
    const label = link?.content || 'this link';
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    setLinks(prev => prev.filter(l => l.id !== selectedId));
    setSelectedId(null);
  };

  // ── FILE UPLOADS (compressed to avoid blowing localStorage's quota) ──
  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await fileToCompressedDataURL(file, 1400, 0.8);
      setBgImage(dataUrl);
    } catch (err) {
      setUploadError(err.message || 'Could not load that image.');
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = async () => {
    try {
      const image = new Image();
      image.src = cropImage;
      await new Promise((resolve) => (image.onload = resolve));
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const size = Math.max(image.width, image.height);
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setProfile((p) => ({ ...p, avatar: dataUrl }));
      setCropImage(null);
    } catch (e) {
      console.error(e);
      setUploadError('Failed to crop image.');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = null;
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await fileToCompressedDataURL(file, 500, 0.85);
      setCropImage(dataUrl);
    } catch (err) {
      setUploadError(err.message || 'Could not load that image.');
    }
  };

  const toggleDrawing = async () => {
    if (isDrawing && canvasRef.current) {
      const dataUrl = await canvasRef.current.exportImage('png');
      setDrawingBg(dataUrl);
    }
    setIsDrawing(!isDrawing);
    setSelectedId(null);
  };

  const selectedLink = links.find(l => l.id === selectedId);

  // ── RENDER ──
  return (
    <div className="editor-container" onClick={() => setSelectedId(null)}>
      {uploadError && <div className="error-toast">{uploadError}</div>}
      
      {theme === 'custom' && (
        <style dangerouslySetInnerHTML={{__html: `
          :root[data-theme="custom"] {
            --bg-primary: ${customColors.bgPrimary};
            --bg-secondary: ${customColors.bgSecondary};
            --bg-elevated: ${customColors.bgElevated};
            --text-primary: ${customColors.textPrimary};
            --text-secondary: ${customColors.textSecondary};
            --accent: ${customColors.accent};
            --accent-hover: ${customColors.accent};
            --accent-soft: ${customColors.accent}33;
            --border: ${customColors.textPrimary}1a;
            --border-focus: ${customColors.accent};
          }
        `}} />
      )}

      {/* ═══ LEFT SIDEBAR ═══ */}
      <div className="sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-tabs">
          <button className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>Links</button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`} onClick={() => setActiveTab('style')}>Style</button>
          <button className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')}>Layout</button>
        </div>

        {(saveError || uploadError) && (
          <div className="banner-error" role="alert">
            {uploadError || saveError}
            <button
              className="banner-dismiss"
              onClick={() => { setSaveError(''); setUploadError(''); }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <>
            <button className="add-btn" onClick={addLink} style={{ marginBottom: '16px' }}>
              <LinkIcon size={16} /> Add New Link
            </button>

            <div className="sidebar-header"><h2>Your Links</h2></div>
            <div className="links-list">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                  {links.map(link => (
                    <SortableLinkItem
                      key={link.id}
                      item={link}
                      isSelected={selectedId === link.id}
                      onSelect={(id) => setSelectedId(id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {links.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>No links yet. Click "Add New Link" to start!</p>}
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="input-group">
              <label>Avatar</label>
              <input type="file" accept="image/jpeg, image/png, image/webp" ref={avatarInputRef} style={{ display: 'none' }} onChange={handleAvatarUpload} />
              <div className="avatar-row">
                {profile.avatar
                  ? <img src={profile.avatar} alt="" className="avatar-preview" />
                  : <div className="avatar-placeholder"><User size={24} color="var(--text-secondary)" /></div>}
                <button className="avatar-btn" onClick={() => avatarInputRef.current.click()}>Upload</button>
                {profile.avatar && <button className="avatar-btn" onClick={() => setProfile(p => ({ ...p, avatar: '' }))}>Remove</button>}
              </div>
            </div>
            <div className="input-group">
              <label>Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={profile.username} onChange={(e) => setProfile(p => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>Bio</label>
              <textarea rows={3} value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} />
            </div>

            <div className="sidebar-header" style={{ marginTop: '20px' }}><h2>Socials</h2></div>
            <div className="input-group">
              <label><IconInstagram size={13} /> Instagram</label>
              <input type="url" placeholder="https://instagram.com/..." value={socials.instagram} onChange={(e) => setSocials(s => ({ ...s, instagram: e.target.value }))} onBlur={(e) => setSocials(s => ({ ...s, instagram: normalizeUrl(e.target.value) }))} />
            </div>
            <div className="input-group">
              <label><IconTwitter size={13} /> Twitter / X</label>
              <input type="url" placeholder="https://x.com/..." value={socials.twitter} onChange={(e) => setSocials(s => ({ ...s, twitter: e.target.value }))} onBlur={(e) => setSocials(s => ({ ...s, twitter: normalizeUrl(e.target.value) }))} />
            </div>
            <div className="input-group">
              <label><IconTikTok size={13} /> TikTok</label>
              <input type="url" placeholder="https://tiktok.com/@..." value={socials.tiktok} onChange={(e) => setSocials(s => ({ ...s, tiktok: e.target.value }))} onBlur={(e) => setSocials(s => ({ ...s, tiktok: normalizeUrl(e.target.value) }))} />
            </div>
            <div className="input-group">
              <label><IconYouTube size={13} /> YouTube</label>
              <input type="url" placeholder="https://youtube.com/..." value={socials.youtube} onChange={(e) => setSocials(s => ({ ...s, youtube: e.target.value }))} onBlur={(e) => setSocials(s => ({ ...s, youtube: normalizeUrl(e.target.value) }))} />
            </div>
          </div>
        )}

        {/* STYLE TAB */}
                {activeTab === 'layout' && (
          <div className="tab-pane">
            <h2>Profile Layouts</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose how your profile is structured.</p>

            <div className="shape-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <button 
                className={`shape-btn ${profileLayout === 'layout-classic' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-classic')}
              >
                Classic Center
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-minimal' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-minimal')}
              >
                Minimal (No Avatar)
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-left' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-left')}
              >
                Left Aligned
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-right' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-right')}
              >
                Right Aligned
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-bottom' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-bottom')}
              >
                Bottom Gravity
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-top-heavy' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-top-heavy')}
              >
                Avatar Only (No Bio)
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-card' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-card')}
              >
                Elevated Card
              </button>

              <button 
                className={`shape-btn ${profileLayout === 'layout-hero' ? 'active' : ''}`}
                onClick={() => setProfileLayout('layout-hero')}
              >
                Hero Banner
              </button>

            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <>
            <div className="sidebar-header"><h2>Theme</h2></div>
            <div className="theme-grid">
              {THEMES.map(t => (
                <button key={t.id} className={`theme-chip ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {theme === 'custom' && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div className="input-group">
                  <label>Background Color</label>
                  <input type="color" value={customColors.bgPrimary} onChange={(e) => setCustomColors(c => ({...c, bgPrimary: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label>Sidebar / Phone Color</label>
                  <input type="color" value={customColors.bgSecondary} onChange={(e) => setCustomColors(c => ({...c, bgSecondary: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label>Card / Button Color</label>
                  <input type="color" value={customColors.bgElevated} onChange={(e) => setCustomColors(c => ({...c, bgElevated: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label>Primary Text</label>
                  <input type="color" value={customColors.textPrimary} onChange={(e) => setCustomColors(c => ({...c, textPrimary: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label>Secondary Text</label>
                  <input type="color" value={customColors.textSecondary} onChange={(e) => setCustomColors(c => ({...c, textSecondary: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label>Accent / Glow Color</label>
                  <input type="color" value={customColors.accent} onChange={(e) => setCustomColors(c => ({...c, accent: e.target.value}))} />
                </div>
              </div>
            )}

            <div className="sidebar-header" style={{ marginTop: '24px' }}><h2>Button Style</h2></div>
            <div className="input-group">
              <select value={btnStyle} onChange={(e) => setBtnStyle(e.target.value)}>
                <option value="style-solid">Solid (Default)</option>
                <option value="style-outline">Outline</option>
                <option value="style-soft">Soft</option>
                <option value="style-ghost">Ghost</option>
                <option value="style-brutalist">Brutalist</option>
                <option value="style-neon">Neon Glow</option>
                <option value="style-glass">Glassmorphism</option>
                <option value="style-neumorphic">Neumorphic</option>
                <option value="style-3d">3D Push</option>
                <option value="style-minimal">Minimal</option>
              </select>
            </div>

            <div className="sidebar-header" style={{ marginTop: '16px' }}><h2>Button Shape</h2></div>
            <div className="input-group">
              <select value={btnShape} onChange={(e) => setBtnShape(e.target.value)}>
                <option value="shape-sharp">Sharp</option>
                <option value="shape-rounded-sm">Slightly Rounded</option>
                <option value="shape-rounded">Rounded</option>
                <option value="shape-rounded-lg">Extra Rounded</option>
                <option value="shape-pill">Pill</option>
                <option value="shape-leaf">Leaf</option>
                <option value="shape-reverse-leaf">Reverse Leaf</option>
                <option value="shape-arch">Arch</option>
                <option value="shape-soft-arch">Soft Arch</option>
                <option value="shape-blob">Organic Blob</option>
              </select>
            </div>

            <div className="sidebar-header" style={{ marginTop: '24px' }}><h2>Background Image</h2></div>
            <input type="file" accept="image/*" ref={bgInputRef} style={{ display: 'none' }} onChange={handleBgUpload} />
            <button className="add-btn" onClick={() => bgInputRef.current.click()}>
              <ImageIcon size={16} /> Upload Background
            </button>
            {bgImage && (
              <>
                <div style={{ marginTop: '12px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={bgImage} alt="bg preview" style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }} />
                </div>
                <button className="action-btn danger" style={{ marginTop: '8px' }} onClick={() => setBgImage('')}>
                  <Trash2 size={14} /> Remove Background
                </button>
              </>
            )}

            <div className="sidebar-header" style={{ marginTop: '24px' }}><h2>Drawing</h2></div>
            <button className="action-btn" onClick={toggleDrawing}>
              {isDrawing ? <><Save size={16} /> Save Drawing</> : <><Brush size={16} /> Draw on Page</>}
            </button>
            {drawingBg && !isDrawing && (
              <button className="action-btn danger" style={{ marginTop: '8px' }} onClick={() => setDrawingBg('')}>
                <Trash2 size={14} /> Clear Drawings
              </button>
            )}
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="action-btn primary" onClick={() => {
            const username = localStorage.getItem('username');
            window.open(`/${username}`, '_blank');
          }}>
            <ExternalLink size={16} /> View Public Page
          </button>
          <button className="action-btn primary" style={{ marginTop: '12px' }} onClick={() => {
            const username = localStorage.getItem('username');
            const url = `${window.location.origin}/${username}`;
            navigator.clipboard.writeText(url).then(() => {
              alert('Link copied to clipboard! Give this URL to others.');
            });
          }}>
            <Copy size={16} /> Copy Share Link
          </button>
        </div>
      </div>

      {/* ═══ CENTER — PHONE MOCKUP ═══ */}
      <div className="canvas-area">
        <div className="phone-mockup">
          <div className="phone-inner">

            {/* Background Image Layer */}
            {bgImage && (
              <div className="bg-layer" style={{ backgroundImage: `url(${bgImage})` }} />
            )}

            {/* Drawing Layer */}
            {drawingBg && !isDrawing && (
              <div className="bg-layer" style={{ backgroundImage: `url(${drawingBg})`, backgroundSize: '100% 100%', opacity: 1, zIndex: 2 }} />
            )}

            {/* Active Drawing Canvas */}
            {isDrawing && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 999, borderRadius: '37px', overflow: 'hidden' }}>
                <ReactSketchCanvas ref={canvasRef} strokeWidth={4} strokeColor="var(--accent)" canvasColor="transparent" />
              </div>
            )}

            {/* Page Content */}
            <div className={`mockup-scroll ${profileLayout}`}>
              {/* Profile */}
              <div className="mockup-profile">
                {profileLayout !== 'layout-minimal' && profile.avatar && <img src={profile.avatar} alt="" className="mockup-avatar" />}
                {profileLayout !== 'layout-top-heavy' && <h2 className="mockup-name">{profile.name}</h2>}
                {profileLayout !== 'layout-top-heavy' && <p className="mockup-username">{profile.username}</p>}
                {profileLayout !== 'layout-top-heavy' && <p className="mockup-bio">{profile.bio}</p>}

                {profileLayout !== 'layout-top-heavy' && (socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && (
                  <div className="mockup-socials">
                    {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer"><IconInstagram size={18} /></a>}
                    {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer"><IconTwitter size={18} /></a>}
                    {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noreferrer"><IconTikTok size={18} /></a>}
                    {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer"><IconYouTube size={18} /></a>}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="mockup-links">
                {links.map(link => {
                  const gSize = link.gridSize || 'bento-2x1';
                  const cStyle = (link.cardStyle && link.cardStyle !== 'default') ? link.cardStyle : '';
                  return (
                    <a
                      key={link.id}
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mockup-link-card ${selectedId === link.id ? 'selected' : ''} ${btnStyle} ${btnShape} ${gSize} ${cStyle}`}
                      style={{
                        fontFamily: link.font || "'Inter', sans-serif",
                        color: link.color || undefined,
                        backgroundColor: link.bgColor || undefined,
                      }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedId(link.id); }}
                    >
                      {link.content}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT SIDEBAR (Edit selected link) ═══ */}
      <div className="property-sidebar" onClick={(e) => e.stopPropagation()}>
        {selectedLink ? (
          <div>
            <div className="sidebar-header"><h2>Edit Link</h2></div>

            <div className="input-group">
              <label>Title</label>
              <input type="text" value={selectedLink.content || ''} onChange={(e) => updateLink('content', e.target.value)} />
            </div>
            <div className="input-group">
              <label>URL</label>
              <input
                type="url"
                value={selectedLink.url || ''}
                onChange={(e) => updateLink('url', e.target.value)}
                onBlur={(e) => updateLink('url', normalizeUrl(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label>Font</label>
              <select value={selectedLink.font || "'Inter', sans-serif"} onChange={(e) => updateLink('font', e.target.value)}>
                <option value="'Inter', sans-serif">Inter (Modern)</option>
                <option value="'Caveat', cursive">Caveat (Handwriting)</option>
                <option value="'Archivo Black', sans-serif">Archivo (Bold)</option>
                <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                <option value="'Space Mono', monospace">Space Mono (Retro)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Text Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={selectedLink.color || '#ffffff'} onChange={(e) => updateLink('color', e.target.value)} />
                <button className="avatar-btn" style={{ padding: '0 8px' }} onClick={() => updateLink('color', '')}>Default</button>
              </div>
            </div>
            <div className="input-group">
              <label>Background Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={selectedLink.bgColor || '#000000'} onChange={(e) => updateLink('bgColor', e.target.value)} />
                <button className="avatar-btn" style={{ padding: '0 8px' }} onClick={() => updateLink('bgColor', '')}>Default</button>
              </div>
            </div>
            
            <div className="sidebar-header" style={{ marginTop: '20px' }}><h2>Scrapbook & Layout</h2></div>
            <div className="input-group">
              <label>Bento Grid Size</label>
              <select value={selectedLink.gridSize || 'bento-2x1'} onChange={(e) => updateLink('gridSize', e.target.value)}>
                <option value="bento-2x1">Wide Rectangle (2x1)</option>
                <option value="bento-1x1">Small Square (1x1)</option>
                <option value="bento-2x2">Large Square (2x2)</option>
              </select>
            </div>
            <div className="input-group">
              <label>Scrapbook Style</label>
              <select value={selectedLink.cardStyle || 'default'} onChange={(e) => updateLink('cardStyle', e.target.value)}>
                <option value="default">Default Theme Style</option>
                <option value="scrapbook-polaroid">Polaroid Photo</option>
                <option value="scrapbook-tape">Masking Tape</option>
                <option value="scrapbook-torn">Torn Paper</option>
                <option value="scrapbook-handwritten">Handwritten Scribble</option>
              </select>
            </div>

            <button className="action-btn" style={{ marginTop: '20px' }} onClick={duplicateLink}>
              <Copy size={16} /> Duplicate Link
            </button>
            <button className="action-btn danger" style={{ marginTop: '8px' }} onClick={deleteLink}>
              <Trash2 size={16} /> Delete Link
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <p>Click any link on the preview to edit its title, URL, font, and colors.</p>
          </div>
        )}
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
}
