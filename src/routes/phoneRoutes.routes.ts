import { Router } from "express";
import { PhoneController } from "../controllers/phoneController.controller.js";


// Este parámetro permite que el router padre pueda acceder a parámetros del router hijo.
const router = Router({ mergeParams: true });

router.get('/', PhoneController.getPhonesFromClient);

export default router;

