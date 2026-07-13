const fs = require('fs');

// Patch database.js
let dbContent = fs.readFileSync('backend/database.js', 'utf8');
if (!dbContent.includes('profileLayout')) {
  dbContent = dbContent.replace(
    "theme: { type: String, default: 'default' },",
    "theme: { type: String, default: 'default' },\n  profileLayout: { type: String, default: 'layout-classic' },"
  );
  fs.writeFileSync('backend/database.js', dbContent);
  console.log('Patched database.js');
}

// Patch server.js
let serverContent = fs.readFileSync('backend/server.js', 'utf8');
if (!serverContent.includes('profileLayout')) {
  serverContent = serverContent.replace(
    "const { profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg } = req.body;",
    "const { profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg, profileLayout } = req.body;"
  );
  serverContent = serverContent.replace(
    "{ profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg },",
    "{ profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg, profileLayout },"
  );
  fs.writeFileSync('backend/server.js', serverContent);
  console.log('Patched server.js');
}
