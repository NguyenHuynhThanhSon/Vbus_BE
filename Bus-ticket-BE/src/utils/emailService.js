const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác thực OTP - Hệ thống đặt vé xe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2b5876;">Mã xác thực OTP</h2>
          <p>Xin chào,</p>
          <p>Mã OTP của bạn là:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2b5876; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>Mã này có hiệu lực trong 10 phút.</p>
          <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendBookingConfirmation(email, bookingDetails) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Xác nhận đặt vé thành công',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2b5876;">Xác nhận đặt vé thành công</h2>
          <p>Mã đặt vé: <strong>${bookingDetails.bookingReference}</strong></p>
          <p>Tuyến: ${bookingDetails.routeName}</p>
          <p>Thời gian khởi hành: ${bookingDetails.departureTime}</p>
          <p>Số ghế: ${bookingDetails.numberOfSeats}</p>
          <p>Tổng tiền: ${bookingDetails.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();