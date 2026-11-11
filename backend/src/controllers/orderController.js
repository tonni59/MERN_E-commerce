import Product from "../models/Product.js";
import Order from "../models/Order.js";

export async function createOrder(req, res, next) {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || !items.length)
      return res
        .status(400)
        .json({ success: false, message: "Your cart is empty" });
    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete shipping details are required",
        });
    if (!["cod", "sslcommerz"].includes(paymentMethod))
      return res
        .status(400)
        .json({ success: false, message: "Unsupported payment method" });
    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, isActive: true });
    const byId = new Map(products.map((p) => [String(p._id), p]));
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = byId.get(String(item.productId));
      const qty = Math.floor(Number(item.quantity));
      if (!product || !Number.isInteger(qty) || qty < 1)
        return res
          .status(400)
          .json({ success: false, message: "Invalid cart item" });
      if (product.stock < qty)
        return res
          .status(409)
          .json({
            success: false,
            message: `${product.name} does not have enough stock`,
          });
      subtotal += product.price * qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: qty,
      });
    }
    const shippingFee = 0;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "pending",
    });
    if (paymentMethod === "cod") {
      for (const item of orderItems)
        await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );
    }
    res.status(201).json({ success: true, order });
  } catch (e) {
    next(e);
  }
}
export async function myOrders(req, res, next) {
  try {
    res.json({
      success: true,
      orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
}
