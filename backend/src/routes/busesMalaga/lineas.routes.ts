import { Router } from 'express';
import { LineasController } from '../../controllers/busesMalaga/lineas.controller';

const router = Router();

router.get('/', LineasController.storeBusLines);

export default router;
