require("dotenv").config(); // Load .env at the very start

const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cors = require("cors");

// Routers
const userRouter = require("./routes/userRoute");
const categoryRouter = require("./routes/categoryRoute");
const brandRouter = require("./routes/brandRoute");
const productRouter = require("./routes/productRoute");
const addressRouter = require("./routes/addressRoute");
const cardRouter = require("./routes/cardRoute");
const pricingRouter = require("./routes/pricingRoute");

// Controllers
const { stripeWebhook } = require("./controllers/userController");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
dbConnect();

// Allowed CORS origins
const allowedOrigins = [
  "https://groceri-store.netlify.app",
  "http://localhost:5173",
  "http://72.61.17.35:5173",
  "https://kaccocashncarry.co.uk",
  "https://www.kaccocashncarry.co.uk",
];

// Apply CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Stripe webhook MUST use raw body
app.post(
  "/api/user/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Regular body parsers (after Stripe webhook!)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/product", productRouter);
app.use("/api/address", addressRouter);
app.use("/api/card", cardRouter);
app.use("/api/pricing", pricingRouter);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
