import { sendEmail } from "#hooks/sendEmail.js";
import { asyncHandler } from "#middlewares/asyncHandler.js";
import User from "#models/Users.js";
import ErrorHandler from "#utils/errorHandler.js";
import { HTTP_STATUS } from "#utils/statusCodes.js";

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: email,
    accountVerified: true
  })

  if (!user) {
    return next(new ErrorHandler("User not found", HTTP_STATUS.NOT_FOUND))
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

  try {
    await sendEmail({
      email: user?.email,
      subject: "MERN AUTHENTICATION APP RESET PASSWORD",
      message
    })
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Email sent successfully."
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error?.message ? error.message : "cannot send reset password", HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
})