import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const useAuthCheck = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkUserRole = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage");
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      // Kiểm tra token hết hạn
      const expiresAt = localStorage.getItem("token_expires_at");
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        console.log("Token expired at:", new Date(parseInt(expiresAt)));
        localStorage.removeItem("token");
        localStorage.removeItem("token_expires_at");
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Lấy thông tin người dùng từ Supabase auth endpoint
      const authResponse = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
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

      // Truy vấn vai trò từ bảng users
      const userResponse = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/users?userid=eq.${userId}&select=role`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
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
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      checkUserRole();
    }
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const resetAuth = () => {
    setUserRole(null);
    setIsLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
  };

  return { userRole, isLoading, resetAuth };
};

export default useAuthCheck;
