require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log(`[HRMS] Connected to ${sequelize.getDialect()} database.`);

    // Hackathon speed: sync schema directly instead of writing migrations.
    // Safe to run repeatedly — it only adds/alters what's missing.
    await sequelize.sync({ alter: true });
    console.log('[HRMS] Models synced.');

    app.listen(PORT, () => {
      console.log(`[HRMS] Backend listening on http://localhost:${PORT}`);
      console.log(`[HRMS] API base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('[HRMS] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
