import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Person, Lock } from "react-bootstrap-icons";
import { createClient } from "@supabase/supabase-js";
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

    // Initialize Supabase client
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_KEY
    );

    try {
      // Clear any existing session and localStorage
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires_at");

      // Authenticate using Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const { access_token, expires_at, user } = data.session;
        // Store token and expiration in localStorage
        localStorage.setItem("token", access_token);
        localStorage.setItem("token_expires_at", expires_at * 1000);
        console.log("Logged in userId:", user.id); // Debug log

        // Verify session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error(
            "Không thể xác thực phiên: " +
              (sessionError?.message || "No session")
          );
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
      } else {
        throw new Error("Không nhận được phiên đăng nhập!");
      }
    } catch (error) {
      let errorMessage = "Đăng nhập thất bại!";
      if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      console.error("Login error:", error.message);
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
    const isSignupPage = location.pathname === "/signup";
    if (!isSignupPage) {
      navigate("/signup");
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
