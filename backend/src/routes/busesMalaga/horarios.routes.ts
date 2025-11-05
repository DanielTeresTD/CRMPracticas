import { Router } from "express";
import { HorariosController } from "../../controllers/busesMalaga/horarios.controller";

const router = Router();

router.get("/", HorariosController.storeBusSchedule);
router.get("/paradas-orden", HorariosController.getBusStopsOrdered);

export default router;
