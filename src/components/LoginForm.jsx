import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/LoginForm.css"; // Import CSS

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/auth/v1/token?grant_type=password`,
        { email: "vuminhdang811@gmail.com", password: "Vuminhdang000999" },
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
          },
        }
      );
      localStorage.setItem("token", response.data.access_token);
      toast.success("Đăng nhập thành công!");
      navigate("/admin");
    } catch (error) {
      toast.error("Đăng nhập thất bại: " + error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <Form.Group className="form-group">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Mật khẩu</Form.Label>
        <Form.Control
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="login-btn">
        Đăng nhập
      </Button>
    </Form>
  );
}

export default LoginForm;
