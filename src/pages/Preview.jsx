import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IconInstagram, IconTwitter, IconTikTok, IconYouTube } from './SocialIcons';
import { MoreHorizontal, Share2, User } from 'lucide-react';
import { API_BASE_URL } from '../config';
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

  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If we're on the local dev "preview" route and have an auth token, grab the owner's data
    let fetchUrl = `${API_BASE_URL}/api/public/${username}`;
    let headers = {};

    if (!username || username === 'preview') {
      const localUser = localStorage.getItem('username');
      if (localUser) {
        fetchUrl = `${API_BASE_URL}/api/public/${localUser}`;
      } else {
        // Not logged in, viewing local blank preview
        setLoading(false);
        return;
      }
    }

    fetch(fetchUrl, headers)
      .then(res => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then(data => {
        if (Object.keys(data).length === 0) {
           setLoading(false);
           return;
        }
        if (data.links) setLinks(data.links);
        if (data.profile) setProfile(data.profile);
        if (data.socials) setSocials(data.socials);
        if (data.theme) {
          setTheme(data.theme);
          if (data.theme !== 'default') document.documentElement.setAttribute('data-theme', data.theme);
        }
        if (data.btnStyle) setBtnStyle(data.btnStyle);
        if (data.btnShape) setBtnShape(data.btnShape);
        if (data.customColors) setCustomColors(data.customColors);
        if (data.bgImage) setBgImage(data.bgImage);
        if (data.drawingBg) setDrawingBg(data.drawingBg);
        setLoading(false);
      })
      .catch(err => {
        setError(true);
        setLoading(false);
      });

    return () => document.documentElement.removeAttribute('data-theme');
  }, [username]);

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
        {/* Top Right Share Button */}
        <button 
          className="preview-top-share" 
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: profile.name || 'Linktree', url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Profile link copied!');
            }
          }}
          aria-label="Share Profile"
        >
          <Share2 size={18} />
        </button>

        {/* Profile */}
        <div className="preview-profile">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="preview-avatar" />
          ) : (
            <div className="preview-avatar-placeholder">
              <User size={40} color="var(--text-secondary)" />
            </div>
          )}
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
                  color: link.color || undefined,
                  backgroundColor: link.bgColor || undefined,
                }}
              >
                <span>{link.content}</span>
                <button 
                  className="link-share-btn" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({ title: link.content, url: link.url });
                    } else {
                      navigator.clipboard.writeText(link.url);
                      alert('Link copied!');
                    }
                  }}
                  aria-label="Share Link"
                >
                  <MoreHorizontal size={20} />
                </button>
              </a>
            );
          })}
          </div>
        ) : (
          <p className="preview-empty">No links yet.</p>
        )}
        
        {/* Branding Footer */}
        <div className="preview-footer">
          <p>Powered by <strong>Linktree V6</strong></p>
        </div>
      </div>
    </div>
  );
}
