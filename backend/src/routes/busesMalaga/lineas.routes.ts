import { Router } from 'express';
import { LineasController } from '../../controllers/busesMalaga/lineas.controller';

const router = Router();

router.get('/', LineasController.storeBusLines);
router.get('/nom-cod', LineasController.getLinesCodeName);

export default router;
