import { User } from '@generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      currentUser?: User; // เพิ่ม property user เข้าไปใน Request
    }
  }
}