const express = require("express");
const {Multer,uploadImages} = require("../middlewares/uploadImage")

const {
  createUser,
  login,
  forgotPasswordToken,
  resetPassword,
  getLoggedInUserProfile,
  updatedUserProfile,
  getAUser,
  getAllUser,
  deleteAUser,
  updateAUser,
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
  paystackWebhook
  
} = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/auth");

const router = express.Router();
router.post("/register", createUser);
router.post("/login", login);
router.post("/forgot-password", forgotPasswordToken);
router.post("/paystack-webhook", paystackWebhook)
router.put("/reset-password/:token", resetPassword);
router.get("/", authMiddleware, getLoggedInUserProfile);
router.put("/", authMiddleware, Multer.single("image"), uploadImages, updatedUserProfile);
router.get("/get-users", authMiddleware, isAdmin, getAllUser);
router.get("/wishlist", authMiddleware, getWishlist);
router.post("/cart", authMiddleware, userCart);
router.get("/cart", authMiddleware, getUserCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.post("/order", authMiddleware, createOrder);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.get("/getorderbyuser/:id", authMiddleware, isAdmin, getOrdersByUserId);
router.get("/get-orders", authMiddleware, getUserOrders);
router.get("/order/:id", authMiddleware, getOrderById);
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);

router.get("/:id", authMiddleware, isAdmin, getAUser);
router.delete("/:id", authMiddleware, isAdmin, deleteAUser);
router.put("/:id", authMiddleware, isAdmin, updateAUser);



module.exports = router;
