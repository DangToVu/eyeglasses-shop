import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Person, Lock } from "react-bootstrap-icons";
import "../styles/LoginForm.css";
import LoadingScreen from "../components/LoadingScreen"; // Import LoadingScreen

function LoginForm() {
  const [email, setEmail] = useState(
    localStorage.getItem("savedUsername") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("savedUsername")
  );
  const [isLoading, setIsLoading] = useState(false); // State cho loading
  const navigate = useNavigate();

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
    setIsLoading(true); // Bắt đầu hiển thị loading
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
          },
        }
      );
      localStorage.setItem("token", response.data.access_token);
      if (rememberMe) {
        localStorage.setItem("savedUsername", email);
      } else {
        localStorage.removeItem("savedUsername");
      }
      toast.success("Đăng nhập thành công!");
      navigate("/card-management");
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
  };

  return (
    <div className="lf-container">
      {isLoading && <LoadingScreen />}{" "}
      {/* Hiển thị loading khi isLoading là true */}
      <Form onSubmit={handleSubmit} className="lf-form">
        <h3 className="lf-title">Login</h3>
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
          LOGIN
        </Button>
      </Form>
    </div>
  );
}

export default LoginForm;
