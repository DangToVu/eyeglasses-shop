import { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import BestSellingForm from "../components/BestSellingForm.jsx";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import "../styles/pages/BestSellingProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

function BestSellingProducts() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, table: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    if (userRole !== "admin") return;

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
  }, [userRole]);

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
        if (
          bestSellingProducts.length === 0 ||
          response.data.length < bestSellingProducts.length
        ) {
          setCurrentPage(1);
          console.log("Saved, resetting to page 1, currentPage:", currentPage);
        } else {
          console.log("Saved, keeping currentPage:", currentPage);
        }
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
        let deleteImagePromise = Promise.resolve();
        if (productToDelete && productToDelete.image_url) {
          const imageUrl = productToDelete.image_url;
          const imagePath = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
          deleteImagePromise = axios
            .delete(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/best-selling-images/${imagePath}`,
              {
                headers: {
                  apikey: import.meta.env.VITE_SUPABASE_KEY,
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
            .catch((err) => {
              console.warn("Failed to delete image:", err.message);
            });
        }

        await Promise.all([
          deleteImagePromise,
          axios.delete(
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
          ),
        ]);

        setBestSellingProducts(
          bestSellingProducts.filter((p) => p.id !== deleteData.id)
        );
        if (
          currentPage > Math.ceil(bestSellingProducts.length / itemsPerPage)
        ) {
          setCurrentPage(1);
          console.log(
            "Deleted, resetting to page 1, currentPage:",
            currentPage
          );
        } else {
          console.log("Deleted, keeping currentPage:", currentPage);
        }
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = bestSellingProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(bestSellingProducts.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    console.log("Paginating to page:", pageNumber);
  };
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [...Array(endPage - startPage + 1).keys()].map(
    (i) => startPage + i
  );

  if (authLoading) return <LoadingScreen />;
  if (userRole !== "admin") return null;

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
                {currentProducts.map((product) => (
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
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/path/to/fallback-image.jpg";
                          console.log("Lỗi tải ảnh:", product.image_url);
                        }}
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
            {totalPages > 1 && (
              <div className="pagination-best-selling" key={currentPage}>
                <Button
                  variant="secondary"
                  onClick={firstPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </Button>
                <Button
                  variant="secondary"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    variant={
                      currentPage === number ? "primary" : "outline-primary"
                    }
                    onClick={() => paginate(number)}
                    className="mx-1"
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </Button>
                <Button
                  variant="secondary"
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default BestSellingProducts;
