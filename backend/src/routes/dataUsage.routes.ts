import { Router } from "express";
import { DataUsageController } from "../controllers/dataUsage.controller";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

router.post('/', checkRole(['admin']), DataUsageController.addDataUsage);
router.put('/:id', checkRole(['admin']), DataUsageController.updateDataUsage);
router.delete('/:id', checkRole(['admin']), DataUsageController.deleteDataUsage);
router.get('/:id', DataUsageController.getStatisticsYearlyForPhone);
router.get('/:id/:year', DataUsageController.getStatisticsMonthlyForPhone);

export default router;
