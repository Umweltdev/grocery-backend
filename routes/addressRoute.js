const express = require("express");
const {
  addAddress,
  updatedAddress,
  getAddresses,
  getAddress,
  deleteAddress,
} = require("../controllers/addressController");
const { authMiddleware, isAdmin } = require("../middlewares/auth");
const router = express.Router();

router.post("/", authMiddleware, addAddress);
router.put("/:id", authMiddleware,updatedAddress);
router.delete("/:id", authMiddleware, deleteAddress); 
router.get("/:id", authMiddleware, getAddress);
router.get("/", authMiddleware, getAddresses);

module.exports = router;
