"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const users_controller_1 = require("../../modules/users/users.controller");
const router = (0, express_1.Router)();
exports.userRouter = router;
router.get("/", users_controller_1.renderUserList);
router.post("/delete", users_controller_1.handleDeleteUser);
router.post("/create", users_controller_1.handleCreateUser);
router.post("/:id/edit", users_controller_1.handleEditUser);
//# sourceMappingURL=users.route.js.map