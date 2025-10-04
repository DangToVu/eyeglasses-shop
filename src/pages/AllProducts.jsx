import { useState, useEffect } from "react";
import { Container, Button, Table, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AllProductForm from "../components/AllProductForm.jsx";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import "../styles/pages/AllProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

function AllProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [regularProducts, setRegularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ ids: [], table: null });
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang quản lý này!");
      navigate("/");
    }
  }, [userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const adminHeaders = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        };

        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          { headers: adminHeaders }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          { headers: adminHeaders }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          { headers: adminHeaders }
        );
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchProducts();
    }
  }, [userRole]);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        };

        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          { headers }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          { headers }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          { headers }
        );
        setBestSellingProducts(bestSellingResponse.data);
        const allProductsList = [
          ...regularResponse.data,
          ...bestSellingResponse.data,
          ...allResponse.data,
        ];
        if (
          allProductsList.length === 0 ||
          allProductsList.length < allProducts.length
        ) {
          setCurrentPage(1);
          console.log("Saved, resetting to page 1, currentPage:", currentPage);
        } else {
          console.log("Saved, giữ currentPage:", currentPage);
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
    if (userRole === "admin") {
      setDeleteData({ ids: [id], table });
      setShowConfirm(true);
    }
  };

  const handleMultiDelete = () => {
    if (userRole === "admin" && selectedProducts.size > 0) {
      setDeleteData({
        ids: Array.from(selectedProducts),
        table: null, // Sẽ xác định table trong confirmDelete
      });
      setShowConfirm(true);
    } else {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để xóa!");
    }
  };

  const confirmDelete = async () => {
    if (userRole !== "admin") return;
    setIsLoading(true);
    setShowConfirm(false);

    setTimeout(async () => {
      try {
        // Tạo các promise để xóa hình ảnh
        const deleteImagePromises = deleteData.ids.map((id) => {
          let productToDelete = null;
          let bucket = "";
          let table = deleteData.table;

          if (!table) {
            if (regularProducts.some((p) => p.id === id)) {
              productToDelete = regularProducts.find((p) => p.id === id);
              table = "products";
              bucket = "product-images";
            } else if (bestSellingProducts.some((p) => p.id === id)) {
              productToDelete = bestSellingProducts.find((p) => p.id === id);
              table = "best_selling_glasses";
              bucket = "best-selling-images";
            } else if (allProducts.some((p) => p.id === id)) {
              productToDelete = allProducts.find((p) => p.id === id);
              table = "all_product";
              bucket = "all-product-images";
            }
          } else {
            if (table === "products") {
              productToDelete = regularProducts.find((p) => p.id === id);
              bucket = "product-images";
            } else if (table === "best_selling_glasses") {
              productToDelete = bestSellingProducts.find((p) => p.id === id);
              bucket = "best-selling-images";
            } else if (table === "all_product") {
              productToDelete = allProducts.find((p) => p.id === id);
              bucket = "all-product-images";
            }
          }

          if (productToDelete && productToDelete.image_url) {
            const imagePath = productToDelete.image_url.substring(
              productToDelete.image_url.lastIndexOf("/") + 1
            );
            return axios
              .delete(
                `${
                  import.meta.env.VITE_SUPABASE_URL
                }/storage/v1/object/${bucket}/${imagePath}`,
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

        // Tạo promise để xóa favorites theo table
        const deleteFavoritesPromises = deleteData.ids.reduce((acc, id) => {
          let table = deleteData.table;
          if (!table) {
            if (regularProducts.some((p) => p.id === id)) {
              table = "products";
            } else if (bestSellingProducts.some((p) => p.id === id)) {
              table = "best_selling_glasses";
            } else if (allProducts.some((p) => p.id === id)) {
              table = "all_product";
            }
          }
          if (table) {
            acc.push(
              axios
                .delete(
                  `${
                    import.meta.env.VITE_SUPABASE_URL
                  }/rest/v1/favorites?product_id=in.(${id})&table_name=eq.${table}`,
                  {
                    headers: {
                      apikey: import.meta.env.VITE_SUPABASE_KEY,
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      Prefer: "return=representation",
                    },
                  }
                )
                .then((response) => {
                  console.log(`Favorites deleted for ${table}:`, response.data);
                  return response;
                })
                .catch((err) => {
                  console.error(
                    `Failed to delete favorites for ${table}:`,
                    err.response?.data || err.message
                  );
                  throw err;
                })
            );
          }
          return acc;
        }, []);

        // Tạo promise để xóa sản phẩm theo table
        const deleteProductsPromises = deleteData.ids.reduce((acc, id) => {
          let table = deleteData.table;
          if (!table) {
            if (regularProducts.some((p) => p.id === id)) {
              table = "products";
            } else if (bestSellingProducts.some((p) => p.id === id)) {
              table = "best_selling_glasses";
            } else if (allProducts.some((p) => p.id === id)) {
              table = "all_product";
            }
          }
          if (table) {
            acc.push(
              axios.delete(
                `${
                  import.meta.env.VITE_SUPABASE_URL
                }/rest/v1/${table}?id=in.(${id})`,
                {
                  headers: {
                    apikey: import.meta.env.VITE_SUPABASE_KEY,
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Prefer: "return=representation",
                  },
                }
              )
            );
          }
          return acc;
        }, []);

        await Promise.all([
          ...deleteImagePromises,
          ...deleteFavoritesPromises,
          ...deleteProductsPromises,
        ]);

        const updatedAllProducts = allProducts.filter(
          (p) => !deleteData.ids.includes(p.id)
        );
        const updatedRegularProducts = regularProducts.filter(
          (p) => !deleteData.ids.includes(p.id)
        );
        const updatedBestSellingProducts = bestSellingProducts.filter(
          (p) => !deleteData.ids.includes(p.id)
        );

        setAllProducts(updatedAllProducts);
        setRegularProducts(updatedRegularProducts);
        setBestSellingProducts(updatedBestSellingProducts);
        setSelectedProducts(new Set());

        const allProductsList = [
          ...updatedRegularProducts,
          ...updatedBestSellingProducts,
          ...updatedAllProducts,
        ];
        const totalPagesAfterDelete = Math.ceil(
          allProductsList.length / itemsPerPage
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
    const totalPages = Math.ceil(filteredProducts.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
      console.log("Items per page changed, adjusted to page:", totalPages);
    } else {
      console.log("Items per page changed, keeping currentPage:", currentPage);
    }
  };

  const allProductsList = [
    ...regularProducts.map((p) => ({ ...p, table: "products" })),
    ...bestSellingProducts.map((p) => ({
      ...p,
      table: "best_selling_glasses",
    })),
    ...allProducts.map((p) => ({ ...p, table: "all_product" })),
  ];

  const filteredProducts = allProductsList;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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

  return (
    <div className="ap-page-wrapper">
      {(isLoading || authLoading) && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không? Các mục yêu thích liên quan cũng sẽ bị xóa."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="ap-main-container" fluid>
        <h2 className="ap-main-title my-4">Quản lý tất cả sản phẩm</h2>

        <div className="ap-layout">
          <div className="ap-form-container">
            <AllProductForm
              product={selectedProduct}
              onSave={handleSave}
              table={selectedProduct ? selectedProduct.table : "all_product"}
            />
          </div>
          <div className="ap-list-container">
            <div className="summary-labels">
              <span>Tổng sản phẩm: {filteredProducts.length}</span>
            </div>
            {selectedProducts.size > 0 && (
              <>
                <Button
                  variant="danger"
                  className="ap-btn mb-3"
                  onClick={handleMultiDelete}
                >
                  Xóa đã chọn
                </Button>
                <div className="selected-count">
                  Đã chọn {selectedProducts.size} sản phẩm
                </div>
              </>
            )}
            <Table striped bordered hover className="ap-table mt-4">
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
                        className="ap-btn edit-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="ap-btn delete-btn"
                        onClick={() => handleDelete(product.id, product.table)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="ap-pagination" key={currentPage}>
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

export default AllProducts;
