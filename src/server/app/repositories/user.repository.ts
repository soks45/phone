import { DatabaseException } from '@server/exceptions/database.exception';
import { DatabaseService } from '@server/services/database.service';
import { User } from '@shared/models/user';
import { UserFull } from '@shared/models/user-full';
import { UserData } from '@shared/models/user.data';

class UserRepository {
    async create(data: UserData): Promise<number> {
        const result = await DatabaseService.query<{ id: number }>(
            'INSERT INTO user_data (login, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [data.login, data.email, data.password_hash]
        );

        return result.rows[0].id;
    }
    async read(id: number): Promise<User> {
        const result = await DatabaseService.query<User>(
            'SELECT id, email, login FROM user_data WHERE id = $1 and is_active = true',
            [id]
        );

        if (!result.rows[0]) {
            throw new DatabaseException(`User not found. Id: ${id}`);
        }

        return result.rows[0];
    }
    async readMany(ids: number[]): Promise<User[]> {
        if (ids.length === 0) {
            return [];
        }

        const result = await DatabaseService.query<User>(
            `SELECT id, email, login FROM user_data WHERE id = ANY($1) AND is_active = true`,
            [ids]
        );

        return result.rows;
    }
    async readByLogin(login: string): Promise<User> {
        const result = await DatabaseService.query<User>(
            'SELECT id, email, login FROM user_data WHERE login = $1 and is_active = true',
            [login]
        );

        if (!result.rows[0]) {
            throw new DatabaseException(`User not found. Login: ${login}`);
        }

        return result.rows[0];
    }
    async readByLoginFull(login: string): Promise<UserFull> {
        const result = await DatabaseService.query<UserFull>(
            'SELECT * FROM user_data WHERE login = $1 and is_active = true',
            [login]
        );

        if (!result.rows[0]) {
            throw new DatabaseException(`User not found. Login: ${login}`);
        }

        return result.rows[0];
    }
    async update(id: number, data: UserData): Promise<void> {
        await DatabaseService.query(
            'UPDATE user_data SET login = $1, email = $2, password_hash = $3 WHERE id = $4 and is_active = true',
            [data.login, data.email, data.password_hash, id]
        );
    }
    async delete(id: number): Promise<void> {
        await DatabaseService.query('UPDATE user_data SET is_active = $1 WHERE id = $2', [true, id]);
    }
}

const instance = new UserRepository();

export { instance as UserRepository };
