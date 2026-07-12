import React, { useState, useEffect } from 'react';
import { IconInstagram, IconTwitter, IconTikTok, IconYouTube } from './SocialIcons';
import { loadJSON, loadString } from './storage';
import './Preview.css';
import './ButtonStyles.css';

const DEFAULT_PROFILE = { name: '', username: '', bio: '', avatar: '' };
const DEFAULT_SOCIALS = { instagram: '', twitter: '', tiktok: '', youtube: '' };

export default function Preview() {
  const [links, setLinks] = useState([]);
  const [drawingBg, setDrawingBg] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [btnStyle, setBtnStyle] = useState('style-solid');
  const [btnShape, setBtnShape] = useState('shape-rounded');
  const [theme, setTheme] = useState('default');
  const [customColors, setCustomColors] = useState({
    bgPrimary: '#1a1a1a', bgSecondary: '#222222', bgElevated: '#333333',
    textPrimary: '#ffffff', textSecondary: '#aaaaaa', accent: '#3b82f6'
  });
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [socials, setSocials] = useState(DEFAULT_SOCIALS);

  useEffect(() => {
    setLinks(loadJSON('links', []));
    setProfile(loadJSON('profile', DEFAULT_PROFILE));
    setSocials(loadJSON('socials', DEFAULT_SOCIALS));
    setBgImage(loadString('bg', ''));
    setDrawingBg(loadString('drawing', ''));
    setBtnStyle(loadString('btn_style', 'style-solid'));
    setBtnShape(loadString('btn_shape', 'shape-rounded'));
    setCustomColors(loadJSON('custom_colors', {
      bgPrimary: '#1a1a1a', bgSecondary: '#222222', bgElevated: '#333333',
      textPrimary: '#ffffff', textSecondary: '#aaaaaa', accent: '#3b82f6'
    }));

    const savedTheme = loadString('theme', 'default');
    setTheme(savedTheme);
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    return () => document.documentElement.removeAttribute('data-theme');
  }, []);

  const visibleLinks = links.filter(link => link.content?.trim() || link.url?.trim());

  return (
    <div className="preview-page">
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

      {/* Background Image */}
      {bgImage && <div className="preview-bg" style={{ backgroundImage: `url(${bgImage})` }} />}

      {/* Drawing Layer */}
      {drawingBg && <div className="preview-bg" style={{ backgroundImage: `url(${drawingBg})`, backgroundSize: '100% 100%', opacity: 1 }} />}

      <div className="preview-content">
        {/* Profile */}
        <div className="preview-profile">
          {profile.avatar && <img src={profile.avatar} alt="" className="preview-avatar" />}
          {profile.name && <h1 className="preview-name">{profile.name}</h1>}
          {profile.username && <p className="preview-username">{profile.username}</p>}
          {profile.bio && <p className="preview-bio">{profile.bio}</p>}

          {(socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && (
            <div className="preview-socials">
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram size={22} /></a>}
              {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter / X"><IconTwitter size={22} /></a>}
              {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><IconTikTok size={22} /></a>}
              {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><IconYouTube size={22} /></a>}
            </div>
          )}
        </div>

        {/* Links */}
        {visibleLinks.length > 0 ? (
          <div className="preview-links">
            {visibleLinks.map(link => {
            const gSize = link.gridSize || 'bento-2x1';
            const cStyle = (link.cardStyle && link.cardStyle !== 'default') ? link.cardStyle : '';
            return (
              <a
                key={link.id}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`preview-link-card ${btnStyle} ${btnShape} ${gSize} ${cStyle}`}
                style={{
                  fontFamily: link.font || "'Inter', sans-serif",
                  color: link.color || 'var(--text-primary)',
                  backgroundColor: link.bgColor || 'var(--bg-elevated)',
                }}
              >
                {link.content}
              </a>
            );
          })}
          </div>
        ) : (
          <p className="preview-empty">No links yet.</p>
        )}
      </div>
    </div>
  );
}
