const sendEmail = require("../controllers/emailContoller");

class NotificationService {
  static async sendOrderNotificationToAdmin(order, user) {
    try {
      const emailData = {
        to: process.env.ADMIN_EMAIL,
        subject: `🛒 New Order Received - #${order.orderId}`,
        text: `New order from ${user.fullName}`,
        htmt: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order Notification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #E3364E 0%, #c62d47 100%); padding: 30px 20px; text-align: center;">
                <div style="background-color: white; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                  <span style="font-size: 24px; font-weight: bold; color: #E3364E;">🛒</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Order Received!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Order #${
                  order.orderId
                }</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                  <h2 style="color: #2c3e50; margin: 0 0 20px; font-size: 18px; font-weight: 600;">Customer Details</h2>
                  <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-weight: 500;">Customer:</span>
                      <span style="color: #2c3e50; font-weight: 600;">${
                        user.fullName
                      }</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-weight: 500;">Email:</span>
                      <span style="color: #2c3e50; font-weight: 600;">${
                        user.email
                      }</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-weight: 500;">Payment Method:</span>
                      <span style="color: #2c3e50; font-weight: 600; text-transform: capitalize;">${
                        order.paymentMethod
                      }</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                      <span style="color: #6c757d; font-weight: 500;">Status:</span>
                      <span style="background-color: #E3364E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${
                        order.orderStatus
                      }</span>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; background-color: #E3364E; color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 10px; font-size: 16px;">Total Amount</h3>
                  <div style="font-size: 32px; font-weight: 700;">€${order.totalPrice.toLocaleString()}</div>
                </div>
                
                <div style="text-align: center;">
                  <p style="color: #6c757d; margin: 0 0 20px; line-height: 1.6;">Please review and process this order as soon as possible.</p>
                  <a href="#" style="display: inline-block; background-color: #E3364E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">View Order Details</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <img src="https://res.cloudinary.com/dw7khzaml/image/upload/v1759145462/kaka_jgrgqz.png" alt="Logo" style="width: 200px; height: auto;margin-top: 15px; object-fit: contain;" />
                <p style="color: #6c757d; margin: 0; font-size: 14px;">© 2024 Grocery Store. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
      await sendEmail(emailData);
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }
  }

  static async sendOrderStatusUpdateToCustomer(order, newStatus) {
    try {
      const statusMessages = {
        Processing: {
          subject: "✅ Order Confirmed - We're preparing your items!",
          message:
            "Great news! Your order has been confirmed and we're now preparing your items for delivery.",
          icon: "📦",
          color: "#2196F3",
        },
        Dispatched: {
          subject: "🚚 Order Dispatched - On the way to you!",
          message:
            "Your order is now on its way! Our delivery team will contact you shortly.",
          icon: "🚚",
          color: "#9C27B0",
        },
        Delivered: {
          subject: "🎉 Order Delivered - Thank you for shopping with us!",
          message:
            "Your order has been successfully delivered. We hope you enjoy your purchase!",
          icon: "✅",
          color: "#4CAF50",
        },
        Cancelled: {
          subject: "❌ Order Cancelled",
          message:
            "Your order has been cancelled. If you have any questions, please contact our support team.",
          icon: "❌",
          color: "#F44336",
        },
      };

      const statusInfo = statusMessages[newStatus];
      if (statusInfo && order.orderBy?.email) {
        const emailData = {
          to: order.orderBy.email,
          subject: statusInfo.subject,
          text: statusInfo.message,
          htmt: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Update</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background: padding: 30px 20px; text-align: center;">
                  <div style="background-color: white; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <img src="https://res.cloudinary.com/dw7khzaml/image/upload/v1759145462/kaka_jgrgqz.png" alt="Logo" style="width: 200px; height: auto; object-fit: contain;" />
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Order Update</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Hi ${
                    order.orderBy.fullName
                  }!</p>
                </div>
                
                <!-- Status Banner -->
                <div style="background-color: ${
                  statusInfo.color
                }; color: white; padding: 20px; text-align: center;">
                  <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${newStatus}</div>
                  <div style="font-size: 14px; opacity: 0.9;">Order #${
                    order.orderId
                  }</div>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
                    <h2 style="color: #2c3e50; margin: 0 0 15px; font-size: 20px; font-weight: 600;">Order Status Update</h2>
                    <p style="color: #6c757d; margin: 0; line-height: 1.6; font-size: 16px;">${
                      statusInfo.message
                    }</p>
                  </div>
                  
                  <!-- Order Summary -->
                  <div style="border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                    <div style="background-color: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
                      <h3 style="margin: 0; color: #2c3e50; font-size: 16px; font-weight: 600;">Order Summary</h3>
                    </div>
                    <div style="padding: 20px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #6c757d; font-weight: 500;">Order ID:</span>
                        <span style="color: #2c3e50; font-weight: 600; font-family: monospace;">#${
                          order.orderId
                        }</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: #6c757d; font-weight: 500;">Status:</span>
                        <span style="background-color: ${
                          statusInfo.color
                        }; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${newStatus}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #e9ecef;">
                        <span style="color: #6c757d; font-weight: 500;">Total Amount:</span>
                        <span style="color: #E3364E; font-weight: 700; font-size: 18px;">€${order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div>
                    <a href="#" style="display: block; width: 100%; background-color: #E3364E; color: white; padding: 12px 0; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; box-sizing: border-box;">Track Order</a>
                    <a href="#" style="display: block; width: 100%; margin-top: 15px; background-color: transparent; color: #E3364E; padding: 12px 0; text-decoration: none; border: 2px solid #E3364E; border-radius: 8px; font-weight: 600; text-align: center; box-sizing: border-box;">Contact Support</a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
                 <img src="https://res.cloudinary.com/dw7khzaml/image/upload/v1759145462/kaka_jgrgqz.png" alt="Logo" style="width: 200px; height: auto; margin-top: 15px; object-fit: contain;" />
                  <p style="color: #2c3e50; margin: 0 0 15px; font-size: 16px; font-weight: 600;">Thank you for choosing us! 🙏</p>
                  <p style="color: #6c757d; margin: 0 0 20px; font-size: 14px; line-height: 1.6;">We appreciate your business and hope you love your purchase. If you have any questions, our support team is here to help.</p>
                  <div style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                    <p style="color: #6c757d; margin: 0; font-size: 12px;">© 2024 Grocery Store. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        await sendEmail(emailData);
      }
    } catch (error) {
      console.error("Failed to send customer notification:", error);
    }
  }
}

module.exports = NotificationService;
