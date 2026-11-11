import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { uploadProductImage } from "../middleware/upload.js";
import Order from "../models/Order.js";
const router = Router();
router.use(protect, adminOnly);
router.get("/products", adminListProducts);
router.post("/products", uploadProductImage, createProduct);
router.patch("/products/:id", uploadProductImage, updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", async (_req, res, next) => {
  try {
    res.json({
      success: true,
      orders: await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
});
router.patch("/orders/:id", async (req, res, next) => {
  try {
    const allowed = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!allowed.includes(req.body.orderStatus))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.orderStatus },
      { new: true },
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
});
export default router;
