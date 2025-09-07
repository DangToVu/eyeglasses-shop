import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiCog } from "react-icons/bi";
import ConfirmBox from "../components/ConfirmBox";
import LoadingScreen from "../components/LoadingScreen";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import { toast } from "react-toastify";
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

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires_at");
    resetAuth(); // Đặt lại userRole và isLoading
    setShowDropdown(false);
    setShowLogoutConfirm(false);
    navigate("/");
    toast.success("Đăng xuất thành công");
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
            <div
              className="header-icon-wrapper"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <BiCog className="header-icon" />
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link
                    to="/products/all"
                    className="dropdown-item"
                    onClick={handleAllProducts}
                  >
                    Tất cả sản phẩm
                  </Link>
                  {userRole ? (
                    <>
                      {userRole === "admin" && (
                        <div className="dropdown-item" onClick={handleManage}>
                          Quản lý
                        </div>
                      )}
                      <div
                        className="dropdown-item-logout"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </div>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="dropdown-item"
                      onClick={handleLogin}
                    >
                      Đăng nhập
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
