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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ ids: [], table: null });
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    brand: "",
    material: "",
    type: "",
    searchTerm: "",
  });
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [types, setTypes] = useState([]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "-";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    if (userRole !== "admin") return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const [
          productsResponse,
          brandsResponse,
          materialsResponse,
          typesResponse,
        ] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
            { headers }
          ),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`, {
            headers,
          }),
        ]);
        setBestSellingProducts(productsResponse.data);
        setFilteredProducts(productsResponse.data);
        setBrands(brandsResponse.data.map((b) => b.name));
        setMaterials(materialsResponse.data.map((m) => m.name));
        setTypes(typesResponse.data.map((t) => t.name));
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userRole]);

  useEffect(() => {
    const filtered = bestSellingProducts.filter((product) => {
      const searchMatch =
        !filters.searchTerm ||
        (product.name &&
          product.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (product.brand &&
          product.brand
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (product.product_id &&
          product.product_id
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (product.material &&
          product.material
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (product.type &&
          product.type
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()));
      const brandMatch = !filters.brand || product.brand === filters.brand;
      const materialMatch =
        !filters.material || product.material === filters.material;
      const typeMatch = !filters.type || product.type === filters.type;
      return searchMatch && brandMatch && materialMatch && typeMatch;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [filters, bestSellingProducts]);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const [
          productsResponse,
          brandsResponse,
          materialsResponse,
          typesResponse,
        ] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/best_selling_glasses`,
            { headers }
          ),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`, {
            headers,
          }),
        ]);
        setBestSellingProducts(productsResponse.data);
        setFilteredProducts(
          productsResponse.data.filter((product) => {
            const searchMatch =
              !filters.searchTerm ||
              (product.name &&
                product.name
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.brand &&
                product.brand
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.product_id &&
                product.product_id
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.material &&
                product.material
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.type &&
                product.type
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase()));
            const brandMatch =
              !filters.brand || product.brand === filters.brand;
            const materialMatch =
              !filters.material || product.material === filters.material;
            const typeMatch = !filters.type || product.type === filters.type;
            return searchMatch && brandMatch && materialMatch && typeMatch;
          })
        );
        setBrands(brandsResponse.data.map((b) => b.name));
        setMaterials(materialsResponse.data.map((m) => m.name));
        setTypes(typesResponse.data.map((t) => t.name));
        if (
          bestSellingProducts.length === 0 ||
          productsResponse.data.length < bestSellingProducts.length
        ) {
          setCurrentPage(1);
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
        setFilteredProducts(
          updatedProducts.filter((product) => {
            const searchMatch =
              !filters.searchTerm ||
              (product.name &&
                product.name
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.brand &&
                product.brand
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.product_id &&
                product.product_id
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.material &&
                product.material
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase())) ||
              (product.type &&
                product.type
                  .toLowerCase()
                  .includes(filters.searchTerm.toLowerCase()));
            const brandMatch =
              !filters.brand || product.brand === filters.brand;
            const materialMatch =
              !filters.material || product.material === filters.material;
            const typeMatch = !filters.type || product.type === filters.type;
            return searchMatch && brandMatch && materialMatch && typeMatch;
          })
        );
        setSelectedProducts(new Set());

        const totalPagesAfterDelete = Math.ceil(
          updatedProducts.length / itemsPerPage
        );
        if (currentPage > totalPagesAfterDelete && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else if (currentPage > totalPagesAfterDelete && currentPage === 1) {
          setCurrentPage(1);
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
    }
  };

  const handleFilterChange = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: value === "all" ? "" : value,
    }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({
      brand: "",
      material: "",
      type: "",
      searchTerm: "",
    });
    setCurrentPage(1);
  };

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

  if (authLoading) return <LoadingScreen />;
  if (userRole !== "admin") return null;

  return (
    <div className="regular-page-wrapper">
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không? Các mục yêu thích liên quan cũng sẽ bị xóa."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="regular-container">
        <h2 className="regular-title my-4">Quản lý Sản phẩm Bán chạy</h2>
        <div className="regular-product-layout">
          <div className="regular-product-form-container">
            <BestSellingForm product={selectedProduct} onSave={handleSave} />
          </div>
          <div className="regular-product-list-container">
            <div className="summary-labels">
              <span>Tổng sản phẩm: {filteredProducts.length}</span>
            </div>
            <Button
              variant="primary"
              className="regular-btn filter-btn mb-3"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ẩn Bộ lọc" : "Hiện Bộ lọc"}
            </Button>
            {showFilters && (
              <div className="regular-filter-section">
                <div className="regular-filter-controls">
                  <Form.Control
                    type="text"
                    className="regular-search-input"
                    placeholder="Tìm kiếm..."
                    value={filters.searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Form.Select
                    value={filters.brand}
                    onChange={(e) =>
                      handleFilterChange("brand", e.target.value)
                    }
                    className="regular-filter-select"
                  >
                    <option value="all">Tất cả thương hiệu</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    value={filters.material}
                    onChange={(e) =>
                      handleFilterChange("material", e.target.value)
                    }
                    className="regular-filter-select"
                  >
                    <option value="all">Tất cả chất liệu</option>
                    {materials.map((material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="regular-filter-select"
                  >
                    <option value="all">Tất cả loại hàng</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="secondary"
                    className="regular-reset-btn"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
            {selectedProducts.size > 0 && (
              <>
                <Button
                  variant="danger"
                  className="regular-btn mb-3"
                  onClick={handleMultiDelete}
                >
                  Xóa đã chọn
                </Button>
                <div className="selected-count">
                  Đã chọn {selectedProducts.size} sản phẩm
                </div>
              </>
            )}
            <Table striped bordered hover className="regular-table mt-4">
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
                  <th>Loại hàng</th>
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
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.description || "-"}</td>
                    <td>{product.brand || "-"}</td>
                    <td>{product.material || "-"}</td>
                    <td>{product.type || "-"}</td>
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
                        className="regular-btn edit-btn"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="regular-btn delete-btn"
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
              <div className="pagination-regular" key={currentPage}>
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
