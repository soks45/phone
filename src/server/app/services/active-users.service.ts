class ActiveUsersService {
    private _activeUsers: Map<number, number> = new Map<number, number>();

    add(id: number): void {
        let userIDs = this._activeUsers.get(id);
        userIDs ??= 0;
        userIDs++;
        this._activeUsers.set(id, userIDs);
    }
    remove(id: number): void {
        let userIDs = this._activeUsers.get(id);
        userIDs ??= 1;
        userIDs--;
        if (userIDs) {
            this._activeUsers.set(id, userIDs);
        } else {
            this._activeUsers.delete(id);
        }
    }
    isActive(id: number): boolean {
        return this._activeUsers.has(id);
    }
    all(): number[] {
        return [...this._activeUsers.keys()];
    }
}

const instance = new ActiveUsersService();

export { instance as ActiveUsersService };
