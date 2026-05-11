import { User } from '@generated/prisma/client';
import * as bcrypt from 'bcrypt';

import { prisma } from '@/shared/libs/prisma.lib';
import { BadRequestError, NotFoundError } from '@/shared/utils/error.utils';

export class UserService {
    private readonly SALT_ROUNDS = 10;

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async verifyPassword(password: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(password, hashed);
    }

    async create(username: string, password: string): Promise<User> {
        const dup = await this.findByUsername(username);
        if (dup) {
            throw new BadRequestError(
                `Username "${username}" is already taken`,
            );
        }
        const user = await prisma.user.create({
            data: {
                username: username,
                password: await this.hashPassword(password),
            },
        });
        return user;
    }

    async setPassword(id: string, password: string): Promise<User> {
        await this.getById(id);
        const updated = await prisma.user.update({
            where: { id },
            data: {
                password: await this.hashPassword(password),
            },
        });
        return updated;
    }

    private async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { id } });
        return user;
    }

    private async findByUsername(username: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { username } });
        return user;
    }

    async getById(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundError(`User with id=${id} not found`);
        }
        return user;
    }

    async getByUsername(username: string): Promise<User> {
        const user = await this.findByUsername(username);
        if (!user) {
            throw new NotFoundError(`User with username=${username} not found`);
        }
        return user;
    }

    async deleteById(id: string): Promise<void> {
        await this.getById(id);
        await prisma.user.delete({ where: { id } });
    }

    async getList(): Promise<User[]> {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return users;
        } catch (error) {
            return [];
        }
    }
}
