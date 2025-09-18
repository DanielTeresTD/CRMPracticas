import { Router } from "express";
import { PhoneController } from "../controllers/phone.controller";


// Este parámetro permite que el router padre pueda acceder a parámetros del router hijo.
const router = Router();

router.get('/:id', PhoneController.getPhonesFromClient);

export default router;

