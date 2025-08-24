import { Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/components/Footer.css";

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    // Kiểm tra xem đang ở trang Home hay không
    const isHomePage = location.pathname === "/";

    if (isHomePage) {
      // Nếu đang ở trang Home, cuộn trực tiếp đến section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Nếu không ở trang Home, chuyển hướng đến trang Home với state để cuộn
      navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  const handleAllProducts = () => {
    // Kiểm tra xem đang ở trang AllProducts hay không
    const isAllProductsPage = location.pathname === "/products/all";

    if (isAllProductsPage) {
      // Nếu đang ở trang AllProducts, cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Nếu không ở trang AllProducts, chuyển hướng đến trang AllProducts
      navigate("/products/all");
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
              <li>
                <button onClick={handleAllProducts} className="footer-link">
                  Tất cả sản phẩm
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
                <img
                  src="/facebook-icon.png"
                  alt="Facebook"
                  className="facebook-icon-img"
                />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img
                  src="/zalo-icon.png"
                  alt="Zalo"
                  className="zalo-icon-img"
                />
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
