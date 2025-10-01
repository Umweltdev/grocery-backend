const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const { calculateDeliveryFee } = require('../utils/deliveryCalculator');

// Helper function to calculate delivery fee
const calculateDeliveryForOrder = async (addressId, userId) => {
  const ORIGIN_ADDRESS = process.env.STORE_ADDRESS || "Unit 18 Catford Broadway, London SE9 3QN";
  
  const destinationAddressDoc = await Address.findOne({ 
    _id: addressId, 
    createdBy: userId 
  });
  
  if (!destinationAddressDoc) {
    throw new Error("Delivery address not found");
  }

  const destinationAddress = `${destinationAddressDoc.address}, ${destinationAddressDoc.state}, ${destinationAddressDoc.country}`;
  return await calculateDeliveryFee(ORIGIN_ADDRESS, destinationAddress);
};

// Helper function to get or create Stripe customer
const getOrCreateStripeCustomer = async (user) => {
  try {
    if (user.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      return customer;
    }
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName,
      phone: user.phone,
      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
      },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
    return customer;
  } catch (error) {
    console.error('Error getting or creating Stripe customer:', error);
    throw error;
  }
};

const initializeStripeCheckout = async (amount, email, userId, successUrl, cancelUrl, cartItems = [], customerId = null, deliveryFee = 0, deliveryInfo = null) => {
 
  const lineItems = [];

  // Add delivery fee as a separate line item if applicable
  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Delivery Fee',
          description: deliveryInfo?.calculation || `Delivery within ${deliveryInfo?.distance}km`,
        },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });
  }

  if (cartItems && cartItems.length > 0) {
    cartItems.forEach((item) => {
      const quantity = item.count || 1;
      const unitPrice = Math.round((item.price || 0) * 100); // Convert to pence
      const subtotal = unitPrice * quantity;

      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name || 'Product',
            description: `Quantity: ${quantity} × £${(item.price || 0).toFixed(2)} each`,
          },
          unit_amount: unitPrice,
        },
        quantity: quantity,
      });
    });
  } else {
    // Fallback for direct amount payment
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Order Payment',
          description: 'Complete your purchase',
        },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    });
  }

  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
    success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      userId: userId.toString(),
      itemCount: cartItems ? cartItems.length : 0,
      totalAmount: amount,
      deliveryFee: deliveryFee.toString(),
      deliveryType: deliveryInfo?.deliveryType || 'delivery',
      distance: deliveryInfo?.distance?.toString() || '0',
    },
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic',
      },
    },
    automatic_tax: {
      enabled: false, 
    },
  };

  if (customerId) {
    sessionConfig.customer = customerId;
  } else {
    sessionConfig.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return {
    sessionId: session.id,
    url: session.url,
  };
};

// Initialize Stripe payment with saved card
const initializeStripePaymentWithSavedCard = async (amount, user, paymentMethodId, deliveryFee = 0) => {
  try {
    const stripeCustomer = await getOrCreateStripeCustomer(user);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round((amount + deliveryFee) * 100), // Include delivery fee
      currency: 'gbp',
      customer: stripeCustomer.id,
      payment_method: paymentMethodId,
      confirm: true,
      capture_method: 'automatic',
      payment_method_types: ['card'],
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' },
      },
      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
        deliveryFee: deliveryFee.toString(),
      },
    });

    // Return different responses based on payment status
    if (paymentIntent.status === 'succeeded') {
      return {
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
        requiresAction: false,
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        status: 'failed',
        error: 'Payment requires additional authentication. Please try a different payment method or contact support.',
        paymentIntentId: paymentIntent.id,
        requiresAction: true,
      };
    } else {
      return {
        status: 'failed',
        error: `Payment failed with status: ${paymentIntent.status}`,
        paymentIntentId: paymentIntent.id,
      };
    }
  } catch (error) {
    console.error('Error in initializeStripePaymentWithSavedCard:', error);
    return {
      status: 'failed',
      error: error.message,
    };
  }
};

