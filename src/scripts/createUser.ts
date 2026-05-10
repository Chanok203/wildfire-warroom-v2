import 'dotenv/config';

import { UserService } from '@/modules/users/users.service';
import { prisma } from '@/shared/libs/prisma.lib';

async function run() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('❌ Usage: yarn seed:user <username> <password>');
        process.exit(1);
    }

    try {
        const service = new UserService();
        const user = await service.create(username, password);
        console.log(`✅ Success: User "${user.username}" created!`);
    } catch (error: any) {
        console.error(`❌ Error: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

run();
