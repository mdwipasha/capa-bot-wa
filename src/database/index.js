import { config } from '../config/env.js';
import { JsonDatabase } from './JsonDatabase.js';

export const db = new JsonDatabase(config.databasePath);
