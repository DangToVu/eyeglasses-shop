import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Person, Lock } from "react-bootstrap-icons";
import "../styles/components/LoginForm.css";
import LoadingScreen from "../components/LoadingScreen";

function LoginForm() {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      const response = await axios.post(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/auth/v1/token?grant_type=password`,
        { email, password },
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      const { access_token, expires_in } = response.data;
      const expirationTime = Date.now() + expires_in * 1000; // Chuyển đổi sang milliseconds
      localStorage.setItem("token", access_token);
      localStorage.setItem("token_expires_at", expirationTime); // Lưu thời gian hết hạn

      if (rememberMe) {
        localStorage.setItem("savedUsername", email);
      } else {
        localStorage.removeItem("savedUsername");
      }

      toast.success("Đăng nhập thành công!");

      const from = location.state?.from?.pathname || "/card-management";
      navigate(from);
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại!";
      if (error.response) {
        errorMessage += ` ${
          error.response.data.message || "Email hoặc mật khẩu không đúng."
        }`;
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lf-container">
      {isLoading && <LoadingScreen />}
      <Form onSubmit={handleSubmit} className="lf-form">
        <h3 className="lf-title">Đăng nhập</h3>
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
                onChange={(e) => setPassword(e.target.value)}
                required
                className="lf-form-input"
                placeholder="Enter your password"
              />
              <span
                className="lf-password-toggle"
                onClick={togglePasswordVisibility}
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
        <Button type="submit" variant="primary" className="lf-login-btn">
          Đăng nhập
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
