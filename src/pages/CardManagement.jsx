import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/pages/CardManagement.css";

function CardManagement() {
  return (
    <div className="page-wrapper">
      <Header />
      <Container className="card-management-container">
        <h2 className="card-management-title my-4">Quản lý sản phẩm</h2>
        <Row className="card-selection g-3 justify-content-center text-center">
          <Col xs={12} className="mb-3 d-flex justify-content-center">
            <Link to="/products/regular" className="card-link">
              <Button variant="primary" className="card-select-btn">
                Sản phẩm nổi bật
              </Button>
            </Link>
          </Col>
          <Col xs={12} className="mb-3 d-flex justify-content-center">
            <Link to="/products/best-selling" className="card-link">
              <Button variant="success" className="card-select-btn">
                Sản phẩm bán chạy
              </Button>
            </Link>
          </Col>
          <Col xs={12} className="mb-3 d-flex justify-content-center">
            <Link to="/products/all" className="card-link">
              <Button variant="info" className="card-select-btn">
                Quản lý tất cả sản phẩm
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default CardManagement;
