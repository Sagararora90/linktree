const fs = require('fs');

const css = `
/* ═══ PROFILE LAYOUTS ═══ */

/* Default setup for flex layouts */
.preview-content, .mockup-scroll {
  display: flex;
  flex-direction: column;
}

/* 1. Classic */
.layout-classic .preview-profile, .layout-classic .mockup-profile {
  text-align: center;
  align-items: center;
}

/* 2. Minimal (Avatar hidden in JS) */
.layout-minimal .preview-profile, .layout-minimal .mockup-profile {
  text-align: center;
  align-items: center;
  padding-top: 40px;
}

/* 3. Left Aligned */
.layout-left .preview-profile, .layout-left .mockup-profile {
  text-align: left;
  align-items: flex-start;
}
.layout-left .preview-socials, .layout-left .mockup-socials {
  justify-content: flex-start;
}
.layout-left .preview-links, .layout-left .mockup-links {
  align-items: flex-start;
}
.layout-left .preview-link-card, .layout-left .mockup-link-card {
  width: 100%;
  max-width: 400px;
  margin-right: auto;
  margin-left: 0;
}

/* 4. Right Aligned */
.layout-right .preview-profile, .layout-right .mockup-profile {
  text-align: right;
  align-items: flex-end;
}
.layout-right .preview-socials, .layout-right .mockup-socials {
  justify-content: flex-end;
}
.layout-right .preview-links, .layout-right .mockup-links {
  align-items: flex-end;
}
.layout-right .preview-link-card, .layout-right .mockup-link-card {
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: 0;
}

/* 5. Bottom Gravity */
.layout-bottom.preview-content {
  min-height: 100vh;
  justify-content: flex-end;
}
.layout-bottom.mockup-scroll {
  min-height: 100%;
  justify-content: flex-end;
}
.layout-bottom .preview-profile, .layout-bottom .mockup-profile {
  margin-top: auto;
}

/* 6. Top Heavy (Avatar Only, bio hidden in JS) */
.layout-top-heavy .preview-avatar, .layout-top-heavy .mockup-avatar {
  width: 150px;
  height: 150px;
  border-width: 4px;
}

/* 7. Elevated Card */
.layout-card .preview-profile, .layout-card .mockup-profile {
  background: var(--bg-elevated);
  padding: 32px 24px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  border: 1px solid var(--border);
  margin-bottom: 32px;
}
.layout-card .preview-avatar, .layout-card .mockup-avatar {
  margin-top: -64px; /* Pop out of the card */
  border: 4px solid var(--bg-elevated);
}

/* 8. Hero Banner */
.layout-hero .preview-profile, .layout-hero .mockup-profile {
  padding-top: 0;
}
.layout-hero .preview-avatar, .layout-hero .mockup-avatar {
  width: 100%;
  max-width: 100%;
  height: 250px;
  border-radius: 0;
  border: none;
  margin-bottom: 24px;
  object-fit: cover;
}
.layout-hero .preview-avatar-placeholder {
  width: 100%;
  height: 250px;
  border-radius: 0;
}
`;

fs.appendFileSync('src/pages/Preview.css', css);
console.log('Appended to Preview.css');

// Editor.jsx has its own mockup styles, maybe we need to append to Editor.css if some classes are missing.
// But .mockup-scroll and .mockup-profile are actually defined in Editor.css.
fs.appendFileSync('src/pages/Editor.css', css);
console.log('Appended to Editor.css');

