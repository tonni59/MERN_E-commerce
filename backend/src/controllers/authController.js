import User from "../models/User.js";
import { signToken, safeUser } from "../utils/token.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email and password are required",
        });
    if (password.length < 8)
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters",
        });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail }))
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });
    res
      .status(201)
      .json({ success: true, user: safeUser(user), token: signToken(user) });
  } catch (e) {
    next(e);
  }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    res.json({ success: true, user: safeUser(user), token: signToken(user) });
  } catch (e) {
    next(e);
  }
}
export async function me(req, res) {
  res.json({ success: true, user: safeUser(req.user) });
}
