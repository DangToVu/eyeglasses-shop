import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiCog } from "react-icons/bi";
import "../styles/Header.css";
import logo from "../../public/Logo.png";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // State để kiểm soát hiển thị header
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Scroll xuống và vượt quá 200px thì ẩn header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scroll lên thì hiện header
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener khi component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    setShowDropdown(false);
  };

  const handleManage = () => {
    navigate("/card-management"); // Điều hướng đến trang CardManagement
    setShowDropdown(false);
  };

  return (
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
                    onClick={() => setShowDropdown(false)}
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
  );
}

export default Header;
