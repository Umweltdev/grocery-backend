const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const cors = require("cors");

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


const app = express();
const PORT = process.env.PORT || 8080;

dbConnect();

const allowedOrigins = [
  "https://groceri-store.netlify.app", 
  "http://localhost:5173",            
];

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
  console.log(`🚀 Server running at port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Missing'}`);
});
