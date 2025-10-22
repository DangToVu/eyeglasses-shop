import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Person, Lock } from "react-bootstrap-icons";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import YetiAnimation from "../components/YetiAnimation.jsx";
import "../styles/pages/Login.css";

function Login() {
  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi component mount
  }, []);

  const [email, setEmail] = useState(
    localStorage.getItem("savedUsername") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("savedUsername")
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [yetiProps, setYetiProps] = useState({
    check: false,
    handsUp: false,
    look: 0,
    triggerSuccess: false,
    triggerFail: false,
  });

  const calculateLook = (value) => {
    const nbChars = value ? value.length : 0;
    const ratio = nbChars / 41;
    return Math.round(ratio * 100 - 25);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setYetiProps((prev) => ({ ...prev, look: calculateLook(value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (showPassword) {
      setYetiProps((prev) => ({ ...prev, look: calculateLook(value) }));
    }
  };

  const handleTogglePassword = () => {
    const newShowState = !showPassword;
    setShowPassword(newShowState);
    setYetiProps((prev) => ({
      ...prev,
      handsUp: !newShowState,
      look: newShowState ? calculateLook(password) : 0,
    }));
  };

  const handleEmailFocus = () => {
    setYetiProps((prev) => ({
      ...prev,
      check: true,
      handsUp: false,
      look: calculateLook(email),
    }));
  };

  const handlePasswordFocus = () => {
    setYetiProps((prev) => ({
      ...prev,
      check: true,
      handsUp: !showPassword,
      look: showPassword ? calculateLook(password) : 0,
    }));
  };

  const handleInputBlur = () => {
    setYetiProps((prev) => ({
      ...prev,
      check: false,
      handsUp: false,
    }));
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem("savedUsername");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing token in localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");

      // Gọi API đăng nhập của Supabase với Axios
      const response = await axios.post(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/auth/v1/token?grant_type=password`,
        {
          email,
          password,
        },
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token, expires_at, user } = response.data;

      if (!access_token || !expires_at || !user) {
        throw new Error("Không nhận được thông tin phiên đăng nhập!");
      }

      // Lưu token và thời gian hết hạn vào localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("token_expires_at", expires_at * 1000);
      console.log("Logged in userId:", user.id); // Debug log

      // Xác minh token bằng cách gọi API get user
      const userResponse = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!userResponse.data) {
        throw new Error("Không thể xác thực phiên!");
      }

      if (rememberMe) {
        localStorage.setItem("savedUsername", email);
      } else {
        localStorage.removeItem("savedUsername");
      }

      toast.success("Đăng nhập thành công!");
      setYetiProps((prev) => ({
        ...prev,
        triggerSuccess: true,
        triggerFail: false,
      }));

      navigate("/");
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại!";
      if (error.response?.data?.error_description) {
        errorMessage += ` ${error.response.data.error_description}`;
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      console.error("Login error:", error.response?.data || error.message);
      toast.error(errorMessage);
      setYetiProps((prev) => ({
        ...prev,
        triggerFail: true,
        triggerSuccess: false,
      }));
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setYetiProps((prev) => ({
          ...prev,
          triggerSuccess: false,
          triggerFail: false,
        }));
      }, 2000);
    }
  };

  const handleSignupRedirect = () => {
    console.log("Navigating to /signup from", location.pathname);
    navigate("/signup");
  };

  return (
    <div className="login-page">
      <Header />
      <div className="lf-container">
        {isLoading && <LoadingScreen />}
        <Form onSubmit={handleSubmit} className="lf-form">
          <h3 className="lf-title">Đăng nhập</h3>
          <YetiAnimation
            check={yetiProps.check}
            handsUp={yetiProps.handsUp}
            look={yetiProps.look}
            triggerSuccess={yetiProps.triggerSuccess}
            triggerFail={yetiProps.triggerFail}
          />
          <Form.Group className="lf-form-group">
            <Form.Label>Email</Form.Label>
            <div className="lf-input-icon">
              <Person className="lf-icon lf-user-icon" />
              <Form.Control
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={handleEmailFocus}
                onBlur={handleInputBlur}
                required
                className="lf-form-input"
                placeholder="Enter your email"
              />
            </div>
          </Form.Group>
          <Form.Group className="lf-form-group lf-password-group">
            <Form.Label>Password</Form.Label>
            <div className="lf-input-icon">
              <Lock className="lf-icon lf-lock-icon" />
              <div className="lf-password-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handleInputBlur}
                  required
                  className="lf-form-input"
                  placeholder="Enter your password"
                />
                <span
                  className="lf-password-toggle"
                  onClick={handleTogglePassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
          </Form.Group>
          <Form.Group className="lf-checkbox-group">
            <Form.Check
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={handleRememberMe}
              className="lf-remember-me"
            />
          </Form.Group>
          <Button
            type="submit"
            variant="primary"
            className="lf-login-btn"
            onMouseOver={handleInputBlur}
          >
            Đăng nhập
          </Button>
          <div className="lf-signup-link">
            Bạn chưa có tài khoản?{" "}
            <button onClick={handleSignupRedirect} className="signup-link">
              Đăng ký ngay
            </button>
          </div>
        </Form>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
