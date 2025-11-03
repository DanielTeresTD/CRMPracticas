import { Router } from 'express';
import { HorariosController } from '../../controllers/busesMalaga/horarios.controller';

const router = Router();

router.get("/", HorariosController.storeBusSchedule);

export default router;