// Process saved card payment with race condition protection
const processSavedCardPayment = async ({ orderId, user, userCart, cardId, address, comment, deliveryDate, deliveryTime, res }) => {
  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Calculate delivery fee
    const deliveryInfo = await calculateDeliveryForOrder(address, user._id);
    const totalPriceWithDelivery = userCart.cartTotal + deliveryInfo.deliveryFee;

    const stripePayment = await initializeStripePaymentWithSavedCard(
      userCart.cartTotal,
      user, 
      card.paymentMethodId,
      deliveryInfo.deliveryFee
    );

    if (stripePayment.status === "succeeded") {
      const existingOrder = await Order.findOne({ orderId: orderId });
      if (existingOrder) {
        return res.json({
          message: "Payment successful - order already processed",
          status: stripePayment.status,
          orderId: orderId,
        });
      }

      await createNewOrder(
        orderId,
        userCart.products,
        "card",
        userCart.cartTotal,
        totalPriceWithDelivery,
        user._id,
        "Processing",
        address,
        comment,
        deliveryDate,
        deliveryTime,
        deliveryInfo.deliveryFee,
        deliveryInfo.distance,
        deliveryInfo.deliveryType,
        stripePayment.paymentIntentId
      );

      user.orderCount += 1;
      user.totalSpend += totalPriceWithDelivery;
      await user.save();

      await updateProductStock(userCart.products);
      await Cart.deleteOne({ orderBy: user._id });

      return res.json({
        message: "Payment successful",
        status: stripePayment.status,
        orderId: orderId,
        deliveryFee: deliveryInfo.deliveryFee,
        distance: deliveryInfo.distance,
        cartTotal: userCart.cartTotal,
        totalPriceWithDelivery: totalPriceWithDelivery,
        deliveryType: deliveryInfo.deliveryType,
        calculation: deliveryInfo.calculation
      });
    } else {
      return res.status(400).json({
        error: "Payment failed",
        details: stripePayment.error || "Unknown error",
        status: stripePayment.status,
      });
    }
  } catch (error) {
    console.error('Error in processSavedCardPayment:', error);
    return res.status(500).json({
      error: "Payment processing failed",
      details: error.message,
    });
  }
};

// Process new checkout session
const processNewCheckoutSession = async ({ orderId, user, userCart, address, comment, deliveryDate, deliveryTime, res }) => {
  try {
    // Calculate delivery fee
    const deliveryInfo = await calculateDeliveryForOrder(address, user._id);
    const totalPriceWithDelivery = userCart.cartTotal + deliveryInfo.deliveryFee;

    const stripeCustomer = await getOrCreateStripeCustomer(user);

    const stripePayment = await initializeStripeCheckout(
      userCart.cartTotal,
      user.email,
      user._id,
      null,
      null,
      userCart.products, 
      stripeCustomer.id,
      deliveryInfo.deliveryFee,
      deliveryInfo
    );
   
    const newOrder = await createNewOrder(
      orderId,
      userCart.products,
      "card",
      userCart.cartTotal,
      totalPriceWithDelivery,
      user._id,
      "Pending",
      address,
      comment,
      deliveryDate,
      deliveryTime,
      deliveryInfo.deliveryFee,
      deliveryInfo.distance,
      deliveryInfo.deliveryType,
      stripePayment.sessionId
    );

    user.orderCount += 1;
    await user.save();

    return res.json({
      message: "Redirect to payment",
      checkoutUrl: stripePayment.url,
      sessionId: stripePayment.sessionId,
      deliveryFee: deliveryInfo.deliveryFee,
      distance: deliveryInfo.distance,
      cartTotal: userCart.cartTotal,
      totalPriceWithDelivery: totalPriceWithDelivery,
      deliveryType: deliveryInfo.deliveryType,
      calculation: deliveryInfo.calculation
    });
  } catch (error) {
    console.error('Error in processNewCheckoutSession:', error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message,
    });
  }
};

