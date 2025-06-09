import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import biểu tượng mắt từ react-icons
import { Person, Lock } from "react-bootstrap-icons"; // Import icon từ react-bootstrap-icons
import "../styles/LoginForm.css"; // Import CSS

function LoginForm() {
  const [email, setEmail] = useState(
    localStorage.getItem("savedUsername") || ""
  ); // Thay username bằng email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("savedUsername")
  );
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
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/auth/v1/token?grant_type=password`,
        { email, password }, // Sử dụng email thay vì username
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            "Content-Type": "application/json", // Đảm bảo header Content-Type
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
      navigate("/card-management"); // Điều hướng đến CardManagement thay vì /admin
    } catch (error) {
      toast.error(
        "Đăng nhập thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <h3 className="login-title">Login</h3>
      <Form.Group className="form-group">
        <Form.Label>Email</Form.Label> {/* Thay Username thành Email */}
        <div className="input-icon">
          <Person className="icon user-icon" />
          <Form.Control
            type="email" // Thay type="text" thành type="email" để kiểm tra định dạng
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="Email"
          />
        </div>
      </Form.Group>
      <Form.Group className="form-group password-group">
        <Form.Label>Password</Form.Label>
        <div className="input-icon">
          <Lock className="icon lock-icon" />
          <div className="password-wrapper">
            <Form.Control
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Password"
            />
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
      </Form.Group>
      <Form.Group className="checkbox-group">
        <Form.Check
          type="checkbox"
          label="Remember me"
          checked={rememberMe}
          onChange={handleRememberMe}
          className="remember-me"
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="login-btn">
        LOGIN
      </Button>
    </Form>
  );
}

export default LoginForm;
