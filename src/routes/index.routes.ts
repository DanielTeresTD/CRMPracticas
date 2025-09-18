import { Router } from "express";
import ClientRoutes from "./client.routes";
import PhoneRoutes from "./phone.routes";

const router = Router();

router.use('/clientes', ClientRoutes);
router.use('/telefonos', PhoneRoutes);

export default router;

