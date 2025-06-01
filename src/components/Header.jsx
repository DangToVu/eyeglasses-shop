import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiCog } from "react-icons/bi"; // Import biểu tượng bánh răng từ react-icons
import "../styles/Header.css"; // Import CSS

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State để toggle dropdown
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    setShowDropdown(false); // Đóng dropdown sau khi đăng xuất
  };

  const handleManage = () => {
    navigate("/admin");
    setShowDropdown(false); // Đóng dropdown sau khi vào trang quản lý
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <img
            src="/src/assets/logo.jpg"
            alt="Kính mắt Tuân Hồng"
            className="header-logo"
          />
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
                    <div className="dropdown-item" onClick={handleLogout}>
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
