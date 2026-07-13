const fs = require('fs');
let content = fs.readFileSync('src/pages/Preview.jsx', 'utf8');

// 1. Add state
content = content.replace(
  "const [btnShape, setBtnShape] = useState('shape-rounded');",
  "const [btnShape, setBtnShape] = useState('shape-rounded');\n  const [profileLayout, setProfileLayout] = useState('layout-classic');"
);

// 2. Fetch callback
content = content.replace(
  "if (data.btnShape) setBtnShape(data.btnShape);",
  "if (data.btnShape) setBtnShape(data.btnShape);\n        if (data.profileLayout) setProfileLayout(data.profileLayout);"
);

// 3. Inject class and conditional render
// We need to inject ${profileLayout} into <div className="preview-content">
content = content.replace(
  '<div className="preview-content">',
  '<div className={`preview-content ${profileLayout}`}>'
);

// We want to skip avatar if profileLayout === 'layout-minimal'
const avatarBlock = `        <div className="preview-profile">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="preview-avatar" />
          ) : (
            <div className="preview-avatar-placeholder">
              <User size={40} color="var(--text-secondary)" />
            </div>
          )}`;
const newAvatarBlock = `        <div className="preview-profile">
          {profileLayout !== 'layout-minimal' && (
            profile.avatar ? (
              <img src={profile.avatar} alt="" className="preview-avatar" />
            ) : (
              <div className="preview-avatar-placeholder">
                <User size={40} color="var(--text-secondary)" />
              </div>
            )
          )}`;
content = content.replace(avatarBlock, newAvatarBlock);

// We want to skip bio/socials if profileLayout === 'layout-top-heavy'
const textBlock = `          {profile.name && <h1 className="preview-name">{profile.name}</h1>}
          {profile.username && <p className="preview-username">{profile.username}</p>}
          {profile.bio && <p className="preview-bio">{profile.bio}</p>}

          {(socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && (
            <div className="preview-socials">`;
const newTextBlock = `          {profile.name && profileLayout !== 'layout-top-heavy' && <h1 className="preview-name">{profile.name}</h1>}
          {profile.username && profileLayout !== 'layout-top-heavy' && <p className="preview-username">{profile.username}</p>}
          {profile.bio && profileLayout !== 'layout-top-heavy' && <p className="preview-bio">{profile.bio}</p>}

          {(socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && profileLayout !== 'layout-top-heavy' && (
            <div className="preview-socials">`;
content = content.replace(textBlock, newTextBlock);

fs.writeFileSync('src/pages/Preview.jsx', content);
console.log('Patched Preview.jsx');
