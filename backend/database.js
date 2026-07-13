const mongoose = require('mongoose');

// The password was provided by the user
const MONGO_URI = "mongodb+srv://arorasagar540_db_user:0EE40hn9dUUZCTvy@cluster0.ftddx7g.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB cluster'))
  .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const userDataSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  profile: { type: Object, default: {} },
  socials: { type: Object, default: {} },
  theme: { type: String, default: 'aura' },
  profileLayout: { type: String, default: 'layout-classic' },
  btnStyle: { type: String, default: 'style-solid' },
  btnShape: { type: String, default: 'shape-rounded' },
  customColors: { type: Object, default: {} },
  links: { type: Array, default: [] },
  bgImage: { type: String, default: '' },
  drawingBg: { type: String, default: '' },
  animatedBg: { type: String, default: 'none' },
  entranceAnim: { type: String, default: 'fade-up' },
  profileFont: { type: String, default: "'Inter', sans-serif" }
});

const User = mongoose.model('User', userSchema);
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = { User, UserData };
