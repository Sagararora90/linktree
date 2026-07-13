const fs = require('fs');
let content = fs.readFileSync('src/pages/Editor.jsx', 'utf8');

// 1. Inject class to mockup-scroll
content = content.replace(
  '<div className="mockup-scroll">',
  '<div className={`mockup-scroll ${profileLayout}`}>'
);

// 2. Hide avatar conditionally
const avatarBlock = `              <div className="mockup-profile">
                {profile.avatar && <img src={profile.avatar} alt="" className="mockup-avatar" />}`;
const newAvatarBlock = `              <div className="mockup-profile">
                {profileLayout !== 'layout-minimal' && profile.avatar && <img src={profile.avatar} alt="" className="mockup-avatar" />}`;
content = content.replace(avatarBlock, newAvatarBlock);

// 3. Hide bio/socials conditionally
const textBlock = `                <h2 className="mockup-name">{profile.name}</h2>
                <p className="mockup-username">{profile.username}</p>
                <p className="mockup-bio">{profile.bio}</p>

                {(socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && (
                  <div className="mockup-socials">`;
const newTextBlock = `                {profileLayout !== 'layout-top-heavy' && <h2 className="mockup-name">{profile.name}</h2>}
                {profileLayout !== 'layout-top-heavy' && <p className="mockup-username">{profile.username}</p>}
                {profileLayout !== 'layout-top-heavy' && <p className="mockup-bio">{profile.bio}</p>}

                {profileLayout !== 'layout-top-heavy' && (socials.instagram || socials.twitter || socials.tiktok || socials.youtube) && (
                  <div className="mockup-socials">`;
content = content.replace(textBlock, newTextBlock);

fs.writeFileSync('src/pages/Editor.jsx', content);
console.log('Patched Editor.jsx Mockup');
