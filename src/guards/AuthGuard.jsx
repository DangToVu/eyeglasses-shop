// guards/AuthGuard.jsx
import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const isAuthenticated = !!localStorage.getItem("token"); // Kiểm tra token trong localStorage

  // Nếu chưa đăng nhập, redirect về trang chủ hoặc trang login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập các route con
  return <Outlet />;
};

export default AuthGuard;