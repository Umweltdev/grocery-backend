const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  rating,
  addToWishlist,
  getProductsByCategory
} = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middlewares/auth");
const {Multer,uploadImages} = require("../middlewares/uploadImage")
const router = express.Router();

router.post("/", authMiddleware, isAdmin, Multer.array("images", 10), uploadImages, createProduct);
router.get("/search", searchProduct);
router.get("/:id", getaProduct);
router.get("/category/:id", getProductsByCategory);
router.put("/:id", authMiddleware, isAdmin, Multer.array("images", 10), uploadImages, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProduct);
router.put("/rating/:prodId", authMiddleware, rating);
router.put("/wishlist/:id", authMiddleware, addToWishlist);


module.exports = router;
