import { Container } from "react-bootstrap";
import "../styles/Footer.css"; // Import CSS

function Footer() {
  return (
    <footer className="footer">
      <Container>
        <p className="footer-text">
          © 2025 Eyeglasses Shop. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
