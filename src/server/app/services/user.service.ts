import { UserRepository } from '@server/repositories/user.repository';
import { User } from '@shared/models/user';
import { UserFull } from '@shared/models/user-full';
import { UserData } from '@shared/models/user.data';

class UserService {
    async create(data: UserData): Promise<number> {
        return UserRepository.create(data);
    }
    async read(id: number): Promise<User> {
        return UserRepository.read(id);
    }
    async readByLogin(login: string): Promise<User> {
        return UserRepository.readByLogin(login);
    }
    async readByLoginFull(login: string): Promise<UserFull> {
        return UserRepository.readByLoginFull(login);
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
