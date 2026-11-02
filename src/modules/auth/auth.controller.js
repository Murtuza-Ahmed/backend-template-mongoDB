import { HTTP } from "#src/utils/httpStatus.js";
import { setAuthCookies, clearAuthCookies } from "#src/utils/cookies.js";
import * as authService from "#src/modules/auth/auth.service.js";

// Controllers stay thin: validate → service → respond. No business logic here.
const withTokens = (res, status, { user, accessToken, refreshToken, message }) => {
  setAuthCookies(res, { accessToken, refreshToken });
  res.status(status).json({ success: true, ...(message ? { message } : {}), user, accessToken });
};

export const signup = async (req, res) => {
  const result = await authService.signup(req.body);
  res.status(HTTP.CREATED).json({ success: true, ...result });
};

export const verifyEmail = async (req, res) => {
  const result = await authService.verifyEmail(req.body);
  withTokens(res, HTTP.OK, { ...result, message: "Email verified — welcome!" });
};

export const signin = async (req, res) => {
  const result = await authService.signin(req.body);
  withTokens(res, HTTP.OK, { ...result, message: "Signed in" });
};

export const google = async (req, res) => {
  const result = await authService.googleSignin(req.body);
  withTokens(res, HTTP.OK, { ...result, message: "Signed in with Google" });
};

export const refresh = async (req, res) => {
  const result = await authService.refresh(req.cookies?.refreshToken);
  withTokens(res, HTTP.OK, result);
};

export const logout = async (req, res) => {
  await authService.logout(req.user._id);
  clearAuthCookies(res);
  res.status(HTTP.OK).json({ success: true, message: "Signed out" });
};

export const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const forgotEmail = async (req, res) => {
  const result = await authService.forgotEmailRequest(req.body);
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const recoverEmail = async (req, res) => {
  const result = await authService.recoverEmail(req.body);
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const changePassword = async (req, res) => {
  const result = await authService.changePassword(req.user._id, req.body);
  clearAuthCookies(res); // other sessions are dead — this one re-logs in
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const requestEmailChange = async (req, res) => {
  const result = await authService.requestEmailChange(req.user._id, req.body);
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const confirmEmailChange = async (req, res) => {
  const result = await authService.confirmEmailChange(req.user._id, req.body);
  clearAuthCookies(res);
  res.status(HTTP.OK).json({ success: true, ...result });
};
