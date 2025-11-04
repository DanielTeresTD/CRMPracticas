import { Router } from "express";
import ClientRoutes from "./client.routes";
import PhoneRoutes from "./phone.routes";
import DataUsage from "./dataUsage.routes";
import Email from "./email.routes";
import Role from "./role.routes";
import Lineas from "./busesMalaga/lineas.routes";
import Paradas from "./busesMalaga/paradas.routes";
import Horarios from "./busesMalaga/horarios.routes";
import Ubicaciones from "./busesMalaga/ubicaciones.routes";
import { UserController } from "../controllers/user.controller";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

router.use('/clientes', ClientRoutes);
router.use('/telefonos', PhoneRoutes);
router.use('/consumo-datos', DataUsage);
router.use('/email', Email);
router.use('/role', Role);
router.use('/lineas-buses', Lineas);
router.use('/paradas-buses', Paradas);
router.use('/ubicaciones-buses', Ubicaciones);
router.use('/horarios', Horarios);

router.post('/register', checkRole(["admin"]), UserController.register);
router.patch('/register', checkRole(["admin"]), UserController.updateRegisterInfo);
router.get('/register-one-user/:dni', checkRole(["admin"]), UserController.retrieveUserData);


export default router;

