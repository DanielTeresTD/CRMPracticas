import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const router = Router()

// Ruta por defecto de clients. Aquí va el listado de clientes
router.get('/', ClientController.getClients);
router.get('/:id', ClientController.getClientByID);

export default router;