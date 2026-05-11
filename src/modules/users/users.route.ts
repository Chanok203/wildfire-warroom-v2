import { Router } from 'express';
import { handleCreateUser, handleDeleteUser, handleEditUser, renderUserList } from '@/modules/users/users.controller';


const router = Router();

router.get("/", renderUserList);
router.post("/delete", handleDeleteUser);
router.post("/create", handleCreateUser);
router.post("/:id/edit", handleEditUser);

export { router as userRouter };
