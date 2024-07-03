import { DatabaseException } from '@server/exceptions/database.exception';
import { DatabaseService } from '@server/services/database.service';
import { User } from '@shared/models/user';
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
        const result = await DatabaseService.query<User>('SELECT * FROM user_data WHERE id = $1 and is_active = true', [
            id,
        ]);

        if (!result.rows[0]) {
            throw new DatabaseException(`User not found. Id: ${id}`);
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
