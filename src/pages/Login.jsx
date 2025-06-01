import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoginForm from "../components/LoginForm.jsx";
import "../styles/Login.css"; // Import CSS

function Login() {
  return (
    <div className="login-page">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
}

export default Login;
