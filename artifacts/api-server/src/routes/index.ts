import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notifyRouter from "./notify";
import learnRouter from "./learn";

const router: IRouter = Router();

router.use(healthRouter);
router.use(notifyRouter);
router.use(learnRouter);

export default router;
