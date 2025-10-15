import { Router } from "express";
import ClientRoutes from "./client.routes";
import PhoneRoutes from "./phone.routes";
import DataUsage from "./dataUsage.routes";
import Email from "./email.routes";
import User from "./user.routes";
import Role from "./role.routes";
import Log from "./log.routes";

const router = Router();

router.use('/clientes', ClientRoutes);
router.use('/telefonos', PhoneRoutes);
router.use('/consumo-datos', DataUsage);
router.use('/email', Email);
router.use('/usuario', User);
router.use('/rol', Role);
router.use('/log', Log);


export default router;

