const { Resend } = require('resend');

// Initialize the Resend client safely (uses a dummy key for testing/dev environments to prevent crash at startup)
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_testing');

const sendOrderConfirmationEmail = async (order) => {
  try {
    // Graceful check for tests or missing configurations
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ Resend: RESEND_API_KEY is not configured in environment variables. Skipping email dispatch.');
      return;
    }

    const { customerName, email, phone, productName, quantity, couponCode, discountApplied, totalPrice, priceAtOrder, notes } = order;

    const formattedDiscount = discountApplied && discountApplied > 0 ? `ZK ${discountApplied.toFixed(2)}` : 'None';
    const formattedTotal = totalPrice !== null && totalPrice !== undefined ? `ZK ${totalPrice.toFixed(2)}` : 'TBD';

    const adminEmail = process.env.ADMIN_EMAIL || 'divinemanenaturals@gmail.com';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Divine Mane Naturals <onboarding@resend.dev>';

    let recipient = email;
    let bccRecipient = adminEmail;
    let sandboxWarningHtml = '';

    // Smart sandbox routing: Resend sandbox (onboarding@resend.dev) restricts delivery ONLY to the owner's registered address.
    // If we detect sandbox mode, we redirect to the admin email so tests and local order completions succeed without Resend API errors.
    if (fromEmail.includes('onboarding@resend.dev')) {
      recipient = adminEmail;
      bccRecipient = undefined; // No need to BCC if we are sending directly to the admin
      sandboxWarningHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 25px; color: #b45309; font-size: 13px; line-height: 1.5;">
          <strong>Sandbox Preview Mode:</strong> This email was redirected to the admin address (<strong>${adminEmail}</strong>) because Resend is currently in sandbox mode. Once you verify your domain (e.g. <em>divinemanenaturals.com</em>) and update the <strong>RESEND_FROM_EMAIL</strong> env variable, emails will be delivered directly to customers (<strong>${email}</strong>) and BCC'd to you.
        </div>
      `;
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 40px 20px; color: #1c2826; line-height: 1.6;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #1b4d3e12; box-shadow: 0 8px 30px rgba(27, 77, 62, 0.04);">
          <!-- Header Banner -->
          <div style="background-color: #1b4d3e; color: #ffffff; padding: 35px 40px; text-align: center;">
            <h1 style="margin: 0; font-family: serif; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Divine Mane</h1>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #c5a059; font-weight: bold; display: block; margin-top: 5px;">Naturals</span>
          </div>

          <!-- Body -->
          <div style="padding: 40px 35px;">
            ${sandboxWarningHtml}

            <h2 style="font-family: serif; color: #1b4d3e; margin-top: 0; font-size: 22px; font-weight: bold; text-align: center; margin-bottom: 25px;">Order Confirmation Invoice</h2>
            <p style="font-size: 14px; color: #1c2826b3; margin-bottom: 20px;">Dear <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; color: #1c2826b3; margin-bottom: 25px; line-height: 1.6;">Thank you for your order! We have received your order details on our platform. Below you will find your invoice and order summary. Our team will contact you shortly to confirm delivery.</p>

            <!-- Customer & Order Meta -->
            <div style="background-color: #faf9f6; border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #1b4d3e08;">
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1b4d3e;">Customer Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 4px 0; color: #1c282680; width: 35%;">Name:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #1c2826;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #1c282680;">Phone:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #1c2826;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #1c282680;">Email:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #1c2826; text-transform: lowercase;">${email}</td>
                </tr>
                ${order._id ? `
                <tr>
                  <td style="padding: 4px 0; color: #1c282680;">Order ID:</td>
                  <td style="padding: 4px 0; font-family: monospace; font-size: 12px; color: #1c2826;">${order._id}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Itemized Receipt -->
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1b4d3e;">Order Summary</h3>
            <div style="border: 1px solid #1b4d3e10; border-radius: 16px; overflow: hidden; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                  <tr style="background-color: #1b4d3e08; border-bottom: 1px solid #1b4d3e10;">
                    <th style="padding: 12px 16px; color: #1b4d3e; font-weight: bold;">Items</th>
                    <th style="padding: 12px 16px; color: #1b4d3e; font-weight: bold; text-align: center; width: 15%;">Qty</th>
                    <th style="padding: 12px 16px; color: #1b4d3e; font-weight: bold; text-align: right; width: 30%;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #1b4d3e08;">
                    <td style="padding: 16px; font-weight: 600; color: #1c2826;">${productName}</td>
                    <td style="padding: 16px; text-align: center; color: #1c2826cc;">${quantity}</td>
                    <td style="padding: 16px; text-align: right; color: #1c2826cc;">ZK ${(priceAtOrder || 0).toFixed(2)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #1b4d3e08;">
                    <td colspan="2" style="padding: 10px 16px 5px 16px; color: #1c282680; text-align: right;">Subtotal:</td>
                    <td style="padding: 10px 16px 5px 16px; text-align: right; color: #1c2826;">ZK ${(priceAtOrder * quantity).toFixed(2)}</td>
                  </tr>
                  ${couponCode ? `
                  <tr style="border-bottom: 1px solid #1b4d3e08;">
                    <td colspan="2" style="padding: 5px 16px; color: #1c282680; text-align: right;">Coupon (${couponCode.toUpperCase()}):</td>
                    <td style="padding: 5px 16px; text-align: right; color: #16a34a; font-weight: 600;">-ZK ${(discountApplied || 0).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr style="background-color: #1b4d3e04;">
                    <td colspan="2" style="padding: 16px; color: #1b4d3e; font-weight: bold; font-size: 15px; text-align: right;">Estimated Total:</td>
                    <td style="padding: 16px; color: #1b4d3e; font-weight: bold; font-size: 18px; text-align: right;">${formattedTotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Special Notes -->
            ${notes ? `
            <div style="background-color: #faf9f6; border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #1b4d3e08;">
              <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #1b4d3e;">Special Delivery Notes</h3>
              <p style="margin: 0; font-size: 14px; color: #1c2826cc; font-style: italic; line-height: 1.5;">"${notes}"</p>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background-color: #1b4d3e05; border-left: 4px solid #c5a059; padding: 22px; border-radius: 4px 16px 16px 4px; margin-bottom: 25px;">
              <h4 style="margin: 0 0 6px 0; color: #1b4d3e; font-size: 15px; font-weight: bold;">Cash on Delivery Confirmation</h4>
              <p style="margin: 0; font-size: 13px; color: #1c2826a6; line-height: 1.5;">
                Please note that your order status is currently pending. An administrator will call or text you at <strong>${phone}</strong> shortly to confirm shipping rates, delivery slot, and complete your purchase.
              </p>
            </div>

            <p style="font-size: 13px; color: #1c282680; text-align: center; margin-top: 30px; margin-bottom: 0;">
              If you have any questions, reply directly to this email or reach us at 
              <a href="mailto:divinemanenaturals@gmail.com" style="color: #c5a059; text-decoration: none; font-weight: bold;">divinemanenaturals@gmail.com</a>.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #1b4d3e08; padding: 25px; text-align: center; font-size: 11px; color: #1c282680; border-top: 1px solid #1b4d3e0f;">
            <p style="margin: 0; font-weight: 600;">&copy; ${new Date().getFullYear()} Divine Mane Naturals. All Rights Reserved.</p>
            <p style="margin: 6px 0 0 0; color: #1c282660;">89 New Location, Chisamba Town, Zambia</p>
          </div>
        </div>
      </div>
    `;

    // Prepare dispatch options
    const mailOptions = {
      from: fromEmail,
      to: recipient,
      subject: `Order Confirmation - ${productName}`,
      html: htmlContent,
    };

    if (bccRecipient) {
      mailOptions.bcc = bccRecipient;
    }

    // Dispatch email via Resend HTTP API
    const { data, error } = await resend.emails.send(mailOptions);

    if (error) {
      console.error('❌ Failed to send order confirmation email via Resend API:', error);
    } else {
      console.log('✅ Email sent successfully via Resend API. ID:', data.id);
    }
  } catch (error) {
    // Non-blocking try-catch blocks: ensures order succeeds even if email integration experiences network/API errors.
    console.error('❌ Failed to send order confirmation email:', error);
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
