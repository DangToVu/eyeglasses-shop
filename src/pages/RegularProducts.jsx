import { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductForm from "../components/ProductForm.jsx";
import "../styles/pages/RegularProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

function RegularProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, table: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProducts(response.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProducts(response.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  };

  const handleDelete = (id, table) => {
    setDeleteData({ id, table });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      // Lấy thông tin sản phẩm để lấy đường dẫn ảnh
      const productToDelete = products.find((p) => p.id === deleteData.id);
      if (productToDelete && productToDelete.image) {
        // Trích xuất tên file từ URL
        const imageUrl = productToDelete.image;
        const imagePath = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        console.log("Sản phẩm cần xóa:", productToDelete);
        console.log("Đường dẫn ảnh từ bảng:", imageUrl);
        console.log("Tên file cần xóa:", imagePath);
        console.log(
          "Yêu cầu xóa ảnh:",
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/product-images/${imagePath}`
        );

        // Xóa file ảnh từ bucket 'product-images'
        await axios.delete(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/product-images/${imagePath}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Xóa bản ghi khỏi bảng
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${
          deleteData.table
        }?id=eq.${deleteData.id}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Prefer: "return=representation",
          },
        }
      );
      setProducts(products.filter((p) => p.id !== deleteData.id));
      toast.success("Xóa sản phẩm và ảnh thành công!");
    } catch (error) {
      console.error(
        "Lỗi chi tiết:",
        error.response ? error.response.data : error.message
      );
      toast.error(
        "Lỗi khi xóa: " +
          (error.response?.data?.message ||
            error.message ||
            "Không thể xóa ảnh hoặc sản phẩm")
      );
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setDeleteData({ id: null, table: null });
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteData({ id: null, table: null });
  };

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="regular-container">
        <Button
          variant="secondary"
          className="back-btn mb-3"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
        <h2 className="regular-title my-4">Quản lý Sản phẩm Nổi bật</h2>
        <ProductForm product={selectedProduct} onSave={handleSave} />
        <Table striped bordered hover className="regular-table mt-4">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.description || "-"}</td>
                <td>
                  <img
                    src={product.image}
                    alt={product.name}
                    width="50"
                    style={{ borderRadius: "4px" }}
                    onError={() => console.log("Lỗi tải ảnh:", product.image)}
                  />
                </td>
                <td>
                  <Button
                    variant="warning"
                    className="regular-btn me-2"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    className="regular-btn"
                    onClick={() => handleDelete(product.id, "products")}
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

export default RegularProducts;
