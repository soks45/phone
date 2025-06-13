import { DatabaseException } from '@server/exceptions/database.exception';
import { DatabaseService } from '@server/services/database.service';
import { Meeting } from '@shared/models/meeting';

class MeetingRepository {
    async create(): Promise<Meeting> {
        const result = await DatabaseService.query<Meeting>(`INSERT INTO meeting DEFAULT VALUES RETURNING *`);

        return result.rows[0];
    }
    async close(id: string): Promise<void> {
        await DatabaseService.query(
            `UPDATE meeting SET is_active = false, ended_at = now() WHERE id = $1 AND is_active = true`,
            [id]
        );
    }
    async get(id: string): Promise<Meeting> {
        const result = await DatabaseService.query<Meeting>(`SELECT * FROM meeting WHERE id = $1`, [id]);

        if (!result.rows[0]) {
            throw new DatabaseException(`Meeting not found. Id: ${id}`);
        }

        return result.rows[0];
    }
    async join(meetingId: string, userId: number): Promise<void> {
        await DatabaseService.query(
            `INSERT INTO meeting_user (meeting_id, user_id) VALUES ($1, $2) ON CONFLICT (meeting_id, user_id) DO NOTHING`,
            [meetingId, userId]
        );
    }
}

const instance: MeetingRepository = new MeetingRepository();

export { instance as MeetingRepository };
