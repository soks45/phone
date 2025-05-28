import process from 'node:process';

import dotenv from 'dotenv';
import { ClientConfig, Pool } from 'pg';

dotenv.config();
const config: ClientConfig = {
    user: process.env['DATABASE_USER'],
    database: process.env['DATABASE_NAME'],
    host: process.env['DATABASE_HOST'],
    port: Number(process.env['DATABASE_PORT']),
    password: process.env['DATABASE_PASSWORD'],
    application_name: process.env['DATABASE_NAME'],
};

console.log(config);

class DatabaseService extends Pool {
    constructor(config: ClientConfig) {
        super(config);
    }
}

const instance = new DatabaseService(config);

export { instance as DatabaseService };
