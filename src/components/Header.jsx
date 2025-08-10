import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiCog } from "react-icons/bi";
import ConfirmBox from "../components/ConfirmBox";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/components/Header.css";
import logo from "../../public/logo.png";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    setShowDropdown(false);
    setShowLogoutConfirm(false);
    toast.success("Đăng xuất thành công"); // Thêm toast thông báo
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
    <div>
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
                  {isLoggedIn ? (
                    <>
                      <div className="dropdown-item" onClick={handleManage}>
                        Quản lý
                      </div>
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
