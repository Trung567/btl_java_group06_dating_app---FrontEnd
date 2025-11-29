// src/api.js
// MOCK API – chỉ dùng để test FE, KHÔNG gọi backend thật

// "CSDL giả" lưu ngay trên FE
const fakeUsers = [];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Đăng ký
export async function registerUser({ email, password, fullName, address }) {
  await delay(500); // giả lập gọi API

  if (!email || !password) {
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  const exists = fakeUsers.find((u) => u.email === email);
  if (exists) {
    const err = new Error("Email đã tồn tại (mock)");
    err.status = 400;
    throw err;
  }

  const user = {
    id: Date.now().toString(),
    email,
    password,
    fullName,
    address,
  };
  fakeUsers.push(user);

  return {
    message: "Đăng ký thành công (mock)",
    user,
  };
}

// Đăng nhập
export async function loginUser({ email, password }) {
  await delay(400); // giả lập gọi API

  if (!email || !password) {
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  const user = fakeUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    const err = new Error("Sai email hoặc mật khẩu (mock)");
    err.status = 401;
    throw err;
  }

  return {
    message: "Đăng nhập thành công (mock)",
    accessToken: "fake-jwt-token-" + user.id,
    user,
  };
}

// Cho trường hợp import default: import api from './api';
const api = { registerUser, loginUser };
export default api;
