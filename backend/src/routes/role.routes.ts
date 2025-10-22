import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

router.get('/', checkRole(["admin"]), RoleController.getRoles);

export default router;