// Login.jsx
import { useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoginForm from "../components/LoginForm.jsx";
import "../styles/pages/Login.css"; // Import CSS

function Login() {
  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi component mount
  }, []); // Chạy chỉ một lần khi component được mount

  return (
    <div className="login-page">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
}

export default Login;
