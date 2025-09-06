import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Person, Lock } from "react-bootstrap-icons";
import "../styles/components/LoginForm.css";
import LoadingScreen from "./LoadingScreen";
import YetiAnimation from "./YetiAnimation";

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

  const [yetiProps, setYetiProps] = useState({
    check: false, // Initially set to false so Yeti looks straight ahead
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
      check: true, // Now controlled by focus
      handsUp: false,
      look: calculateLook(email),
    }));
  };

  const handlePasswordFocus = () => {
    setYetiProps((prev) => ({
      ...prev,
      check: true, // Now controlled by focus
      handsUp: !showPassword,
      look: showPassword ? calculateLook(password) : 0,
    }));
  };

  const handleInputBlur = () => {
    setYetiProps((prev) => ({
      ...prev,
      check: false, // Yeti looks straight ahead when blurred
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
      const expirationTime = Date.now() + expires_in * 1000;
      localStorage.setItem("token", access_token);
      localStorage.setItem("token_expires_at", expirationTime);

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

  return (
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
      </Form>
    </div>
  );
}

export default LoginForm;
