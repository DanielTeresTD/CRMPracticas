import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.post('/login', UserController.login);
// router.get('/logout');
router.post('/register', UserController.add);

export default router;
