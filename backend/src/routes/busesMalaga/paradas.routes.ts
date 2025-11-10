import { Router } from "express";
import { ParadasController } from "../../controllers/busesMalaga/paradas.controller";

const router = Router();

router.get("/", ParadasController.getBusStops);
router.get("/linea", ParadasController.getBusStopsByLine);

export default router;
