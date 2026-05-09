const { Resend } = require("resend");
const dotenv = require("dotenv");
require("dotenv").config(); // Adjust the path as necessary
const resend = new Resend("re_PYy1p3Ff_JsoBuxWrTsQzbvMoCRnABuDV");
const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "SahamTrading <admin@sahamtradingplc.com>",
      to: sendTo,
      subject: subject,
      html: html,
    });
    if (error) {
      return console.error({ error });
    }
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
// export default sendEmail
module.exports = sendEmail;
