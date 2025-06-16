import { MeetingRepository } from '@server/repositories/meeting.repository';
import { Meeting } from '@shared/models/meeting';
import { MeetingData } from '@shared/models/meeting.data';

class MeetingService {
    create(data: MeetingData): Promise<Meeting> {
        return MeetingRepository.create(data);
    }
    close(id: string): Promise<void> {
        return MeetingRepository.close(id);
    }
    get(id: string): Promise<Meeting> {
        return MeetingRepository.get(id);
    }
    async join(meetingId: string, userId: number): Promise<void> {
        await MeetingRepository.join(meetingId, userId);
    }
}

const instance = new MeetingService();

export { instance as MeetingService };
