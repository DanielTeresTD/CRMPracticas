import { Router } from "express";
import { DataUsageController } from "../controllers/dataUsage.controller";

const router = Router();

router.post('/', DataUsageController.addDataUsage);
router.put('/:id', DataUsageController.updateDataUsage);
router.delete('/:id', DataUsageController.deleteDataUsage);
router.get('/:id', DataUsageController.getStatisticsYearlyForPhone);
router.get('/:id/:year', DataUsageController.getStatisticsMonthlyForPhone);

export default router;
