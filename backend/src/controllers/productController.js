import Product from "../models/Product.js";
import slugify from "../utils/slugify.js";

export async function listProducts(req, res, next) {
  try {
    const { q, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Math.min(Number(limit), 50)),
      Product.countDocuments(filter),
    ]);
    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (e) {
    next(e);
  }
}
export async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
}
export async function adminListProducts(_req, res, next) {
  try {
    res.json({
      success: true,
      products: await Product.find().sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
}
export async function createProduct(req, res, next) {
  try {
    const { name, description, category, price, compareAtPrice, stock } =
      req.body;
    if (!name || !description || !category || price === undefined)
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, description, category and price are required",
        });
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const product = await Product.create({
      name,
      slug: `${slugify(name)}-${Date.now().toString().slice(-6)}`,
      description,
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock || 0),
      image,
    });
    res.status(201).json({ success: true, product });
  } catch (e) {
    next(e);
  }
}
export async function updateProduct(req, res, next) {
  try {
    const updates = { ...req.body };
    ["price", "compareAtPrice", "stock"].forEach((k) => {
      if (updates[k] !== undefined)
        updates[k] = updates[k] === "" ? null : Number(updates[k]);
    });
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    delete updates.slug;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (e) {
    next(e);
  }
}
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (e) {
    next(e);
  }
}
