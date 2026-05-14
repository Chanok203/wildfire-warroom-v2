"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const users_service_1 = require("../modules/users/users.service");
const prisma_lib_1 = require("../shared/libs/prisma.lib");
async function run() {
    const username = process.argv[2];
    const password = process.argv[3];
    if (!username || !password) {
        console.error('❌ Usage: yarn seed:user <username> <password>');
        process.exit(1);
    }
    try {
        const service = new users_service_1.UserService();
        const user = await service.create(username, password);
        console.log(`✅ Success: User "${user.username}" created!`);
    }
    catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
    finally {
        await prisma_lib_1.prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=createUser.js.map