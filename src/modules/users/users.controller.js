import { HTTP } from "#src/utils/httpStatus.js";
import * as usersService from "#src/modules/users/users.service.js";

export const getMe = async (req, res) => {
  const user = await usersService.getMe(req.user._id);
  res.status(HTTP.OK).json({ success: true, user });
};

export const updateMe = async (req, res) => {
  const user = await usersService.updateMe(req.user._id, req.body);
  res.status(HTTP.OK).json({ success: true, user });
};

export const listUsers = async (req, res) => {
  const result = await usersService.listUsers({
    page: Number(req.query.page) || 1,
    limit: Math.min(Number(req.query.limit) || 20, 100),
    search: req.query.search ?? "",
  });
  res.status(HTTP.OK).json({ success: true, ...result });
};

export const adminCreateUser = async (req, res) => {
  const user = await usersService.adminCreateUser(req.body);
  res.status(HTTP.CREATED).json({ success: true, user });
};

export const getUserById = async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.status(HTTP.OK).json({ success: true, user });
};

export const adminUpdateUser = async (req, res) => {
  const user = await usersService.adminUpdateUser(req.params.id, req.body, req.user._id);
  res.status(HTTP.OK).json({ success: true, user });
};

export const adminDeleteUser = async (req, res) => {
  const result = await usersService.adminDeleteUser(req.params.id, req.user._id);
  res.status(HTTP.OK).json({ success: true, ...result });
};
