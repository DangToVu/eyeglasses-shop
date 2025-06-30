import { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import BestSellingForm from "../components/BestSellingForm.jsx";
import "../styles/pages/BestSellingProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

function BestSellingProducts() {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, table: null });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBestSellingProducts(response.data);
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
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBestSellingProducts(response.data);
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
    setShowConfirm(false);

    setTimeout(async () => {
      try {
        const productToDelete = bestSellingProducts.find(
          (p) => p.id === deleteData.id
        );
        if (productToDelete && productToDelete.image_url) {
          const imageUrl = productToDelete.image_url;
          const imagePath = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
          await axios.delete(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/best-selling-images/${imagePath}`,
            {
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_KEY,
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

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
        setBestSellingProducts(
          bestSellingProducts.filter((p) => p.id !== deleteData.id)
        );
        toast.success("Xóa sản phẩm và ảnh thành công!");
      } catch (error) {
        toast.error(
          "Lỗi khi xóa: " +
            (error.response?.data?.message ||
              error.message ||
              "Không thể xóa ảnh hoặc sản phẩm")
        );
      } finally {
        setIsLoading(false);
        setDeleteData({ id: null, table: null });
      }
    }, 10);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteData({ id: null, table: null });
  };

  return (
    <div className="best-selling-page-wrapper">
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="best-selling-container">
        <h2 className="best-selling-title my-4">Quản lý Sản phẩm Bán chạy</h2>
        <div className="best-selling-product-layout">
          <div className="best-selling-product-form-container">
            <BestSellingForm product={selectedProduct} onSave={handleSave} />
          </div>
          <div className="best-selling-product-list-container">
            <Table striped bordered hover className="best-selling-table mt-4">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mã sản phẩm</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Thương hiệu</th>
                  <th>Chất liệu</th>
                  <th>Ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bestSellingProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.product_id || "-"}</td>
                    <td>{product.price}</td>
                    <td>{product.description || "-"}</td>
                    <td>{product.brand || "-"}</td>
                    <td>{product.material || "-"}</td>
                    <td>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        width="50"
                        style={{ borderRadius: "4px" }}
                        onError={() =>
                          console.log("Lỗi tải ảnh:", product.image_url)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        className="best-selling-btn me-2"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="best-selling-btn"
                        onClick={() =>
                          handleDelete(product.id, "best_selling_glasses")
                        }
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default BestSellingProducts;
