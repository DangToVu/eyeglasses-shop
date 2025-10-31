/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AllProductCard from "../components/cards/AllProductCard.jsx";
import ProductDetailModal from "../components/modals/ProductDetailModal.jsx";
import "../styles/pages/AllProductsCustomer.css";
import LoadingScreen from "../components/LoadingScreen";

const formatPrice = (price) =>
  price === Infinity
    ? "Không giới hạn"
    : price.toLocaleString("vi-VN") + " VND";

function AllProductsCustomer() {
  const [allProducts, setAllProducts] = useState([]);
  const [regularProducts, setRegularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [uniqueMaterials, setUniqueMaterials] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const location = useLocation();

  const [filters, setFilters] = useState({
    brands: [],
    materials: [],
    types: [],
    minPrice: 0,
    maxPrice: Infinity,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [tempPriceRange, setTempPriceRange] = useState({
    minPrice: 0,
    maxPrice: Infinity,
  });

  const cardsSectionRef = useRef(null);

  // LƯU VỊ TRÍ CUỘN
  const scrollPosition = useRef(0);

  useEffect(() => {
    const fetchProductsAndOptions = async () => {
      setIsLoading(true);
      try {
        const publicHeaders = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          "Content-Type": "application/json",
        };

        const [
          allResponse,
          regularResponse,
          bestSellingResponse,
          brandsResponse,
          materialsResponse,
          typesResponse,
        ] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
            { headers: publicHeaders }
          ),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`, {
            headers: publicHeaders,
          }),
          axios.get(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/rest/v1/best_selling_glasses?select=*`,
            { headers: publicHeaders }
          ),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`, {
            headers: publicHeaders,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`, {
            headers: publicHeaders,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`, {
            headers: publicHeaders,
          }),
        ]);

        setAllProducts(
          allResponse.data.map((p) => ({ ...p, table: "all_product" }))
        );
        setRegularProducts(
          regularResponse.data.map((p) => ({ ...p, table: "products" }))
        );
        setBestSellingProducts(
          bestSellingResponse.data.map((p) => ({
            ...p,
            table: "best_selling_glasses",
          }))
        );
        setUniqueBrands(brandsResponse.data.map((b) => b.name));
        setUniqueMaterials(materialsResponse.data.map((m) => m.name));
        setUniqueTypes(typesResponse.data.map((t) => t.name));
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsAndOptions();
  }, []);

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam && !filters.brands.includes(brandParam)) {
      setFilters((prev) => ({
        ...prev,
        brands: [brandParam],
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (cardsSectionRef.current) {
      cardsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage, filters, searchTerm]);

  const handleFilterChange = (category, value) => {
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
  };

  const handlePriceFilter = async () => {
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
  };

  const resetFilters = () => {
    setIsFiltering(true);
    setTimeout(() => {
      setFilters({
        brands: [],
        materials: [],
        types: [],
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
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProductClick = (product) => {
    // LƯU VỊ TRÍ CUỘN
    scrollPosition.current = window.scrollY;
    setSelectedProduct(product);
    setShowModal(true);
  };

  // CHẶN SCROLL KHI MỞ MODAL + GIỮ VỊ TRÍ
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
      document.body.style.top = `-${scrollPosition.current}px`;
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
      // KHÔI PHỤC VỊ TRÍ
      window.scrollTo(0, scrollPosition.current);
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.top = "";
    };
  }, [showModal]);

  const allProductsList = [
    ...regularProducts,
    ...bestSellingProducts,
    ...allProducts,
  ];

  const filteredProducts = allProductsList.filter((product) => {
    const searchMatch =
      !searchTerm ||
      (product.name &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.product_id &&
        product.product_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.material &&
        product.material.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.type &&
        product.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.price && product.price.toString().includes(searchTerm));
    const brandMatch =
      filters.brands.length === 0 ||
      filters.brands.includes(product.brand || "");
    const materialMatch =
      filters.materials.length === 0 ||
      filters.materials.includes(product.material || "");
    const typeMatch =
      filters.types.length === 0 || filters.types.includes(product.type || "");
    const priceMatch =
      (!filters.minPrice || product.price >= filters.minPrice) &&
      (!filters.maxPrice || product.price <= filters.maxPrice);
    return (
      searchMatch && brandMatch && materialMatch && typeMatch && priceMatch
    );
  });

  const effectiveItemsPerPage = 20;
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

  return (
    <div className="ap-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="ap-main-container" fluid>
        <h2 className="ap-main-title my-4">Tất cả sản phẩm</h2>

        <div className="ap-ad-container">
          <img
            src="/ad-image.jpg"
            alt="Quảng cáo"
            className="ap-ad-image"
            loading="lazy"
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
                placeholder="Tìm theo tên, thương hiệu, mã, chất liệu, loại hàng, giá..."
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
                    onChange={() => handleFilterChange("materials", material)}
                  />
                  <label htmlFor={`material-${material}`}>{material}</label>
                </div>
              ))}
            </div>
            <div className="ap-filter-group">
              <h4>Loại hàng</h4>
              {uniqueTypes.map((type) => (
                <div key={type}>
                  <input
                    type="checkbox"
                    id={`type-${type}`}
                    checked={filters.types.includes(type)}
                    onChange={() => handleFilterChange("types", type)}
                  />
                  <label htmlFor={`type-${type}`}>{type}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="ap-cards-section" ref={cardsSectionRef}>
            <div className="ap-cards">
              {currentProducts.length === 0 ? (
                <div className="ap-no-results">Không thấy kết quả tìm kiếm</div>
              ) : (
                currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`ap-card-item ${isFiltering ? "loading" : ""}`}
                    onClick={() => handleProductClick(product)}
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
      </Container>
      <ProductDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
      />
      <Footer />
    </div>
  );
}

export default AllProductsCustomer;