// Helper function for cash payments
const processCashOrder = async ({ orderId, user, userCart, address, comment, deliveryDate, deliveryTime, res }) => {
  const NotificationService = require('./notificationService');

  try {
    // Calculate delivery fee
    const deliveryInfo = await calculateDeliveryForOrder(address, user._id);
    const totalPriceWithDelivery = userCart.cartTotal + deliveryInfo.deliveryFee;

    const newOrder = await createNewOrder(
      orderId,
      userCart.products,
      "cash",
      userCart.cartTotal,
      totalPriceWithDelivery,
      user._id,
      "Processing",
      address,
      comment,
      deliveryDate,
      deliveryTime,
      deliveryInfo.deliveryFee,
      deliveryInfo.distance,
      deliveryInfo.deliveryType
    );

    // Send admin notification for new cash order
    await NotificationService.sendOrderNotificationToAdmin(newOrder, user);

    user.orderCount += 1;
    user.totalSpend += totalPriceWithDelivery;
    await user.save();

    await updateProductStock(userCart.products);
    await Cart.deleteOne({ orderBy: user._id });

    return res.json({ 
      message: "Order created successfully",
      orderId: orderId,
      deliveryFee: deliveryInfo.deliveryFee,
      distance: deliveryInfo.distance,
      cartTotal: userCart.cartTotal,
      totalPriceWithDelivery: totalPriceWithDelivery,
      deliveryType: deliveryInfo.deliveryType,
      calculation: deliveryInfo.calculation
    });
  } catch (error) {
    console.error('Error in processCashOrder:', error);
    return res.status(500).json({
      error: "Failed to process cash order",
      details: error.message,
    });
  }
};

// Helper function for card payments
const processCardOrder = async ({ orderId, user, userCart, cardId, address, comment, deliveryDate, deliveryTime, res }) => {
  try {
    if (cardId) {
      return await processSavedCardPayment({
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
    }

    return await processNewCheckoutSession({
      orderId,
      user,
      userCart,
      address,
      comment,
      deliveryDate,
      deliveryTime,
      res
    });

  } catch (error) {
    console.error('Error in processCardOrder:', error);
    return res.status(500).json({
      error: "Failed to process card order",
      details: error.message,
    });
  }
};

// Create new order helper (updated with delivery fields)
const createNewOrder = async (
  orderId,
  products,
  paymentMethod,
  totalPrice,
  totalPriceWithDelivery,
  userId,
  orderStatus,
  address,
  comment,
  deliveryDate,
  deliveryTime,
  deliveryFee = 0,
  deliveryDistance = 0,
  deliveryType = 'delivery',
  reference = null
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
    totalPriceWithDelivery,
    orderBy: userId,
    orderStatus,
    address,
    comment,
    deliveryDate,
    deliveryTime,
    deliveryFee,
    deliveryDistance,
    deliveryType,
    reference,
  }).save();
};

// Update product stock helper
const updateProductStock = async (products) => {
  const updateOperations = products.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $inc: { stock: -item.count, sold: +item.count } },
    },
  }));

  await Product.bulkWrite(updateOperations, {});
};

