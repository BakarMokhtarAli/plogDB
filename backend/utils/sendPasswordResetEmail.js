// utils/email.js
import nodemailer from "nodemailer";

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `http://localhost:5173/api/v1/users/reset-password/${resetToken}`;
  //   const resetURL = `https://your-frontend-service.onrender.com/reset-password/${resetToken}`;

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
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${resetURL}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Recovery email sent");
  } catch (err) {
    console.error("There was an error sending the email: ", err);
  }
};

export default sendPasswordResetEmail;
