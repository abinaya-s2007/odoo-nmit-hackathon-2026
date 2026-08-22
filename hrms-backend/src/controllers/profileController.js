const bcrypt = require('bcryptjs');
const { toProfile } = require('../utils/serializers');
const { fileUrl } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

// GET /profile
const getProfile = asyncHandler(async (req, res) => {
  return res.json(toProfile(req.user));
});

// PATCH /profile — only self-editable fields (spec 3.3.2):
// phone, address, about, skills.
const updateProfile = asyncHandler(async (req, res) => {
  const { phone, address, about, skills } = req.body;
  const user = req.user;

  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (about !== undefined) user.about = about;
  if (skills !== undefined) user.skills = skills;

  await user.save();
  return res.json(toProfile(user));
});

// POST /profile/avatar (multipart, field name "avatar")
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  req.user.avatarUrl = fileUrl(req, req.file.filename);
  await req.user.save();

  return res.json({ avatarUrl: req.user.avatarUrl });
});

// POST /profile/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'currentPassword and newPassword are required.' });
  }

  const match = await bcrypt.compare(currentPassword, req.user.password);
  if (!match) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  req.user.mustChangePassword = false;
  await req.user.save();

  return res.json({ message: 'Password updated.' });
});

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword };
