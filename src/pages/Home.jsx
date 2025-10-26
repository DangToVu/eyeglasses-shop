import { useState, useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/cards/ProductCard.jsx";
import BestSellingCard from "../components/cards/BestSellingCard.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/pages/Home.css";
import LoadingScreen from "../components/LoadingScreen";
import ProductDetailModal from "../components/modals/ProductDetailModal.jsx";

function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const productsContainerRef = useRef(null);
  const bestSellingContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bestSellingIndex, setBestSellingIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [underlineStep, setUnderlineStep] = useState(0);
  const brandCarouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const brandWrapperRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // LƯU VỊ TRÍ CUỘN
  const scrollPosition = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth <= 1199) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_KEY } }
        );
        setProducts(
          productsResponse.data.map((p) => ({ ...p, table: "products" })) || []
        );

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_KEY } }
        );
        setBestSellingProducts(
          bestSellingResponse.data.map((p) => ({
            ...p,
            table: "best_selling_glasses",
          })) || []
        );

        const uniqueBrandsResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/unique_brands?select=*,brands(name)`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_KEY } }
        );
        setUniqueBrands(
          uniqueBrandsResponse.data.map((ub) => ({
            ...ub,
            brand_name: ub.brands?.name || "N/A",
          })) || []
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setProducts([]);
        setBestSellingProducts([]);
        setUniqueBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const maxSteps = Math.max(products.length - itemsPerView, 0);
    setUnderlineStep(
      Math.min(
        (currentIndex / (products.length > itemsPerView ? maxSteps : 1)) * 100,
        100
      )
    );
  }, [currentIndex, products.length, itemsPerView]);

  useEffect(() => {
    const maxSteps = Math.max(bestSellingProducts.length - itemsPerView, 0);
    setUnderlineStep(
      Math.min(
        (bestSellingIndex /
          (bestSellingProducts.length > itemsPerView ? maxSteps : 1)) *
          100,
        100
      )
    );
  }, [bestSellingIndex, bestSellingProducts.length, itemsPerView]);

  useEffect(() => {
    if (location.state?.scrollTo && !isLoading) {
      const sectionId = location.state.scrollTo;
      const element = document.getElementById(sectionId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }, 300);
      }
    }
  }, [location.state, isLoading]);

  const scrollLeft = () => {
    if (productsContainerRef.current && products.length > 0) {
      const newIndex = (currentIndex - 1 + products.length) % products.length;
      setCurrentIndex(newIndex);
      const cardWidth = 300;
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (productsContainerRef.current && products.length > 0) {
      const newIndex = (currentIndex + 1) % products.length;
      setCurrentIndex(newIndex);
      const cardWidth = 300;
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollBestSellingLeft = () => {
    if (bestSellingContainerRef.current && bestSellingProducts.length > 0) {
      const newIndex =
        (bestSellingIndex - 1 + bestSellingProducts.length) %
        bestSellingProducts.length;
      setBestSellingIndex(newIndex);
      const cardWidth = 300;
      bestSellingContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollBestSellingRight = () => {
    if (bestSellingContainerRef.current && bestSellingProducts.length > 0) {
      const newIndex = (bestSellingIndex + 1) % bestSellingProducts.length;
      setBestSellingIndex(newIndex);
      const cardWidth = 300;
      bestSellingContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    if (brandCarouselRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - brandCarouselRef.current.scrollLeft);
      brandCarouselRef.current.style.scrollBehavior = "auto";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !brandCarouselRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = x - startX;
    const maxScroll =
      brandCarouselRef.current.scrollWidth -
      brandCarouselRef.current.clientWidth;
    const newScrollLeft = Math.max(0, Math.min(walk, maxScroll));
    brandCarouselRef.current.scrollLeft = newScrollLeft;
  };

  const handleMouseUp = () => {
    if (brandCarouselRef.current) {
      setIsDragging(false);
      brandCarouselRef.current.style.scrollBehavior = "smooth";
    }
  };

  useEffect(() => {
    const element = brandWrapperRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (element) observer.observe(element);
    return () => element && observer.unobserve(element);
  }, []);

  useEffect(() => {
    let animationFrameId;
    const animateBrands = () => {
      if (brandCarouselRef.current && !isHovered && !isDragging && isInView) {
        brandCarouselRef.current.scrollLeft += 1;
        if (
          brandCarouselRef.current.scrollLeft >=
          brandCarouselRef.current.scrollWidth / 2
        ) {
          brandCarouselRef.current.scrollLeft = 0;
        }
        animationFrameId = requestAnimationFrame(animateBrands);
      }
    };
    if (!isHovered && !isDragging && isInView) {
      animationFrameId = requestAnimationFrame(animateBrands);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, isInView]);

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

  // CHẶN SCROLL TRÊN MOBILE
  useEffect(() => {
    const preventScroll = (e) => {
      if (
        productsContainerRef.current?.contains(e.target) ||
        bestSellingContainerRef.current?.contains(e.target)
      ) {
        e.preventDefault();
      }
    };

    const options = { passive: false };
    document.addEventListener("touchmove", preventScroll, options);
    return () =>
      document.removeEventListener("touchmove", preventScroll, options);
  }, []);

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView
  );
  if (visibleProducts.length < itemsPerView && products.length > 0) {
    const remainingCount = itemsPerView - visibleProducts.length;
    visibleProducts.push(...products.slice(0, remainingCount));
  }

  const visibleBestSelling = bestSellingProducts.slice(
    bestSellingIndex,
    bestSellingIndex + itemsPerView
  );
  if (
    visibleBestSelling.length < itemsPerView &&
    bestSellingProducts.length > 0
  ) {
    const remainingCount = itemsPerView - visibleBestSelling.length;
    visibleBestSelling.push(...bestSellingProducts.slice(0, remainingCount));
  }

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="home-container">
        <div className="glasses-long-panel-section">
          <img
            src="/glasses_long_panel.jpg"
            alt="Glasses Long Panel Advertisement"
            className="glasses-long-panel-img"
            loading="lazy"
          />
        </div>

        <div
          className="ub-unique-brands-section"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="ub-brands-container" ref={brandWrapperRef}>
            <h2 className="ub-title">Phân phối các thương hiệu độc quyền</h2>
            <div className="ub-brand-carousel-wrapper">
              <div
                className={`ub-brand-carousel ${
                  isHovered || isDragging || !isInView ? "paused" : ""
                }`}
                ref={brandCarouselRef}
              >
                {[...uniqueBrands, ...uniqueBrands].map((ub, index) => (
                  <div key={index} className="ub-brand-item">
                    <img
                      src={ub.image_url}
                      alt={`${ub.brand_name} logo`}
                      className="ub-brand-logo"
                      loading="lazy"
                    />
                    <div className="ub-brand-view-more-btn">
                      <Link
                        to={`/products/all?brand=${encodeURIComponent(
                          ub.brand_name
                        )}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Button className="ub-brand-view-more-text">
                          Xem thêm
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2
          id="new-collection"
          className="home-title underlined-title my-4"
          style={{ "--underline-step": `${underlineStep}%` }}
        >
          Sản phẩm nổi bật
        </h2>
        <div className="carousel-wrapper">
          <button className="carousel-button left" onClick={scrollLeft}>
            <FaChevronLeft />
          </button>
          <div
            className="products-container no-scroll"
            ref={productsContainerRef}
          >
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="product-item clickable"
                onClick={() => handleProductClick(product)}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button className="carousel-button right" onClick={scrollRight}>
            <FaChevronRight />
          </button>
        </div>

        <div className="image-section">
          <div className="image-overlay">
            <div className="image-container">
              <div className="image-text below-image1">Hiện đại</div>
              <img
                src="/image1.png"
                alt="Image 1"
                className="angled-image image1"
                loading="lazy"
              />
              <div className="image-text between-images">&</div>
              <div className="image-text above-image2">Độc đáo</div>
              <img
                src="/image2.png"
                alt="Image 2"
                className="angled-image image2"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <h2
          id="best-selling"
          className="home-title underlined-title my-4"
          style={{ "--underline-step": `${underlineStep}%` }}
        >
          Sản Phẩm Bán Chạy
        </h2>
        <div className="carousel-wrapper">
          <button
            className="carousel-button left"
            onClick={scrollBestSellingLeft}
          >
            <FaChevronLeft />
          </button>
          <div
            className="products-container no-scroll"
            ref={bestSellingContainerRef}
          >
            {visibleBestSelling.map((product) => (
              <div
                key={product.id}
                className="product-item clickable"
                onClick={() => handleProductClick(product)}
              >
                <BestSellingCard product={product} />
              </div>
            ))}
          </div>
          <button
            className="carousel-button right"
            onClick={scrollBestSellingRight}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="all-products-home-btn">
          <Link to="/products/all" style={{ textDecoration: "none" }}>
            <Button className="all-products-home-text">
              Tất cả sản phẩm <ArrowRight />
            </Button>
          </Link>
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

export default Home;
