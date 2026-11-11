import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  initiateSSL,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIpn,
} from "../controllers/paymentController.js";
const router = Router();
router.post("/ssl/init", protect, initiateSSL);
router.post("/ssl/success", sslSuccess);
router.post("/ssl/fail", sslFail);
router.post("/ssl/cancel", sslCancel);
router.post("/ssl/ipn", sslIpn);
export default router;
