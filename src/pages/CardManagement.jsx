import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductForm from "../components/ProductForm.jsx";
import BestSellingForm from "../components/BestSellingForm.jsx";
import "../styles/pages/CardManagement.css";
import LoadingScreen from "../components/LoadingScreen"; // Import LoadingScreen

function CardManagement() {
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [products, setProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State cho loading

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true); // Bắt đầu hiển thị loading
      try {
        const [productsResponse, bestSellingResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`, {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
            {
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_KEY,
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);
        setProducts(productsResponse.data);
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false); // Kết thúc loading
      }
    };
    fetchProducts();
  }, []);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true); // Bắt đầu hiển thị loading
    const fetchProducts = async () => {
      try {
        const [productsResponse, bestSellingResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`, {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
            {
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_KEY,
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ),
        ]);
        setProducts(productsResponse.data);
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false); // Kết thúc loading
      }
    };
    fetchProducts();
  };

  const handleDelete = (id, table) => {
    setIsLoading(true); // Bắt đầu hiển thị loading
    axios
      .delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        if (table === "products") {
          setProducts(products.filter((p) => p.id !== id));
        } else {
          setBestSellingProducts(
            bestSellingProducts.filter((p) => p.id !== id)
          );
        }
        toast.success(
          `Xóa ${
            table === "best_selling_glasses" ? "sản phẩm bán chạy" : "sản phẩm"
          } thành công!`
        );
      })
      .catch((error) => {
        toast.error("Lỗi khi xóa: " + error.message);
      })
      .finally(() => {
        setIsLoading(false); // Kết thúc loading
      });
  };

  const allProducts =
    selectedCardType === "regular"
      ? products.map((p) => ({ ...p, table: "products" }))
      : selectedCardType === "best_selling"
      ? bestSellingProducts.map((p) => ({
          ...p,
          table: "best_selling_glasses",
        }))
      : [];

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}{" "}
      {/* Hiển thị loading khi isLoading là true */}
      <Header />
      <Container className="card-management-container">
        <h2 className="card-management-title my-4">Quản lý sản phẩm</h2>
        {!selectedCardType && (
          <Row className="card-selection">
            <Col md={6} className="mb-3">
              <Button
                variant="primary"
                className="card-select-btn"
                onClick={() => setSelectedCardType("regular")}
              >
                Sản phẩm nổi bật
              </Button>
            </Col>
            <Col md={6} className="mb-3">
              <Button
                variant="success"
                className="card-select-btn"
                onClick={() => setSelectedCardType("best_selling")}
              >
                Sản phẩm bán chạy
              </Button>
            </Col>
          </Row>
        )}
        {selectedCardType && (
          <>
            <Button
              variant="secondary"
              className="back-btn mb-4"
              onClick={() => setSelectedCardType(null)}
            >
              Quay lại
            </Button>
            {selectedCardType === "regular" ? (
              <ProductForm product={selectedProduct} onSave={handleSave} />
            ) : (
              <BestSellingForm product={selectedProduct} onSave={handleSave} />
            )}
            <Table striped bordered hover className="admin-table mt-4">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.table === "best_selling_glasses"
                        ? "Sản phẩm bán chạy"
                        : "Sản phẩm thông thường"}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.description || "-"}</td>
                    <td>
                      <img
                        src={product.image || product.image_url}
                        alt={product.name}
                        width="50"
                        style={{ borderRadius: "4px" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        className="me-2 admin-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="admin-btn"
                        onClick={() => handleDelete(product.id, product.table)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default CardManagement;
