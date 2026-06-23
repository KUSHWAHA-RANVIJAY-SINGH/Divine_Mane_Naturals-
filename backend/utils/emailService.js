const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (order) => {
  try {
    let transporter;

    // Use SMTP environment variables if set, otherwise fallback to auto Ethereal test accounts
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('📧 NodeMailer: Using custom SMTP configuration.');
    } else {
      // Create mock transporter using Ethereal test credentials
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 NodeMailer: Using auto-generated Ethereal test SMTP account.');
    }

    const { customerName, email, phone, productName, quantity, couponCode, discountApplied, totalPrice } = order;

    const formattedDiscount = discountApplied && discountApplied > 0 ? `ZK ${discountApplied.toFixed(2)}` : 'None';
    const formattedTotal = totalPrice !== null && totalPrice !== undefined ? `ZK ${totalPrice.toFixed(2)}` : 'TBD';

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 40px 20px; color: #1c2826; line-height: 1.6;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #1b4d3e1a; box-shadow: 0 4px 15px rgba(27, 77, 62, 0.05);">
          <!-- Header Banner -->
          <div style="background-color: #1b4d3e; color: #ffffff; padding: 30px 40px; text-align: center;">
            <h1 style="margin: 0; font-family: serif; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Divine Mane</h1>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c5a059; font-weight: bold; display: block; margin-top: 5px;">Naturals</span>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <h2 style="font-family: serif; color: #1b4d3e; margin-top: 0; font-size: 22px;">Order Received!</h2>
            <p style="font-size: 14px; color: #1c2826cc;">Hi <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; color: #1c2826cc;">Thank you for shopping with us! We have received your order details on our store platform. Here is a summary of your pending order:</p>

            <!-- Order Table -->
            <div style="margin: 30px 0; border: 1px solid #1b4d3e1a; border-radius: 12px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <tr style="background-color: #1b4d3e08; border-bottom: 1px solid #1b4d3e1a;">
                  <th style="padding: 12px 16px; color: #1b4d3e; font-weight: bold;">Details</th>
                  <th style="padding: 12px 16px; color: #1b4d3e; font-weight: bold; text-align: right;">Value</th>
                </tr>
                <tr style="border-bottom: 1px solid #1b4d3e08;">
                  <td style="padding: 12px 16px; color: #1c2826b3;">Product</td>
                  <td style="padding: 12px 16px; font-weight: bold; text-align: right;">${productName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1b4d3e08;">
                  <td style="padding: 12px 16px; color: #1c2826b3;">Quantity</td>
                  <td style="padding: 12px 16px; font-weight: bold; text-align: right;">${quantity}</td>
                </tr>
                ${couponCode ? `
                <tr style="border-bottom: 1px solid #1b4d3e08;">
                  <td style="padding: 12px 16px; color: #1c2826b3;">Coupon Code</td>
                  <td style="padding: 12px 16px; font-weight: bold; text-align: right; text-transform: uppercase; color: #c5a059;">${couponCode}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1b4d3e08;">
                  <td style="padding: 12px 16px; color: #1c2826b3;">Discount Applied</td>
                  <td style="padding: 12px 16px; font-weight: bold; text-align: right; color: #16a34a;">-${formattedDiscount}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #1b4d3e05;">
                  <td style="padding: 16px; color: #1b4d3e; font-weight: bold; font-size: 15px;">Estimated Total</td>
                  <td style="padding: 16px; color: #1b4d3e; font-weight: bold; font-size: 16px; text-align: right;">${formattedTotal}</td>
                </tr>
              </table>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #faf9f6; border-left: 4px solid #c5a059; padding: 20px; border-radius: 4px 12px 12px 4px; margin-bottom: 30px;">
              <h4 style="margin: 0 0 8px 0; color: #1b4d3e; font-size: 15px; font-weight: bold;">Manual Order Confirmation</h4>
              <p style="margin: 0; font-size: 13px; color: #1c2826b3; line-height: 1.5;">
                We use a manual confirmation &amp; cash-on-delivery model. An administrator will call or text you at <strong>${phone}</strong> shortly to confirm shipping rates, delivery slot, and complete your purchase.
              </p>
            </div>

            <p style="font-size: 13px; color: #1c2826b3; margin-bottom: 0;">If you have any questions, feel free to reply directly to this email or reach out to us at <a href="mailto:divinemanenaturals@gmail.com" style="color: #c5a059; text-decoration: none; font-weight: bold;">divinemanenaturals@gmail.com</a>.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #1b4d3e0d; padding: 20px; text-align: center; font-size: 11px; color: #1c282680; border-top: 1px solid #1b4d3e10;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Divine Mane Naturals. All Rights Reserved.</p>
            <p style="margin: 5px 0 0 0;">89 New Location, Chisamba Town, Zambia</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Divine Mane Naturals" <${process.env.SMTP_USER || 'no-reply@divinemanenaturals.com'}>`,
      to: email,
      subject: `Order Confirmation - ${productName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    // For test accounts, print Ethereal URL preview
    if (!process.env.SMTP_USER) {
      console.log('🔗 Ethereal Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
