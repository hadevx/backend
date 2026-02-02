const nodemailer = require("nodemailer");
const User = require("../models/userModel");

// Create a transporter object with SMTP server details
const transporter = nodemailer.createTransport({
  service: "gmail", // or use your SMTP service provider
  auth: {
    user: process.env.CUSTOMER_SERVICE_EMAIL, // Your email address (environment variable)
    pass: process.env.CUSTOMER_SERVICE_PASS, // Your email password (environment variable)
  },
});

// Function to send email
const sendOrderEmail = async (orderDetails) => {
  const user = await User.findById(orderDetails.user);

  const mailOptions = {
    from: process.env.CUSTOMER_SERVICE_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: "📦 New Order Received",
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      
      <h2 style="margin-bottom: 5px;">📦 New Order Received</h2>
      <p style="margin-top: 0;">You have received a new order. Details are below.</p>

      <hr />

      <h3>🧾 Order Details</h3>
      <p><strong>Order ID:</strong> ${orderDetails?._id}</p>
      <p><strong>Total Amount:</strong> ${orderDetails.totalPrice.toFixed(3)} KD</p>

      <hr />

      <h3>👤 Customer Information</h3>
      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>

      <hr />

      <h3>📍 Shipping Address</h3>
      <p>
        ${orderDetails.shippingAddress.governorate},<br/>
        ${orderDetails.shippingAddress.city},<br/>
        Block ${orderDetails.shippingAddress.block}, Street ${orderDetails.shippingAddress.street},<br/>
        House ${orderDetails.shippingAddress.house}
      </p>

      <hr />

      <h3>🛒 Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #f4f4f4;">
            <th style="border: 1px solid #ccc; padding: 8px;">Product</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Qty</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Price</th>
            <th style="border: 1px solid #ccc; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.orderItems
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${item.qty}</td>
              <td style="border: 1px solid #ccc; padding: 8px;">${item.price.toFixed(3)} KD</td>
              <td style="border: 1px solid #ccc; padding: 8px;">
                ${(item.price * item.qty).toFixed(3)} KD
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <br />

      <p style="font-size: 12px; color: #777;">
        This is an automated notification from your store system.
      </p>

    </div>
  `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendRestPasswordEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CUSTOMER_SERVICE_EMAIL,
      pass: process.env.CUSTOMER_SERVICE_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.CUSTOMER_SERVICE_EMAIL,
    to,
    subject,
    text,
  });
};
module.exports = { sendOrderEmail, sendRestPasswordEmail };
