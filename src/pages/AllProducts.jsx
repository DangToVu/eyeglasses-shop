import { useState, useEffect } from "react";
import { Container, Button, Row, Col, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AllProductForm from "../components/AllProductForm.jsx";
import AllProductCard from "../components/AllProductCard.jsx";
import "../styles/pages/AllProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

// Hàm định dạng số với dấu chấm ngăn cách hàng nghìn
const formatPrice = (price) =>
  price === Infinity
    ? "Không giới hạn"
    : price.toLocaleString("vi-VN") + " VND";

function AllProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [regularProducts, setRegularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, table: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Mặc định 10 cho admin
  const isAdmin = !!localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const isManagementMode = searchParams.get("management") === "true"; // Kiểm tra mode quản lý

  // State cho filter và tìm kiếm (chỉ áp dụng khi không ở mode quản lý)
  const [filters, setFilters] = useState({
    brands: [],
    materials: [],
    minPrice: 0,
    maxPrice: Infinity,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [tempPriceRange, setTempPriceRange] = useState({
    minPrice: 0,
    maxPrice: Infinity,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (
      brandParam &&
      !filters.brands.includes(brandParam) &&
      !isManagementMode
    ) {
      setFilters((prev) => ({
        ...prev,
        brands: [brandParam],
      }));
      setCurrentPage(1);
    }
  }, [searchParams, isManagementMode]);

  const handleFilterChange = (category, value) => {
    if (!isManagementMode) {
      setIsFiltering(true);
      setTimeout(() => {
        setFilters((prev) => {
          const updatedCategory = prev[category].includes(value)
            ? prev[category].filter((v) => v !== value)
            : [...prev[category], value];
          return { ...prev, [category]: updatedCategory };
        });
        setCurrentPage(1);
        setIsFiltering(false);
      }, 500);
    }
  };

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setBestSellingProducts(bestSellingResponse.data);
        const allProductsList = [
          ...regularResponse.data,
          ...bestSellingProducts,
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
    setDeleteData({ id, table });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    setShowConfirm(false);

    setTimeout(async () => {
      try {
        let productToDelete = null;
        let imagePath = "";
        let bucket = "";

        if (deleteData.table === "products") {
          productToDelete = regularProducts.find((p) => p.id === deleteData.id);
          bucket = "product-images";
        } else if (deleteData.table === "best_selling_glasses") {
          productToDelete = bestSellingProducts.find(
            (p) => p.id === deleteData.id
          );
          bucket = "best-selling-images";
        } else if (deleteData.table === "all_product") {
          productToDelete = allProducts.find((p) => p.id === deleteData.id);
          bucket = "all-product-images";
        }

        if (productToDelete) {
          if (productToDelete.image_url) {
            imagePath = productToDelete.image_url.substring(
              productToDelete.image_url.lastIndexOf("/") + 1
            );
          } else if (productToDelete.image) {
            imagePath = productToDelete.image.substring(
              productToDelete.image.lastIndexOf("/") + 1
            );
          }
          if (imagePath && bucket) {
            await axios.delete(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/${bucket}/${imagePath}`,
              {
                headers: {
                  apikey: import.meta.env.VITE_SUPABASE_KEY,
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
          }
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

        if (deleteData.table === "products") {
          setRegularProducts(
            regularProducts.filter((p) => p.id !== deleteData.id)
          );
        } else if (deleteData.table === "best_selling_glasses") {
          setBestSellingProducts(
            bestSellingProducts.filter((p) => p.id !== deleteData.id)
          );
        } else if (deleteData.table === "all_product") {
          setAllProducts(allProducts.filter((p) => p.id !== deleteData.id));
        }
        const allProductsList = [
          ...regularProducts,
          ...bestSellingProducts,
          ...allProducts,
        ].filter((p) => p.id !== deleteData.id);
        if (currentPage > Math.ceil(allProductsList.length / itemsPerPage)) {
          setCurrentPage(1);
          console.log(
            "Deleted, resetting to page 1, currentPage:",
            currentPage
          );
        } else {
          console.log("Deleted, giữ currentPage:", currentPage);
        }
        toast.success("Xóa sản phẩm thành công!");
      } catch (error) {
        toast.error("Lỗi khi xóa: " + error.message);
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

  const allProductsList = [
    ...regularProducts.map((p) => ({ ...p, table: "products" })),
    ...bestSellingProducts.map((p) => ({
      ...p,
      table: "best_selling_glasses",
      image: p.image_url,
    })),
    ...allProducts.map((p) => ({
      ...p,
      table: "all_product",
      image: p.image_url,
    })),
  ];

  const filteredProducts = !isManagementMode
    ? allProductsList.filter((product) => {
        const searchMatch =
          !searchTerm ||
          (product.name &&
            product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.brand &&
            product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.product_id &&
            product.product_id
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.material &&
            product.material
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (product.price && product.price.toString().includes(searchTerm));
        const brandMatch =
          filters.brands.length === 0 ||
          filters.brands.includes(product.brand || "");
        const materialMatch =
          filters.materials.length === 0 ||
          filters.materials.includes(product.material || "");
        const priceMatch =
          (!filters.minPrice || product.price >= filters.minPrice) &&
          (!filters.maxPrice || product.price <= filters.maxPrice);
        return searchMatch && brandMatch && materialMatch && priceMatch;
      })
    : allProductsList;

  const effectiveItemsPerPage = isManagementMode ? itemsPerPage : 20;
  const indexOfLastItem = currentPage * effectiveItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - effectiveItemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / effectiveItemsPerPage);

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

  const uniqueBrands = [
    ...new Set(allProductsList.map((p) => p.brand).filter(Boolean)),
  ];
  const uniqueMaterials = [
    ...new Set(allProductsList.map((p) => p.material).filter(Boolean)),
  ];

  const handlePriceFilter = async () => {
    if (!isManagementMode) {
      setIsFiltering(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setFilters((prev) => ({
          ...prev,
          minPrice: tempPriceRange.minPrice,
          maxPrice: tempPriceRange.maxPrice,
        }));
        setCurrentPage(1);
      } catch (error) {
        toast.error("Lỗi khi lọc: " + error.message);
      } finally {
        setIsFiltering(false);
      }
    }
  };

  const resetFilters = () => {
    if (!isManagementMode) {
      setIsFiltering(true);
      setTimeout(() => {
        setFilters({
          brands: [],
          materials: [],
          minPrice: 0,
          maxPrice: Infinity,
        });
        setTempPriceRange({
          minPrice: 0,
          maxPrice: Infinity,
        });
        setSearchTerm("");
        setCurrentPage(1);
        setIsFiltering(false);
      }, 500);
    }
  };

  const handleSearchChange = (e) => {
    if (!isManagementMode) {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }
  };

  return (
    <div className="ap-page-wrapper">
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="ap-main-container" fluid>
        <h2 className="ap-main-title my-4">Tất cả sản phẩm</h2>

        {/* Hiển thị giao diện khách chỉ khi không ở mode quản lý */}
        {!isManagementMode && (
          <>
            <div className="ap-ad-container">
              <img
                src="/ad-image.jpg"
                alt="Quảng cáo"
                className="ap-ad-image"
              />
            </div>

            <div className="ap-content">
              <div className="ap-filter-section">
                <div className="ap-reset-filter mb-3">
                  <Button variant="secondary" onClick={resetFilters}>
                    Reset bộ lọc
                  </Button>
                </div>

                <div className="ap-search-container mb-3">
                  <input
                    type="text"
                    className="ap-search-input"
                    placeholder="Tìm theo tên, thương hiệu, mã, chất liệu, giá..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="ap-price-filter mb-3">
                  <label>
                    Khoảng giá: {formatPrice(tempPriceRange.minPrice)} -{" "}
                    {formatPrice(tempPriceRange.maxPrice)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={tempPriceRange.minPrice}
                    onChange={(e) =>
                      setTempPriceRange({
                        ...tempPriceRange,
                        minPrice: Number(e.target.value),
                      })
                    }
                    className="ap-range-input"
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={
                      tempPriceRange.maxPrice === Infinity
                        ? 5000000
                        : tempPriceRange.maxPrice
                    }
                    onChange={(e) =>
                      setTempPriceRange({
                        ...tempPriceRange,
                        maxPrice:
                          Number(e.target.value) === 5000000
                            ? Infinity
                            : Number(e.target.value),
                      })
                    }
                    className="ap-range-input"
                  />
                  <Button
                    variant="primary"
                    onClick={handlePriceFilter}
                    className="mt-2"
                  >
                    Lọc
                  </Button>
                </div>

                <h3>Lọc sản phẩm</h3>
                <div className="ap-filter-group">
                  <h4>Thương hiệu</h4>
                  {uniqueBrands.map((brand) => (
                    <div key={brand}>
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleFilterChange("brands", brand)}
                      />
                      <label htmlFor={`brand-${brand}`}>{brand}</label>
                    </div>
                  ))}
                </div>
                <div className="ap-filter-group">
                  <h4>Chất liệu</h4>
                  {uniqueMaterials.map((material) => (
                    <div key={material}>
                      <input
                        type="checkbox"
                        id={`material-${material}`}
                        checked={filters.materials.includes(material)}
                        onChange={() =>
                          handleFilterChange("materials", material)
                        }
                      />
                      <label htmlFor={`material-${material}`}>{material}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ap-cards-section">
                <div className="ap-cards">
                  {currentProducts.length === 0 ? (
                    <div className="ap-no-results">
                      Không thấy kết quả tìm kiếm 😢
                    </div>
                  ) : (
                    currentProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`ap-card-item ${
                          isFiltering ? "loading" : ""
                        }`}
                      >
                        <AllProductCard product={product} />
                      </div>
                    ))
                  )}
                </div>
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
              </div>
            </div>
          </>
        )}

        {/* Hiển thị form và table chỉ khi admin ở mode quản lý */}
        {isAdmin && isManagementMode && (
          <div className="ap-layout">
            <div className="ap-form-container">
              <AllProductForm
                product={selectedProduct}
                onSave={handleSave}
                table={selectedProduct ? selectedProduct.table : "all_product"}
              />
            </div>
            <div className="ap-list-container">
              <Table striped bordered hover className="ap-table mt-4">
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
                          src={product.image || product.image_url}
                          alt={product.name}
                          width="50"
                          style={{ borderRadius: "4px" }}
                          onError={() =>
                            console.log(
                              "Lỗi tải ảnh:",
                              product.image || product.image_url
                            )
                          }
                        />
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          className="ap-btn me-2"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          className="ap-btn"
                          onClick={() =>
                            handleDelete(product.id, product.table)
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
            </div>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default AllProducts;
