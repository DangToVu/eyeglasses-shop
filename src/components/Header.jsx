import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BiCog,
  BiUser,
  BiShieldQuarter,
  BiHome,
  BiStore,
  BiWrench,
  BiLogIn,
  BiLogOut,
  BiHeart,
} from "react-icons/bi";
import ConfirmBox from "../components/ConfirmBox";
import LoadingScreen from "../components/LoadingScreen";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/Header.css";
import logo from "../../public/logo.png";

function Header() {
  const { userRole, isLoading, resetAuth } = useAuthCheck();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    const threshold = 5; // Khoảng cách cuộn tối thiểu để thay đổi trạng thái

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        if (Math.abs(currentScrollY - lastScrollY) > threshold) {
          if (currentScrollY < lastScrollY) {
            // Cuộn lên: hiện header
            setIsVisible(true);
          } else {
            // Cuộn xuống: ẩn header và đóng dropdown
            setIsVisible(false);
            setShowDropdown(false);
          }
          lastScrollY = currentScrollY;
        }
      }, 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/logout`,
          {},
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Logout request successful");
      }
    } catch (error) {
      console.error("Error signing out:", error.message, error.response?.data);
      // Continue with logout even if the API call fails, as the token will be cleared locally
    } finally {
      resetAuth(); // Clear state and localStorage
      setShowDropdown(false);
      setShowLogoutConfirm(false);
      navigate("/");
      toast.success("Đăng xuất thành công");
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleManage = () => {
    navigate("/card-management");
    setShowDropdown(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setShowDropdown(false);
  };

  const handleAllProducts = () => {
    navigate("/products/all");
    setShowDropdown(false);
  };

  const handleHome = () => {
    navigate("/");
    setShowDropdown(false);
  };

  const handleUserProfile = () => {
    if (userRole === "customer") {
      navigate("/user-profile");
    } else if (userRole === "admin") {
      navigate("/admin-profile");
    }
    setShowDropdown(false);
  };

  const handleFavoriteProducts = () => {
    if (!userRole) {
      toast.error("Vui lòng đăng nhập để truy cập sản phẩm ưu thích!");
    } else {
      navigate("/favorite-products");
    }
    setShowDropdown(false);
  };

  return (
    <div className="header-wrapper">
      {isLoading && <LoadingScreen />}
      {showLogoutConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn đăng xuất không?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
      <header className={`header ${isVisible ? "visible" : "hidden"}`}>
        <div className="header-container">
          <Link to="/" className="header-brand">
            <img src={logo} alt="Kính mắt Tuân Hồng" className="header-logo" />
          </Link>
          <div className="header-nav">
            {userRole && (
              <div
                className="header-user-icon-wrapper"
                onClick={handleUserProfile}
              >
                {userRole === "admin" ? (
                  <BiShieldQuarter className="header-user-icon" />
                ) : (
                  <BiUser className="header-user-icon" />
                )}
              </div>
            )}
            <div
              className="header-icon-wrapper"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <BiCog className="header-icon" />
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={handleHome}>
                    <BiHome className="dropdown-icon" /> Trang chủ
                  </div>
                  <Link
                    to="/products/all"
                    className="dropdown-item"
                    onClick={handleAllProducts}
                  >
                    <BiStore className="dropdown-icon" /> Tất cả sản phẩm
                  </Link>
                  <div
                    className="dropdown-item"
                    onClick={handleFavoriteProducts}
                  >
                    <BiHeart className="dropdown-icon" /> Sản phẩm ưu thích
                  </div>
                  {userRole ? (
                    <>
                      {userRole === "admin" && (
                        <div className="dropdown-item" onClick={handleManage}>
                          <BiWrench className="dropdown-icon" /> Quản lý
                        </div>
                      )}
                      <div
                        className="dropdown-item-logout"
                        onClick={handleLogout}
                      >
                        <BiLogOut className="dropdown-icon" /> Đăng xuất
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="dropdown-item"
                      onClick={handleLogin}
                    >
                      <BiLogIn className="dropdown-icon" /> Đăng nhập
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
