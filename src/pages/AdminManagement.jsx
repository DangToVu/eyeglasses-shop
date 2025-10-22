import { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import "../styles/pages/AdminManagement.css";

function AdminManagement() {
  const { userRole, isLoading } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [isLoading, userRole, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (userRole !== "admin") return null;

  return (
    <div className="am-page-wrapper">
      <Header />
      <Container className="am-card-management-container">
        <Row className="am-card-selection g-4">
          <Col md={4} className="am-column">
            <h2 className="am-card-management-title my-4">Quản lý sản phẩm</h2>
            <div className="am-button-group">
              <Link to="/products/regular" className="am-card-link">
                <Button variant="primary" className="am-card-select-btn">
                  Sản phẩm nổi bật
                </Button>
              </Link>
              <Link to="/products/best-selling" className="am-card-link">
                <Button variant="success" className="am-card-select-btn">
                  Sản phẩm bán chạy
                </Button>
              </Link>
              <Link to="/products/all-management" className="am-card-link">
                <Button variant="info" className="am-card-select-btn">
                  Quản lý tất cả sản phẩm
                </Button>
              </Link>
            </div>
          </Col>
          <Col md={4} className="am-column">
            <h2 className="am-card-management-title my-4">Quản lý hàng hóa</h2>
            <div className="am-button-group">
              <Link to="/manage-types" className="am-card-link">
                <Button variant="warning" className="am-card-select-btn">
                  Quản lý loại hàng
                </Button>
              </Link>
              <Link to="/manage-brands" className="am-card-link">
                <Button variant="danger" className="am-card-select-btn">
                  Quản lý thương hiệu
                </Button>
              </Link>
              <Link to="/manage-materials" className="am-card-link">
                <Button variant="secondary" className="am-card-select-btn">
                  Quản lý chất liệu
                </Button>
              </Link>
            </div>
          </Col>
          <Col md={4} className="am-column">
            <h2 className="am-card-management-title my-4">
              Các mục quản lý khác
            </h2>
            <div className="am-button-group">
              <Link to="/manage-unique-brands" className="am-card-link">
                <Button variant="dark" className="am-card-select-btn">
                  Quản lý thẻ thương hiệu độc quyền
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminManagement;
