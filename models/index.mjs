
// "use strict";

// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const process = require("process");
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.json")[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
// 	sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
// 	sequelize = new Sequelize(
// 		config.database,
// 		config.username,
// 		config.password,
// 		config
// 	);
// }

// fs.readdirSync(__dirname)
// 	.filter((file) => {
// 		return (
// 			file.indexOf(".") !== 0 &&
// 			file !== basename &&
// 			file.slice(-3) === ".js" &&
// 			file.indexOf(".test.js") === -1
// 		);
// 	})
// 	.forEach((file) => {
// 		const model = require(path.join(__dirname, file))(
// 			sequelize,
// 			Sequelize.DataTypes
// 		);
// 		db[model.name] = model;
// 	});

// Object.keys(db).forEach((modelName) => {
// 	if (db[modelName].associate) {
// 		db[modelName].associate(db);
// 	}
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Import the config file
import configFile from '../config/config.json' assert { type: 'json' };
const config = configFile[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Read all model files dynamically
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-4) === '.mjs' && // Update to detect `.mjs` files
      !file.endsWith('.test.mjs') // Skip test files
    );
  })
  .forEach(async file => {
    const modelImport = await import(path.join(__dirname, file));
    const model = modelImport.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up model associations if defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
