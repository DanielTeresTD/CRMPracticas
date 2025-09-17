import { Router } from "express";
import PhoneRoutes from './phoneRoutes.routes.js';
import { ClientController } from "../controllers/clientController.controller.js";

const router = Router()

// Ruta por defecto de clients. Aquí va el listado de clientes
router.get('/', ClientController.getClients);

router.use("/:id/telefonos", PhoneRoutes);

export default router;