import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const router = Router()

// Ruta por defecto de clients. Aquí va el listado de clientes
router.get('/', ClientController.getClients);
router.get('/:id', ClientController.getClientByID);
// Create client and link it with phones
router.post('/', ClientController.addClient);
// Update client info and phone
router.put('/:id', ClientController.updateClient);
// delete client and phones associated to this client
router.delete('/:id', ClientController.deleteClient);

export default router;