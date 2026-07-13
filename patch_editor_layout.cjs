const fs = require('fs');
let content = fs.readFileSync('src/pages/Editor.jsx', 'utf8');

// 1. Add Layout state
content = content.replace(
  "const [btnShape, setBtnShape] = useState('shape-rounded');",
  "const [btnShape, setBtnShape] = useState('shape-rounded');\n  const [profileLayout, setProfileLayout] = useState('layout-classic');"
);

// 2. Fetch callback (line ~168)
content = content.replace(
  "if (data.btnShape) setBtnShape(data.btnShape);",
  "if (data.btnShape) setBtnShape(data.btnShape);\n        if (data.profileLayout) setProfileLayout(data.profileLayout);"
);

// 3. Save payload
content = content.replace(
  "body: JSON.stringify({ profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg })",
  "body: JSON.stringify({ profile, socials, theme, btnStyle, btnShape, customColors, links, bgImage, drawingBg, profileLayout })"
);

// 4. Add Tab Button
content = content.replace(
  "<button className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`} onClick={() => setActiveTab('style')}>Style</button>",
  "<button className={`tab-btn ${activeTab === 'style' ? 'active' : ''}`} onClick={() => setActiveTab('style')}>Style</button>\n          <button className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')}>Layout</button>"
);

// 5. Add Layout Tab Content
const layoutTabContent = `        {activeTab === 'layout' && (
          <div className="tab-pane">
            <h2>Profile Layouts</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Choose how your profile is structured.</p>

            <div className="shape-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <button 
                className={\`shape-btn \${profileLayout === 'layout-classic' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-classic')}
              >
                Classic Center
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-minimal' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-minimal')}
              >
                Minimal (No Avatar)
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-left' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-left')}
              >
                Left Aligned
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-right' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-right')}
              >
                Right Aligned
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-bottom' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-bottom')}
              >
                Bottom Gravity
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-top-heavy' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-top-heavy')}
              >
                Avatar Only (No Bio)
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-card' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-card')}
              >
                Elevated Card
              </button>

              <button 
                className={\`shape-btn \${profileLayout === 'layout-hero' ? 'active' : ''}\`}
                onClick={() => setProfileLayout('layout-hero')}
              >
                Hero Banner
              </button>

            </div>
          </div>
        )}`;

content = content.replace(
  "{activeTab === 'style' && (",
  layoutTabContent + "\n\n        {activeTab === 'style' && ("
);

fs.writeFileSync('src/pages/Editor.jsx', content);
console.log('Patched Editor.jsx');
