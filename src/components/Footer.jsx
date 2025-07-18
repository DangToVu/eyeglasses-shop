import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaComment } from "react-icons/fa";
import "../styles/components/Footer.css";

function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-wave"></div>
      <Container>
        <Row>
          <Col md={4} className="footer-col footer-products">
            <h4 className="footer-title">Sản phẩm</h4>
            <ul className="footer-list">
              <li>
                <button
                  onClick={() => scrollToSection("new-collection")}
                  className="footer-link"
                >
                  Bộ sưu tập mới nhất
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("best-selling")}
                  className="footer-link"
                >
                  Sản phẩm bán chạy
                </button>
              </li>
            </ul>
          </Col>
          <Col md={4} className="footer-col footer-social">
            <h4 className="footer-title">Theo dõi chúng tôi</h4>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaFacebook />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaComment />
              </a>
            </div>
          </Col>
          <Col md={4} className="footer-col footer-info">
            <h4 className="footer-title">Thông tin</h4>
            <p className="footer-text">
              © 2025 Eyeglasses Shop. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
