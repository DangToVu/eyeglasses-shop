import { useState, useEffect } from "react";
import { Container, Button, Table, Form } from "react-bootstrap";
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
  const [deleteData, setDeleteData] = useState({ ids: [], table: null });
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    setDeleteData({ ids: [id], table });
    setShowConfirm(true);
  };

  const handleMultiDelete = () => {
    if (selectedProducts.size > 0) {
      setDeleteData({
        ids: Array.from(selectedProducts),
        table: "best_selling_glasses",
      });
      setShowConfirm(true);
    } else {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để xóa!");
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setShowConfirm(false);

    setTimeout(async () => {
      try {
        // Batch delete images
        const deleteImagePromises = deleteData.ids.map((id) => {
          const productToDelete = bestSellingProducts.find((p) => p.id === id);
          if (productToDelete && productToDelete.image_url) {
            const imageUrl = productToDelete.image_url;
            const imagePath = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            return axios
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
          return Promise.resolve();
        });

        // Batch delete favorites
        const deleteFavoritesPromise =
          deleteData.ids.length > 0
            ? axios
                .delete(
                  `${
                    import.meta.env.VITE_SUPABASE_URL
                  }/rest/v1/favorites?product_id=in.(${deleteData.ids.join(
                    ","
                  )})&table_name=eq.best_selling_glasses`,
                  {
                    headers: {
                      apikey: import.meta.env.VITE_SUPABASE_KEY,
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      Prefer: "return=representation",
                    },
                  }
                )
                .then((response) => {
                  console.log("Favorites deleted:", response.data);
                  return response;
                })
                .catch((err) => {
                  console.error(
                    "Failed to delete favorites:",
                    err.response?.data || err.message
                  );
                  throw err;
                })
            : Promise.resolve();

        // Batch delete products
        const deleteProductsPromise = axios.delete(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${
            deleteData.table
          }?id=in.(${deleteData.ids.join(",")})`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Prefer: "return=representation",
            },
          }
        );

        await Promise.all([
          ...deleteImagePromises,
          deleteFavoritesPromise,
          deleteProductsPromise,
        ]);

        const updatedProducts = bestSellingProducts.filter(
          (p) => !deleteData.ids.includes(p.id)
        );
        setBestSellingProducts(updatedProducts);
        setSelectedProducts(new Set());

        // Logic để quay về trang trước nếu trang hiện tại bị xóa hết
        const totalPagesAfterDelete = Math.ceil(
          updatedProducts.length / itemsPerPage
        );
        if (currentPage > totalPagesAfterDelete && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          console.log("Deleted, moving to previous page:", currentPage - 1);
        } else if (currentPage > totalPagesAfterDelete && currentPage === 1) {
          setCurrentPage(1);
          console.log(
            "Deleted, resetting to page 1, currentPage:",
            currentPage
          );
        } else {
          console.log("Deleted, keeping currentPage:", currentPage);
        }

        toast.success(
          `Xóa ${deleteData.ids.length} sản phẩm và các mục yêu thích liên quan thành công!`
        );
      } catch (error) {
        toast.error(
          "Lỗi khi xóa: " +
            (error.response?.data?.message ||
              error.message ||
              "Không thể xóa ảnh, sản phẩm hoặc mục yêu thích")
        );
      } finally {
        setIsLoading(false);
        setDeleteData({ ids: [], table: null });
      }
    }, 10);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteData({ ids: [], table: null });
  };

  const toggleSelectProduct = (id) => {
    const newSelectedProducts = new Set(selectedProducts);
    if (newSelectedProducts.has(id)) {
      newSelectedProducts.delete(id);
    } else {
      newSelectedProducts.add(id);
    }
    setSelectedProducts(newSelectedProducts);
  };

  const toggleSelectAll = () => {
    const newSelectedProducts = new Set();
    if (selectedProducts.size !== currentProducts.length) {
      currentProducts.forEach((product) => newSelectedProducts.add(product.id));
    }
    setSelectedProducts(newSelectedProducts);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    const totalPages = Math.ceil(bestSellingProducts.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
      console.log("Items per page changed, adjusted to page:", totalPages);
    } else {
      console.log("Items per page changed, keeping currentPage:", currentPage);
    }
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
          message="Bạn có chắc chắn muốn xóa sản phẩm này không? Các mục yêu thích liên quan cũng sẽ bị xóa."
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
            <div className="summary-labels">
              <span>Tổng sản phẩm: {bestSellingProducts.length}</span>
            </div>
            {selectedProducts.size > 0 && (
              <>
                <Button
                  variant="danger"
                  className="best-selling-btn mb-3"
                  onClick={handleMultiDelete}
                >
                  Xóa đã chọn
                </Button>
                <div className="selected-count">
                  Đã chọn {selectedProducts.size} sản phẩm
                </div>
              </>
            )}
            <Table striped bordered hover className="best-selling-table mt-4">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.size === currentProducts.length &&
                        currentProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.product_id || "-"}</td>
                    <td>{product.price !== null ? product.price : "-"}</td>
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
                        className="best-selling-btn edit-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="best-selling-btn delete-btn"
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
            <div className="items-per-page-selector">
              <Form.Label>Số dòng mỗi trang:</Form.Label>
              <Form.Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="ms-2"
                style={{ display: "inline-block", width: "auto" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default BestSellingProducts;
