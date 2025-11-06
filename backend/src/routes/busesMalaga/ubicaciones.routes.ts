import { Router } from "express";
import { UbicacionesController } from "../../controllers/busesMalaga/ubicaciones.controller";

const router = Router();

router.get("/", UbicacionesController.storeBusLines);
router.get("/linea", UbicacionesController.getBusByLine);
router.get("/buses", UbicacionesController.getBuses);

export default router;
