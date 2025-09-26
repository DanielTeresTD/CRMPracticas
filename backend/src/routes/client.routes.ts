import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const router = Router()

// Ruta por defecto de clients. Aquí va el listado de clientes
router.get('/', ClientController.getClients);
router.get('/:id', ClientController.getClientByID);

router.post('/', ClientController.addClient);

router.put('/:id', ClientController.updateClient);

router.delete('/:id', ClientController.deleteClient);

export default router;