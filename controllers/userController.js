const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Card = require("../models/cardModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const sendEmail = require("./emailContoller");
const { v4: uuidv4 } = require("uuid");
const { cloudinaryDeleteImg } = require("../utils/cloudinary");
const axios = require("axios");

// --- Configuration & Constants ---
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is missing in env");
  throw new Error("Missing Paystack secret key");
}

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

const PAYMENT_METHODS = { CASH: 'cash', CARD: 'card' };
const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// --- CONTROLLERS ---

const createUser = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  const findUser = await User.findOne({ $or: [{ email }, { phone }] });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      token: generateToken(newUser._id),
    });
  } else {
    res.status(409);
    throw new Error("User with this email or phone number already exists.");
  }
});

const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const findUser = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });

  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser._id,
      fullName: findUser.fullName,
      role: findUser.role,
      email: findUser.email,
      phone: findUser.phone,
      token: generateToken(findUser._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found with this email");
  }

  const token = await user.createPasswordResetToken();
  await user.save();

  const resetURL = `<p>Hi, Please follow this link to reset your password.</p><p>This link is valid for 10 minutes.</p><a href="${process.env.CLIENT_URL}/reset-password/${token}">Click Here to Reset Password</a>`;
  const data = { to: email, text: "Password Reset", subject: "Password Reset Link", htm: resetURL };
  sendEmail(data);
  res.json({ message: "Password reset link sent to your email." });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token Expired or Invalid. Please try again.");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ message: "Password has been reset successfully." });
});

const getLoggedInUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const user = await User.findById(_id).select("-password -__v");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

const updatedUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { fullName, dob, phone } = req.body;
  const updateData = { fullName, dob, phone };

  if (req.images && req.images.length > 0) {
    updateData.image = req.images[0];
    if (user.image?.public_id) {
      await cloudinaryDeleteImg(user.image.public_id);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true }).select("-password");
  res.json(updatedUser);
});

const getAllUser = asyncHandler(async (req, res) => {
  const getUsers = await User.find().select("-password -__v");
  res.status(200).json(getUsers);
});

const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const user = await User.findById(id).select("-password -__v");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(user);
});

const updateAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const { fullName, email, phone, dob } = req.body;
  const updatedUser = await User.findByIdAndUpdate(id, { fullName, email, phone, dob }, { new: true }).select("-password");
  if (!updatedUser) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(updatedUser);
});

const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await Cart.deleteMany({ orderBy: id });
  await Card.deleteMany({ owner: id });
  res.status(200).json({ message: "User and related data deleted successfully." });
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const findUser = await User.findById(_id).populate("wishlist");
  res.json(findUser.wishlist);
});

// --- Wishlist ---
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    validateMongoDbId(_id);
    validateMongoDbId(prodId);
  
    const user = await User.findById(_id);
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
  
    let updatedUser;
    if (alreadyAdded) {
      updatedUser = await User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } }, { new: true });
    } else {
      updatedUser = await User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true });
    }
    
    res.json(updatedUser);
});

// --- Cart ---
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty or invalid" });
  }
  
  let products = [];
  let cartTotal = 0;

  for (const item of cart) {
    const product = await Product.findById(item.product).select("price stock name").exec();
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${item.product} not found`);
    }
    if (product.stock < item.count) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} left.`);
    }
    cartTotal += product.price * item.count;
    products.push({ product: item.product, count: item.count, price: product.price });
  }

  const newCart = await Cart.findOneAndUpdate(
    { orderBy: _id },
    { products, cartTotal, orderBy: _id },
    { new: true, upsert: true }
  );
  res.status(201).json(newCart);
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const cart = await Cart.findOne({ orderBy: _id }).populate({
    path: "products.product",
    select: "name regularPrice salePrice stock image",
  });
  if (!cart) {
    return res.status(200).json({ message: "Cart is empty", products: [], cartTotal: 0 });
  }
  res.status(200).json(cart);
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const cart = await Cart.findOneAndRemove({ orderBy: _id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found or was already empty.");
  }
  res.status(200).json({ message: "Cart emptied successfully." });
});

