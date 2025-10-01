import { Router } from "express";
import { DataUsageController } from "../controllers/dataUsage.controller";

const router = Router();

router.post('/', DataUsageController.addDataUsage);
router.put('/:id', DataUsageController.updateDataUsage);
router.delete('/:id', DataUsageController.deleteDataUsage);
router.get('/:id', DataUsageController.getStatisticsForPhone);

export default router;
