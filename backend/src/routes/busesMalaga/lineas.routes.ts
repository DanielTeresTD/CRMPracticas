import { Router } from "express";
import { LineasController } from "../../controllers/busesMalaga/lineas.controller";

const router = Router();

router.get("/", LineasController.storeBusLines);
router.get("/nom-cod", LineasController.getLinesCodeName);
router.get("/lineas-en-parada", LineasController.getLinesAtStop);

export default router;