// --- Orders ---
const createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, address, deliveryDate, deliveryTime, comment, cardId } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method." });
  }
  if (!address?.trim()) {
    return res.status(400).json({ message: "Delivery address is required." });
  }

  const user = await User.findById(_id);
  const userCart = await Cart.findOne({ orderBy: user._id });
  if (!userCart || userCart.products.length === 0) {
    return res.status(400).json({ message: "Cannot create order, your cart is empty." });
  }

  for (const item of userCart.products) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.count) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }
  }

  let orderStatus = ORDER_STATUS.PENDING;
  let paystackPayment;
  let reference = `cash_${uuidv4()}`;

  if (paymentMethod === PAYMENT_METHODS.CARD) {
    if (cardId) {
      const card = await Card.findById(cardId);
      if (!card) return res.status(404).json({ message: "Saved card not found." });
      paystackPayment = await initializePaystackCheckoutWithCard(userCart.cartTotal, user.email, card.cardDetails.authorization_code);
      if (paystackPayment.status !== 'success') {
        return res.status(400).json({ message: "Card payment failed, please try another card." });
      }
      orderStatus = ORDER_STATUS.PROCESSING;
    } else {
      paystackPayment = await initializePaystackCheckout(userCart.cartTotal, user.email, user._id);
    }
    reference = paystackPayment.reference;
  } else {
    orderStatus = ORDER_STATUS.PROCESSING;
  }

  const newOrder = await new Order({
    products: userCart.products,
    paymentMethod,
    totalPrice: userCart.cartTotal,
    orderBy: user._id,
    orderStatus,
    address,
    comment,
    deliveryDate,
    deliveryTime,
    reference,
  }).save();

  await updateProductStock(userCart.products);
  await Cart.deleteOne({ orderBy: user._id });

  const populatedOrder = await Order.findById(newOrder._id).populate("products.product", "name image");
  const response = { message: "Order created successfully", order: populatedOrder };
  if (paymentMethod === PAYMENT_METHODS.CARD && !cardId) {
    response.authorizationUrl = paystackPayment.authorizationUrl;
  }
  res.status(201).json(response);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const orders = await Order.find({ orderBy: _id }).populate("products.product", "name image").sort("-createdAt");
  res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const order = await Order.findById(id).populate("products.product", "name image").populate("orderBy", "fullName email phone");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("orderBy", "fullName email").sort("-createdAt");
  res.status(200).json(orders);
});

const getOrdersByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const orders = await Order.find({ orderBy: id }).populate("products.product", "name image").populate("orderBy", "fullName email phone").sort("-createdAt");
  res.status(200).json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  if (!Object.values(ORDER_STATUS).includes(orderStatus)) {
    res.status(400);
    throw new Error("Invalid order status provided.");
  }
  const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json({ message: "Order status updated successfully", order });
});

// --- Webhooks ---
const paystackWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];
  if (!signature) {
    return res.status(400).json({ message: "Invalid request: No signature" });
  }

  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(JSON.stringify(req.body));
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const { event, data } = req.body;
  if (event === "charge.success") {
    const order = await Order.findOne({ reference: data.reference });
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.orderStatus = ORDER_STATUS.PROCESSING;
      await order.save();
      const existingCard = await Card.findOne({ "cardDetails.authorization_code": data.authorization.authorization_code });
      if (!existingCard && data.metadata?.userId) {
        await Card.create({ cardDetails: data.authorization, owner: data.metadata.userId });
      }
    }
  }
  res.sendStatus(200);
});

// --- Helper Functions ---
async function initializePaystackCheckout(amount, email, userId) {
  try {
    const { data } = await paystack.post("/transaction/initialize", {
      email,
      amount: amount * 100,
      channels: ["card"],
      metadata: { userId },
    });
    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (error) {
    console.error("Paystack checkout error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Paystack checkout failed");
  }
}

async function initializePaystackCheckoutWithCard(amount, email, authorization_code) {
  try {
    const { data } = await paystack.post("/transaction/charge_authorization", {
      email,
      amount: amount * 100,
      authorization_code,
    });
    return {
      reference: data.data.reference,
      status: data.data.status,
    };
  } catch (error) {
    console.error("Paystack saved-card error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Paystack charge failed");
  }
}

const updateProductStock = async (products) => {
  if (!products?.length) return;
  const bulkOperations = products.map((item) => ({
    updateOne: {
      filter: { _id: item.product, stock: { $gte: item.count } },
      update: { $inc: { stock: -item.count, sold: +item.count } },
    },
  }));
  try {
    await Product.bulkWrite(bulkOperations);
  } catch (error) {
    console.error("Stock update error:", error);
    throw new Error("Failed to update product stock");
  }
};

// --- Exports ---
module.exports = {
  createUser,
  login,
  getLoggedInUserProfile,
  updatedUserProfile,
  getAUser,
  deleteAUser,
  updateAUser,
  getAllUser,
  forgotPasswordToken,
  resetPassword,
  getWishlist,
  addToWishlist,
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getUserOrders,
  updateOrderStatus,
  paystackWebhook,
};