// Process Stripe webhook
const processStripeWebhook = async (event) => {
  const NotificationService = require('./notificationService');

  switch (event.type) {
    case 'checkout.session.completed':
      return await handleCheckoutSessionCompleted(event.data.object);

    case 'payment_intent.succeeded':
      return await handlePaymentIntentSucceeded(event.data.object);

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

// Handle checkout session completed
const handleCheckoutSessionCompleted = async (session) => {
  const NotificationService = require('./notificationService');

  try {
    const order = await Order.findOne({ reference: session.id }).populate('orderBy');
    if (order) {
      // Update order status to Processing and mark as paid
      if (order.orderStatus === 'Pending') {
        const updatedOrder = await Order.findByIdAndUpdate(
          { _id: order._id },
          {
            orderStatus: 'Processing',
            isPaid: true,
            paidAt: new Date(),
          },
          { new: true }
        ).populate('orderBy');

        // Update user total spend
        await User.findByIdAndUpdate(order.orderBy, {
          $inc: { totalSpend: order.totalPriceWithDelivery }
        });

        // Send admin notification for new order
        await NotificationService.sendOrderNotificationToAdmin(updatedOrder, order.orderBy);

        const userCart = await Cart.findOne({ orderBy: order.orderBy });
        if (userCart) {
          await updateProductStock(userCart.products);
          await Cart.deleteOne({ orderBy: order.orderBy });
        } else {
          console.log('Skipping stock update - order already processed:', order.orderStatus);
        }
      }
    }

    // Handle card saving logic (your existing code)
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        const paymentMethodId = paymentIntent.payment_method;

        if (paymentMethodId) {
          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
          let userId = null;
          if (session.metadata && session.metadata.userId) {
            userId = session.metadata.userId;
          } else {
            const order = await Order.findOne({ reference: session.id });
            if (order) {
              userId = order.orderBy;
              console.log('Using userId from order:', userId);
            }
          }

          if (userId) {
            const existingCard = await Card.findOne({
              paymentMethodId: paymentMethodId,
              owner: userId,
            });

            if (!existingCard) {
              if (session.customer) {
                await stripe.paymentMethods.attach(paymentMethodId, {
                  customer: session.customer,
                });
                console.log('Payment method attached to customer:', session.customer);
              }

              // Create the card with proper validation
              const newCard = await Card.create({
                paymentMethodId: paymentMethodId,
                customerId: session.customer,
                last4: paymentMethod.card.last4,
                brand: paymentMethod.card.brand,
                expMonth: paymentMethod.card.exp_month,
                expYear: paymentMethod.card.exp_year,
                owner: userId,
              });
              console.log('Card created successfully:', newCard._id);
            } else {
              console.log('Card already exists for this payment method and user');
            }
          } else {
            console.log('Cannot create card - no userId found in metadata or order');
          }
        }
      } catch (error) {
        console.error('Error retrieving payment method:', error.message);
        console.error('Error details:', error);
      }
    } else {
      console.log('Skipping card creation - no payment_intent in session');
    }
  } catch (error) {
    console.error('Error processing checkout session:', error);
    throw error;
  }
};

// Handle payment intent succeeded
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const NotificationService = require('./notificationService');

  try {
    const order = await Order.findOne({ reference: paymentIntent.id }).populate('orderBy');
    if (order) {
      if (order.orderStatus === 'Pending') {
        const updatedOrder = await Order.findByIdAndUpdate(
          { _id: order._id },
          {
            orderStatus: 'Processing', 
            isPaid: true,
            paidAt: new Date(),
          },
          { new: true }
        ).populate('orderBy');

        // Update user total spend
        await User.findByIdAndUpdate(order.orderBy, {
          $inc: { totalSpend: order.totalPriceWithDelivery }
        });

        // Send admin notification for new order
        await NotificationService.sendOrderNotificationToAdmin(updatedOrder, order.orderBy);

        const userCart = await Cart.findOne({ orderBy: order.orderBy });
        if (userCart) {
          await updateProductStock(userCart.products);
          await Cart.deleteOne({ orderBy: order.orderBy });
        } else {
          console.log('Skipping stock update - order already processed:', order.orderStatus);
        }
      }
    }
  } catch (error) {
    console.error('Error processing payment intent:', error);
    throw error;
  }
};

module.exports = {
  getOrCreateStripeCustomer,
  initializeStripeCheckout,
  initializeStripePaymentWithSavedCard,
  processSavedCardPayment,
  processNewCheckoutSession,
  processCashOrder,
  processCardOrder,
  createNewOrder,
  updateProductStock,
  processStripeWebhook,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  calculateDeliveryForOrder
};