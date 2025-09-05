const express = require("express");
const {
  deleteCard,
  getCard,
  getCards
} = require("../controllers/cardController");
const { authMiddleware} = require("../middlewares/auth");
const router = express.Router();

router.delete("/:id", authMiddleware, deleteCard); 
router.get("/:id", authMiddleware, getCard);
router.get("/", authMiddleware, getCards);

module.exports = router;
