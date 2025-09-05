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

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer sk_test_72f9b6cb1cf752a0ddd3d696e2c592849ff81a12`,
    "Content-Type": "application/json",
  },
});

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
      if(user.image && user.image.public_id) {
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
    const findUser = await User.findById({_id}, 'wishlist').populate("wishlist");
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
    let products = [];
    const user = await User.findById(_id);
    // Check if the user already has a cart and remove it
    const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    if (alreadyExistCart) {
      await Cart.deleteMany({ _id: alreadyExistCart._id });
    }

    for (let i = 0; i < cart.length; i++) {
      const product = await Product.findById(cart[i].id)
        .select("regularPrice salePrice stock")
        .exec();
      if (!product) {
        continue;
      }
      if (product.stock <= 0 || product.sold >= product.stock) {
        continue;
      }
      let object = {};
      object.id = cart[i].id;
      object.count = cart[i].count;
      object.price = product.salePrice || product.regularPrice;
      object.name = product.name;
      object.image = cart[i].image;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal += products[i].price * products[i].count;
    }
    const existingCart = await Cart.findOne({ orderBy: user._id });
    if (existingCart) {
      existingCart.products = products;
      existingCart.cartTotal = cartTotal;
      await existingCart.save();
      return res.json(existingCart);
    } else {
      let newCart = await new Cart({ 
        products,
        cartTotal,
        orderBy: user?._id,
      }).save();
      return res.json(newCart);
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate("products.id");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
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
    paymentMethod,
    address,
    deliveryDate,
    deliveryTime,
    comment,
    cardId,
  } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  let orderStatus;
  const validPaymentMethods = ["cash", "card"];
  if (!validPaymentMethods.includes(paymentMethod))
    return res.status(400).json({ error: "Invalid payment method" });

  if (paymentMethod === "cash") {
    orderStatus = "Processing";
  } else if (paymentMethod === "card") {
    try {
      const user = await User.findById(_id);
      const userCart = await Cart.findOne({ orderBy: user._id });
      const orderId = uuidv4();
      let paystackPayment;

      if (cardId) {
        const card = await Card.findById(cardId);
        if (!card) {
          return res.status(404).json({ error: "Card not found" });
        }
        paystackPayment = await initializePaystackCheckoutWithCard(
          userCart.cartTotal,
          user.email,
          card.cardDetails.authorization_code
        );

        if (paystackPayment.status === "success") {
          await createNewOrder(
            orderId,
            userCart.products,
            paymentMethod,
            userCart.cartTotal,
            user._id,
            "Processing",
            address,
            comment,
            deliveryDate,
            deliveryTime,
            paystackPayment.reference
          );
          user.orderCount += 1;
          await user.save();
          await updateProductStock(userCart.products);
          await Cart.deleteOne({ orderBy: user._id });
          return res.json({
            message: "success",
            status: paystackPayment.status,
          });
        } else {
          // Payment was not successful
          return res.status(400).json({ error: "Payment failed" });
        }
      } else {
        paystackPayment = await initializePaystackCheckout(
          userCart.cartTotal,
          user.email,
          user._id
        );
        await createNewOrder(
          orderId,
          userCart.products,
          paymentMethod,
          userCart.cartTotal,
          user._id,
          "Processing",
          address,
          comment,
          deliveryDate,
          deliveryTime,
          paystackPayment.reference
        );
        user.orderCount += 1;
        await user.save();
        await updateProductStock(userCart.products);
        await Cart.deleteOne({ orderBy: user._id });
        return res.json({
          message: "success",
          authorizationUrl: paystackPayment.authorizationUrl,
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  try {
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmout = userCart.cartTotal;
    const orderId = uuidv4();
    await createNewOrder(
      orderId,
      userCart.products,
      paymentMethod,
      userCart.cartTotal,
      user._id,
      orderStatus,
      address,
      comment,
      deliveryDate,
      deliveryTime
    );
    user.orderCount += 1;
    await user.save();
    await updateProductStock(userCart.products);
    await Cart.deleteOne({ orderBy: user._id });
    res.json({ message: "success" });
  } catch (error) {
    throw new Error(error);
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
    const alluserorders = await Order.find().populate("address").exec();
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
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus,
        isPaid,
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});

const paystackWebhook = asyncHandler(async (req, res) => {
  const secret = "sk_test_72f9b6cb1cf752a0ddd3d696e2c592849ff81a12";
  const hash = req.headers["x-paystack-signature"];
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(JSON.stringify(req.body));
  const digest = hmac.digest("hex");
  if (digest !== hash) {
    console.error("Invalid webhook signature");
    res.status(400).send("Invalid signature");
    return;
  }
  const event = req.body.event;
  const data = req.body.data;
  if (event === "charge.success") {
    const paymentReference = data.reference;
    try {
      const order = await Order.findOne({ reference: paymentReference });
      await Order.findByIdAndUpdate(
        { _id: order._id },
        {
          isPaid: true,
        },
        { new: true }
      );
      const existingCard = await Card.findOne({
        "cardDetails.authorization_code": data.authorization.authorization_code,
      });
      if (!existingCard) {
        await Card.create({
          cardDetails: data.authorization,
          owner: data.metadata.userId,
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  res.sendStatus(200);
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
  paystackWebhook,
};

async function initializePaystackCheckout(amount, email, userId) {
  const { data } = await paystack.post("/transaction/initialize", {
    email: email,
    amount: amount * 100,
    channels: ["card"],
    metadata: {
      userId: userId,
    },
  });

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

async function initializePaystackCheckoutWithCard(
  amount,
  email,
  authorization_code
) {
  const { data } = await paystack.post("/transaction/charge_authorization", {
    email: email,
    amount: amount * 100,
    authorization_code: authorization_code,
  });

  return {
    reference: data.data.reference,
    status: data.data.status,
  };
}

const createNewOrder = async (
  orderId,
  products,
  paymentMethod,
  totalPrice,
  userId,
  orderStatus,
  address,
  comment,
  deliveryDate,
  deliveryTime,
  reference
) => {
  return new Order({
    orderId,
    products: products.map((product) => ({
      product: product.id,
      price: product.price,
      count: product.count,
      image: product.image,
    })),
    paymentMethod,
    totalPrice,
    orderBy: userId,
    orderStatus,
    address,
    comment,
    deliveryDate,
    deliveryTime,
    reference,
  }).save();
};

const updateProductStock = async (products) => {
  const updateOperations = products.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $inc: { stock: -item.count, sold: +item.count } },
    },
  }));

  await Product.bulkWrite(updateOperations, {});
};
