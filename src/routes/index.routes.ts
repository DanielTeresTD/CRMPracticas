import { Router } from "express";
import ClientRoutes from "./client.routes.js";
import PhoneRoutes from "./phone.routes.js";

const router = Router();

router.use('/clientes', ClientRoutes);
router.use('/telefonos', PhoneRoutes);

export default router;

