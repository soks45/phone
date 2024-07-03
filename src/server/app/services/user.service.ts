import { User } from '../models/user';
import { UserData } from '../models/user.data';
import { UserRepository } from '../repositories/user.repository';

class UserService {
    async create(data: UserData): Promise<number> {
        return UserRepository.create(data);
    }
    async read(id: number): Promise<User> {
        return UserRepository.read(id);
    }
    async update(id: number, data: UserData): Promise<void> {
        await UserRepository.update(id, data);
    }
    async delete(id: number): Promise<void> {
        await UserRepository.delete(id);
    }
}

const instance = new UserService();

export { instance as UserService };
