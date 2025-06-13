import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductForm from "../components/ProductForm.jsx";
import "../styles/pages/Admin.css";
import LoadingScreen from "../components/LoadingScreen"; // Import LoadingScreen

function Admin() {
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

  const handleDelete = async (id, table) => {
    setIsLoading(true); // Bắt đầu hiển thị loading
    try {
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (table === "products") {
        setProducts(products.filter((product) => product.id !== id));
      } else {
        setBestSellingProducts(
          bestSellingProducts.filter((product) => product.id !== id)
        );
      }
      toast.success(
        `Xóa ${
          table === "best_selling_glasses" ? "sản phẩm bán chạy" : "sản phẩm"
        } thành công!`
      );
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

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

  // Kết hợp cả hai danh sách sản phẩm để hiển thị
  const allProducts = [
    ...products.map((p) => ({ ...p, table: "products" })),
    ...bestSellingProducts.map((p) => ({
      ...p,
      table: "best_selling_glasses",
    })),
  ];

  return (
    <div>
      {isLoading && <LoadingScreen />}{" "}
      {/* Hiển thị loading khi isLoading là true */}
      <Header />
      <Container className="admin-container">
        <h2 className="admin-title my-4">Quản lý sản phẩm</h2>
        <ProductForm product={selectedProduct} onSave={handleSave} />
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
                <td>{product.description}</td>
                <td>
                  <img
                    src={product.image}
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
      </Container>
      <Footer />
    </div>
  );
}

export default Admin;
