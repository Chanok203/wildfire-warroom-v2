import { User } from '@generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User; // เพิ่ม property user เข้าไปใน Request
    }
  }
}