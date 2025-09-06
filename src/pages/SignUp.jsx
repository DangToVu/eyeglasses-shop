import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Person, Lock } from "react-bootstrap-icons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import "../styles/pages/SignUp.css";

function SignUp() {
  useEffect(() => {
    console.log("SignUp component mounted");
    window.scrollTo(0, 0);
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      setIsLoading(false);
      return;
    }

    try {
      const signupResponse = await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`,
        { email, password },
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const userId = signupResponse.data.user.id;
      const accessToken = signupResponse.data.access_token;

      if (!userId) {
        throw new Error("Không nhận được thông tin user từ phản hồi đăng ký.");
      }

      await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/users`,
        {
          userid: userId,
          username: username,
          gmail: email,
          role: "customer",
          create_date: new Date().toISOString(),
        },
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
        }
      );

      toast.success("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      navigate("/login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      let errorMessage = "Đăng ký thất bại!";

      if (error.response?.data?.message) {
        errorMessage = `Đăng ký thất bại! ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Đăng ký thất bại! ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    const isLoginPage = location.pathname === "/login";
    if (!isLoginPage) {
      navigate("/login");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="lf-container">
        {isLoading && <LoadingScreen />}
        <Form onSubmit={handleSubmit} className="lf-form">
          <h3 className="lf-title">Đăng ký</h3>
          <Form.Group className="lf-form-group">
            <Form.Label>Tên tài khoản</Form.Label>
            <div className="lf-input-icon">
              <Person className="lf-icon lf-user-icon" />
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="lf-form-input"
                placeholder="Nhập tên tài khoản"
              />
            </div>
          </Form.Group>
          <Form.Group className="lf-form-group">
            <Form.Label>Email</Form.Label>
            <div className="lf-input-icon">
              <Person className="lf-icon lf-user-icon" />
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="lf-form-input"
                placeholder="Nhập email"
              />
            </div>
          </Form.Group>
          <Form.Group className="lf-form-group lf-password-group">
            <Form.Label>Mật khẩu</Form.Label>
            <div className="lf-input-icon">
              <Lock className="lf-icon lf-lock-icon" />
              <div className="lf-password-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="lf-form-input"
                  placeholder="Nhập mật khẩu"
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
          <Form.Group className="lf-form-group lf-password-group">
            <Form.Label>Xác nhận mật khẩu</Form.Label>
            <div className="lf-input-icon">
              <Lock className="lf-icon lf-lock-icon" />
              <div className="lf-password-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="lf-form-input"
                  placeholder="Xác nhận mật khẩu"
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
          <Button type="submit" variant="primary" className="lf-login-btn">
            Đăng ký
          </Button>
          <div className="lf-signup-link">
            Bạn đã có tài khoản rồi?{" "}
            <button onClick={handleLoginRedirect} className="login-link">
              Đăng nhập ngay
            </button>
          </div>
        </Form>
      </div>
      <Footer />
    </div>
  );
}

export default SignUp;
