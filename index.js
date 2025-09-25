const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = 8080;
const userRouter = require("./routes/userRoute");
const categoryRouter = require("./routes/categoryRoute");
const brandRouter = require("./routes/brandRoute");
const productRouter = require("./routes/productRoute");
const addressRouter = require("./routes/addressRoute");
const cardRouter = require("./routes/cardRoute");
const pricingRouter = require("./routes/pricingRoute");
const cors = require("cors");
const { stripeWebhook } = require("./controllers/userController");

// Stripe webhook requires raw body
const stripeWebhookHandler = express.raw({ type: 'application/json' });


 dbConnect();
app.use(cors());

// Stripe webhook endpoint with raw body parsing (must be before JSON parser)
app.post("/api/user/stripe-webhook", stripeWebhookHandler, stripeWebhook);
// General JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/product", productRouter);
app.use("/api/address", addressRouter);
app.use("/api/card", cardRouter);
app.use("/api/pricing", pricingRouter);


app.use(notFound); 
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});