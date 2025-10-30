import { Router } from 'express';
import { UbicacionesController } from '../../controllers/busesMalaga/ubicaciones.controller';

const router = Router();

router.get("/", UbicacionesController.storeBusLines);

export default router;
