import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const useAuthCheck = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ["/", "/products/all", "/login", "/register"];

  const checkUserRole = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    if (!token && publicRoutes.includes(location.pathname)) {
      console.log("No token found, but on public route:", location.pathname);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    if (!token) {
      console.log("No token found in localStorage");
      setUserRole(null);
      setIsLoading(false);
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      const expiresAt = parseInt(localStorage.getItem("token_expires_at"));
      if (expiresAt && Date.now() > expiresAt) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          console.log("Token expired and no refresh token found");
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires_at");
          localStorage.removeItem("refresh_token");
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          setUserRole(null);
          setIsLoading(false);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login", { state: { from: location.pathname } });
          }
          return;
        }
        try {
          const refreshResponse = await axios.post(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/auth/v1/token?grant_type=refresh_token`,
            { refresh_token: refreshToken },
            {
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const { access_token, refresh_token, expires_in } =
            refreshResponse.data;
          localStorage.setItem("token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          localStorage.setItem(
            "token_expires_at",
            Date.now() + expires_in * 1000
          );
        } catch (refreshError) {
          console.error(
            "Failed to refresh token:",
            refreshError.response?.data || refreshError.message
          );
          toast.error(
            "Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires_at");
          localStorage.removeItem("refresh_token");
          setUserRole(null);
          setIsLoading(false);
          if (!publicRoutes.includes(location.pathname)) {
            navigate("/login", { state: { from: location.pathname } });
          }
          return;
        }
      }

      const authResponse = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userId = authResponse.data.id;
      if (!userId) {
        console.log("No userId in auth response:", authResponse.data);
        throw new Error("Không tìm thấy ID người dùng");
      }
      console.log("Authenticated userId:", userId);

      const userResponse = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/users?userid=eq.${userId}&select=role`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!userResponse.data || userResponse.data.length === 0) {
        throw new Error("Không tìm thấy thông tin vai trò trong bảng users");
      }

      const role = userResponse.data[0].role;
      if (!role || !["admin", "customer"].includes(role)) {
        console.log("Invalid role found:", role);
        throw new Error("Vai trò không hợp lệ");
      }

      setUserRole(role);
    } catch (error) {
      console.error(
        "Error in useAuthCheck:",
        error.message,
        error.response?.data
      );
      toast.error("Lỗi khi kiểm tra quyền: " + error.message);
      setUserRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");
      localStorage.removeItem("refresh_token");
      if (!publicRoutes.includes(location.pathname)) {
        navigate("/login", { state: { from: location.pathname } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [navigate, location.pathname]);

  const resetAuth = () => {
    setUserRole(null);
    setIsLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("refresh_token");
  };

  return { userRole, isLoading, resetAuth, checkUserRole };
};

export default useAuthCheck;
