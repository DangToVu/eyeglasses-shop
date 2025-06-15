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
        <Row className="card-selection">
          <Col md={6} className="mb-3">
            <Link to="/products/regular">
              <Button variant="primary" className="card-select-btn w-100">
                Sản phẩm nổi bật
              </Button>
            </Link>
          </Col>
          <Col md={6} className="mb-3">
            <Link to="/products/best-selling">
              <Button variant="success" className="card-select-btn w-100">
                Sản phẩm bán chạy
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
