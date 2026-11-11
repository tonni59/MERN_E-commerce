import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (
    !ADMIN_NAME ||
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    ADMIN_PASSWORD.length < 12
  ) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in .env",
    );
  }
  const email = ADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email });
  if (user) {
    user.name = ADMIN_NAME;
    user.role = "admin";
    user.password = ADMIN_PASSWORD;
    await user.save();
    console.log(`Updated admin account: ${email}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Created admin account: ${email}`);
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
