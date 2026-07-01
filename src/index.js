const { connectDatabase } = require('./config/database');
const { app, start } = require('./app');
const { env } = require('./config/env');

async function main() {
  try {
    await connectDatabase();
    await start();
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
