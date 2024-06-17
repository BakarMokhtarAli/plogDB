import nodemailer from "nodemailer";

const sendVerificationEmail = async (userEmail, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Email Verification",
    html: `<p>Your verification code is: <b>${verificationCode}</b></p><p>This code will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
export default sendVerificationEmail;
