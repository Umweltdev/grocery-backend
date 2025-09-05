const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  switchVisibility
} = require("../controllers/categoryController"); 
const { authMiddleware, isAdmin } = require("../middlewares/auth");
const {Multer,uploadImages} = require("../middlewares/uploadImage")

const router = express.Router();

router.post("/", authMiddleware, isAdmin, Multer.single("image"), uploadImages, createCategory);
router.get("/", getallCategory);
router.get("/:id", getCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.put("/visible/:id", authMiddleware, isAdmin, switchVisibility);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);


module.exports = router;
