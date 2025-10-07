import { Router } from "express";
import ClientRoutes from "./client.routes";
import PhoneRoutes from "./phone.routes";
import DataUsage from "./dataUsage.routes";
import Email from "./email.routes";

const router = Router();

router.use('/clientes', ClientRoutes);
router.use('/telefonos', PhoneRoutes);
router.use('/consumo-datos', DataUsage);
router.use('/email', Email);


export default router;

