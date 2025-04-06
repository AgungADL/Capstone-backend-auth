require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const routes = require('./router');
const { sequelize } = require('../models');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: 'localhost',
  });

  server.route(routes);

  await server.register(Jwt);
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: { aud: false, iss: false, sub: false },
    validate: (artifacts) => ({ isValid: true, credentials: { email: artifacts.decoded.payload.email } }),
  });

  // Test database connection
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1); // Exit if database connection fails
  }

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();