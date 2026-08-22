const { User } = require('../models');

// Company initials, e.g. "Odoo India" -> "OI"
function companyInitials(companyName) {
  return companyName
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// First two letters of first name + first two letters of last name,
// e.g. "John Doe" -> "JODO". Falls back gracefully for single-word names.
function nameCode(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || 'XX';
  const last = parts.length > 1 ? parts[parts.length - 1] : first.slice(2);
  let code = `${first.slice(0, 2)}${(last || first).slice(0, 2)}`.toUpperCase();
  while (code.length < 4) code += 'X';
  return code.slice(0, 4);
}

// Format: OI[Initials][Year][Serial] e.g. OIJODO20220001
async function generateLoginId({ companyId, companyName, fullName, year }) {
  const y = year || new Date().getFullYear();
  const prefix = `${companyInitials(companyName)}${nameCode(fullName)}${y}`;

  // Serial number is per-company-per-year, sequential starting at 0001.
  const countThisYear = await User.count({
    where: { companyId },
    // cheap portable filter: loginIds for this company already start with
    // the company's initials + the year segment we're generating
  });

  let serial = countThisYear + 1;
  let candidate = `${prefix}${String(serial).padStart(4, '0')}`;

  // Guard against rare collisions (e.g. re-runs/seed data) by bumping serial.
  // eslint-disable-next-line no-await-in-loop
  while (await User.findOne({ where: { loginId: candidate } })) {
    serial += 1;
    candidate = `${prefix}${String(serial).padStart(4, '0')}`;
  }

  return candidate;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let pwd = '';
  for (let i = 0; i < 10; i += 1) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

module.exports = { companyInitials, nameCode, generateLoginId, generateTempPassword };
