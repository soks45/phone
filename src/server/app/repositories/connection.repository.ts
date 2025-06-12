import { DatabaseService } from '@server/services/database.service';
import { Connection } from '@shared/models/connection';

class ConnectionRepository {
    async create(): Promise<Connection> {
        const result = await DatabaseService.query<Connection>(
            'INSERT INTO connection (is_active) VALUES ($1) RETURNING *',
            [true]
        );

        return result.rows[0];
    }
    async close(id: string): Promise<void> {
        await DatabaseService.query('UPDATE connection SET is_active = $1 WHERE id = $2', [false, id]);
    }
    async get(id: string): Promise<Connection> {
        const result = await DatabaseService.query<Connection>(
            'SELECT * FROM connection WHERE id = $1 and is_active = true',
            [id]
        );

        return result.rows[0];
    }
    async getAll(): Promise<Connection[]> {
        const result = await DatabaseService.query<Connection>('SELECT * FROM connection WHERE is_active = true', []);

        return result.rows;
    }
}

const instance = new ConnectionRepository();

export { instance as ConnectionRepository };
