import { Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { checkRole } from "../middlewares/checkRole";

const router = Router()

// Ruta por defecto de clients. Aquí va el listado de clientes
router.get('/', checkRole(['admin']), ClientController.getClients);
// Check role managed inside controller
router.get('/:id', ClientController.getClientByID);
// Create client and link it with phones
router.post('/', checkRole(['admin']), ClientController.addClient);
// Update client info and phone
router.put('/:id', checkRole(['admin']), ClientController.updateClient);
// delete client and phones associated to this client
router.delete('/:id', checkRole(['admin']), ClientController.deleteClient);

export default router;