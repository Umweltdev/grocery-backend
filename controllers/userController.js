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
const Stripe = require("stripe");
const PricingService = require("../utils/pricingService");
const {
  processCashOrder,
  processCardOrder,
  processStripeWebhook,
} = require("../services/paymentService");
const NotificationService = require("../services/notificationService");


if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is missing in env");
  throw new Error("Missing Stripe secret key");
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const newUser = await User.create(req.body);
    res.status(201).json({
      _id: newUser?._id,
      fullName: newUser?.fullName,
      role: newUser?.role,
      dob: newUser?.dob,
      email: newUser?.email,
      phone: newUser?.phone,
      orders: newUser?.orderCount,
      image: newUser?.image.url,
      token: generateToken(newUser?._id),
    });
  } else {
    res.status(409);
    throw new Error("User With This Email Or Phone-Number Already Exists");
  }
});

// Login a user
const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      _id: findUser?._id,
      fullName: findUser?.fullName,
      role: findUser?.role,
      dob: findUser?.dob,
      email: findUser?.email,
      phone: findUser?.phone,
      orders: findUser?.orderCount,
      image: findUser?.image.url,
      token: generateToken(findUser?._id),
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
    const error = new Error("User not found with this email");
    error.statusCode = 404;
    throw error;
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getLoggedInUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id, "-updatedAt -createdAt -__v");
    res.status(200).json(user);
  } catch (error) {
    throw new Error(error);
  }
});

const updatedUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    delete req.body.image;
    const updateObject = { ...req.body };
    if (req.images && req.images.length > 0) {
      updateObject.image = req.images[0];
      if (user.image && user.image.public_id) {
        await cloudinaryDeleteImg(user.image.public_id);
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      updateObject,
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().select('-password -passwordResetToken -passwordResetExpires -wishlist');
    res.status(200).json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});

const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id).select('-password -passwordResetToken -passwordResetExpires -wishlist');
    if (!getaUser) {
      const error = new Error("User not found with this email");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(
      getaUser,
    );
  } catch (error) {
    throw new Error(error);
  }
});

const updateAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        fullName: req?.body?.fullName,
        email: req?.body?.email,
        phone: req?.body?.phone,
        dob: req?.body?.dob,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById({ _id }, 'wishlist').populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let products = [];

    for (let i = 0; i < cart.length; i++) {
      const product = await Product.findById(cart[i].id)
        .select("regularPrice salePrice stock name")
        .exec();
      if (!product || product.stock <= 0 || product.sold >= product.stock) continue;

      products.push({
        id: cart[i].id,
        count: cart[i].count,
        price: (await PricingService.calculateFinalPrice(product.regularPrice, _id)).basePrice,
        name: product.name,
        image: cart[i].image,
      });
    }

    const cartTotal = products.reduce((total, p) => total + p.price * p.count, 0);

    const existingCart = await Cart.findOne({ orderBy: user._id });

    if (existingCart) {
      existingCart.products = products;
      existingCart.cartTotal = cartTotal;
      await existingCart.save();
      return res.json(existingCart);
    }

    // If no cart exists, create new
    const newCart = await Cart.create({
      products,
      cartTotal,
      orderBy: user._id,
    });

    return res.json(newCart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
});


const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate("products.id");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found or empty" });
    }

    res.json(cart);
  } catch (error) {
    // Narrow down the error
    if (error.name === "DocumentNotFoundError") {
      console.warn(`Cart for user ${_id} not found.`);
      return res.status(404).json({ message: "Cart not found" });
    }

    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderBy: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    paymentMethod = 'card',
    address,
    deliveryDate,
    deliveryTime,
    comment,
    cardId,
  } = req.body;

  const { _id } = req.user;
  validateMongoDbId(_id);

  // Validate payment method
  const validPaymentMethods = ["cash", "card"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: "Invalid payment method. Must be 'cash' or 'card'" });
  }

  try {
    // Get user and cart
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCart = await Cart.findOne({ orderBy: user._id });
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ error: "Cart is empty or not found" });
    }

    const orderId = uuidv4();

    if (paymentMethod === "cash") {
      return await processCashOrder({
        orderId,
        user,
        userCart,
        address,
        comment,
        deliveryDate,
        deliveryTime,
        res
      });
    }


    return await processCardOrder({
      orderId,
      user,
      userCart,
      cardId,
      address,
      comment,
      deliveryDate,
      deliveryTime,
      res
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});





const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ orderBy: _id })
      .populate("products.product")
      .populate("orderBy")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findById({ _id: id })
      .populate({
        path: "products.product",
        select: "name description regularPrice salePrice",
      })
      .populate("orderBy")
      .populate("address")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find()
      .populate("address")
      .populate({
        path: "orderBy",
        select: "email fullName"
      })
      .exec();
    console.log("Sample order with user data:", JSON.stringify(alluserorders[0], null, 2));
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getOrdersByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.find({ orderBy: id })
      .populate("products.product")
      .populate("orderBy")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, isPaid } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const order = await Order.findById(id).populate('orderBy');
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus,
        isPaid,
      },
      { new: true }
    ).populate('orderBy');
    
    // Send email notification to customer based on status change
    if (order.orderStatus !== orderStatus) {
      await NotificationService.sendOrderStatusUpdateToCustomer(updatedOrder, orderStatus);
    }
    
    res.json(updatedOrder);
  } catch (error) {
    throw new Error(error);
  }
});

const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event using payment service
  try {
    await processStripeWebhook(event);
  } catch (error) {
    console.error('Error processing webhook event:', error);
  }

  res.json({ received: true });
});

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
  userCart,
  getUserCart,
  emptyCart,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getUserOrders,
  updateOrderStatus,
  stripeWebhook,
};
