import SSLCommerzPayment from "sslcommerz-lts";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const apiBase = () =>
  (
    process.env.BACKEND_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
const frontend = () =>
  (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

export async function initiateSSL(req, res, next) {
  try {
    if (!process.env.SSL_STORE_ID || !process.env.SSL_STORE_PASSWORD)
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Online payment is not configured. Please choose Cash on Delivery.",
        });
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (
      order.paymentMethod !== "sslcommerz" ||
      order.paymentStatus !== "pending"
    )
      return res
        .status(400)
        .json({
          success: false,
          message: "Order is not awaiting online payment",
        });
    if (!order.transactionId) {
      order.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await order.save();
    }
    const ssl = new SSLCommerzPayment(
      process.env.SSL_STORE_ID,
      process.env.SSL_STORE_PASSWORD,
      process.env.SSL_IS_LIVE === "true",
    );
    const base = apiBase();
    const data = {
      total_amount: order.total,
      currency: "BDT",
      tran_id: order.transactionId,
      success_url: `${base}/api/payments/ssl/success`,
      fail_url: `${base}/api/payments/ssl/fail`,
      cancel_url: `${base}/api/payments/ssl/cancel`,
      ipn_url: `${base}/api/payments/ssl/ipn`,
      shipping_method: "NO",
      product_name: order.items
        .map((i) => i.name)
        .join(", ")
        .slice(0, 200),
      product_category: "E-commerce",
      product_profile: "general",
      cus_name: order.shippingAddress.fullName,
      cus_email: req.user.email,
      cus_add1: order.shippingAddress.address,
      cus_city: order.shippingAddress.city,
      cus_postcode: "0000",
      cus_country: "Bangladesh",
      cus_phone: order.shippingAddress.phone,
    };
    const result = await ssl.init(data);
    if (!result?.GatewayPageURL)
      return res
        .status(502)
        .json({
          success: false,
          message: "Payment gateway did not return a checkout URL",
        });
    res.json({ success: true, url: result.GatewayPageURL });
  } catch (e) {
    next(e);
  }
}
async function validateAndUpdate(body, desiredStatus) {
  const tranId = body?.tran_id;
  if (!tranId) return null;
  const order = await Order.findOne({ transactionId: tranId });
  if (!order) return null;
  if (desiredStatus === "paid") {
    const ssl = new SSLCommerzPayment(
      process.env.SSL_STORE_ID,
      process.env.SSL_STORE_PASSWORD,
      process.env.SSL_IS_LIVE === "true",
    );
    const validation = await ssl.validate({ val_id: body.val_id });
    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED")
      return order;
    if (
      Number(validation.amount) !== Number(order.total) ||
      validation.tran_id !== order.transactionId
    )
      return order;
    if (order.paymentStatus !== "paid") {
      for (const item of order.items) {
        const updated = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );
        if (updated.modifiedCount !== 1)
          throw new Error(
            "Insufficient stock while confirming payment; contact store support",
          );
      }
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.gatewayTransactionId =
        validation.bank_tran_id || validation.tran_id;
      await order.save();
    }
  } else if (order.paymentStatus === "pending") {
    order.paymentStatus = "failed";
    await order.save();
  }
  return order;
}
export async function sslSuccess(req, res) {
  try {
    const order = await validateAndUpdate(req.body, "paid");
    res.redirect(
      `${frontend()}/checkout/result?status=${order?.paymentStatus === "paid" ? "success" : "pending"}`,
    );
  } catch {
    res.redirect(`${frontend()}/checkout/result?status=error`);
  }
}
export async function sslFail(req, res) {
  try {
    await validateAndUpdate(req.body, "failed");
  } catch {}
  res.redirect(`${frontend()}/checkout/result?status=failed`);
}
export async function sslCancel(req, res) {
  try {
    await validateAndUpdate(req.body, "failed");
  } catch {}
  res.redirect(`${frontend()}/checkout/result?status=cancelled`);
}
export async function sslIpn(req, res) {
  try {
    await validateAndUpdate(req.body, "paid");
    res.status(200).send("OK");
  } catch {
    res.status(500).send("ERROR");
  }
}
