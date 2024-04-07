// Email

// Notifications

// OTP
export const GenerateOTP = () => {
  // 6 digits otp
  const otp = Math.floor(100000 + Math.random() * 900000);

  let expiry = new Date();
  // 30 min expiry to otp
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const OnRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "";
  const authToken = "";
  const client = require("twilio")(accountSid, authToken);

  const resposne = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+923143227662",
    to: toPhoneNumber,
  });

  return resposne;
};

// Payment Notification OR Email
