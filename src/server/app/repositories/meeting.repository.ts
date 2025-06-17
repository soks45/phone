import { DatabaseException } from '@server/exceptions/database.exception';
import { DatabaseService } from '@server/services/database.service';
import { Meeting } from '@shared/models/meeting';
import { MeetingData } from '@shared/models/meeting.data';
import { User } from '@shared/models/user';

class MeetingRepository {
    async create({ name, description }: MeetingData): Promise<Meeting> {
        const result = await DatabaseService.query<Meeting>(
            `INSERT INTO meeting (name, description) VALUES ($1, $2) RETURNING *`,
            [name, description]
        );

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
    async exists(meetingId: string): Promise<boolean> {
        const result = await DatabaseService.query(`SELECT 1 FROM meeting WHERE id = $1 AND is_active = true LIMIT 1`, [
            meetingId,
        ]);

        return (result.rowCount ?? 0) > 0;
    }
    async participants(meetingId: string): Promise<User[]> {
        const result = await DatabaseService.query<User>(
            `SELECT * FROM user_data u JOIN meeting_user mu ON mu.user_id = u.id WHERE mu.meeting_id = $1 AND u.is_active = true`,
            [meetingId]
        );

        return result.rows;
    }
}

const instance: MeetingRepository = new MeetingRepository();

export { instance as MeetingRepository };
