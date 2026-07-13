const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, UserData } = require('./database');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = 'super-secret-key-for-vibe-page-development';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    const hashedPassword = bcrypt.hashSync(password, 8);

    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username, message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- PROTECTED ROUTES MIDDLEWARE ---
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    next();
  });
}

// --- USER DATA ROUTES ---

app.get('/api/user/data', verifyToken, async (req, res) => {
  try {
    const data = await UserData.findOne({ user_id: req.userId });
    if (!data) return res.json({});
    
    res.json({
      profile: data.profile,
      socials: data.socials,
      theme: data.theme,
      btnStyle: data.btnStyle,
      btnShape: data.btnShape,
      customColors: data.customColors,
      links: data.links,
      bgImage: data.bgImage,
      drawingBg: data.drawingBg
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.post('/api/user/data', verifyToken, async (req, res) => {
  try {
    const { profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg } = req.body;
    
    // Check if user wants to change their URL slug
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    let activeUsername = user.username;

    if (profile && profile.username) {
      const requestedSlug = profile.username.replace(/^@/, '').trim().toLowerCase();
      if (requestedSlug && requestedSlug !== activeUsername) {
        const existing = await User.findOne({ username: requestedSlug });
        if (!existing) {
          user.username = requestedSlug;
          await user.save();
          activeUsername = requestedSlug;
        }
      }
    }

    await UserData.findOneAndUpdate(
      { user_id: req.userId },
      { profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg },
      { upsert: true, new: true }
    );

    res.json({ message: 'Data saved successfully', username: activeUsername });
  } catch (err) {
    res.status(500).json({ message: 'Error saving data' });
  }
});

// --- PUBLIC ROUTE ---
app.get('/api/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send Analytics to Discord
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown';
    const ip = rawIp.split(',')[0].trim(); // x-forwarded-for can have multiple IPs
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Direct Link';

    // We do this asynchronously so it doesn't slow down the page load for the visitor!
    (async () => {
      let locationStr = 'Unknown Location';
      let ispStr = 'Unknown ISP';
      
      // Get Location from IP
      if (ip && ip !== 'Unknown' && ip !== '::1' && ip !== '127.0.0.1') {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`);
          const geo = await geoRes.json();
          if (geo.status === 'success') {
            locationStr = `${geo.city}, ${geo.country}`;
            ispStr = geo.isp;
          }
        } catch (e) { /* ignore */ }
      }

      // Format Source Beautifully
      let source = referer;
      if (referer.includes('instagram.com')) source = '📱 Instagram';
      else if (referer.includes('tiktok.com')) source = '🎵 TikTok';
      else if (referer.includes('t.co') || referer.includes('twitter.com')) source = '🐦 Twitter / X';
      else if (referer.includes('youtube.com')) source = '📺 YouTube';
      else if (referer === 'Direct Link') source = '🔗 Direct Link (Typed URL or Text Message)';

      // Extract Device briefly from UserAgent
      let device = 'Computer / Unknown';
      if (userAgent.includes('iPhone')) device = '📱 iPhone';
      else if (userAgent.includes('Android')) device = '📱 Android Phone';
      else if (userAgent.includes('iPad')) device = '📱 iPad';
      else if (userAgent.includes('Macintosh')) device = '💻 Mac';
      else if (userAgent.includes('Windows')) device = '💻 Windows PC';

      if (DISCORD_WEBHOOK_URL) {
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `🚨 New Visitor on /${username}!`,
              description: `Someone just viewed your Linktree page.`,
              color: 0x00ffaa,
              fields: [
                { name: '📍 Location', value: locationStr, inline: true },
                { name: '🌐 ISP / Network', value: ispStr, inline: true },
                { name: '🔗 Where they came from', value: source, inline: false },
                { name: '💻 Device', value: device, inline: true },
                { name: '🔢 IP Address', value: ip, inline: true },
                { name: '🔍 Raw Device Info', value: `\`${userAgent.substring(0, 100)}...\``, inline: false }
              ],
              footer: { text: `Visited at ${new Date().toLocaleString()}` }
            }]
          })
        }).catch(() => {});
      }
    } catch (e) { }
    })();

    const data = await UserData.findOne({ user_id: user._id });
    if (!data) return res.json({});
    
    res.json({
      profile: data.profile,
      socials: data.socials,
      theme: data.theme,
      btnStyle: data.btnStyle,
      btnShape: data.btnShape,
      customColors: data.customColors,
      links: data.links,
      bgImage: data.bgImage,
      drawingBg: data.drawingBg
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- RENDER AUTO-PING ---
app.get('/api/ping', (req, res) => res.json({ status: 'alive' }));

// --- SERVE FRONTEND (For Render Deployment) ---
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Keep Render awake
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(() => {
    fetch(`${RENDER_URL}/api/ping`).catch(() => {});
  }, 120000); // 2 minutes
});
