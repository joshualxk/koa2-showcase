import Sequelize from 'sequelize';

import config from './config.js';
import logger from './logger.js';


const sequelize = new Sequelize(config.db_name, config.db_user, config.db_pw, {
  host: config.db_host,
  port: config.db_port,
  dialect: 'mariadb',
  timezone: '+08:00',
  logging: logger.info.bind(logger),
  pool: {
    max: 8,
    min: 1,
    idle: 10000,
    acquire: 30000,
    handleDisconnects: true
  },
  query: {raw: true},
});

// test if the connection is OK.
await sequelize.authenticate();

const {default: fn} = await import('./models/users.js');
fn(sequelize)

sequelize.sync({force: false});

export default sequelize;
