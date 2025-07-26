import { useState, useEffect, useRef } from "react";
import { Container, Button } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import BestSellingCard from "../components/BestSellingCard.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/pages/Home.css";
import LoadingScreen from "../components/LoadingScreen";

function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const productsContainerRef = useRef(null);
  const bestSellingContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bestSellingIndex, setBestSellingIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [underlineStep, setUnderlineStep] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchMove, setTouchMove] = useState(0);
  const brandCarouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const brandWrapperRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth <= 1199) {
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
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        setProducts(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setProducts([]);
      }

      try {
        const response = await axios.get(
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
        setBestSellingProducts(response.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm bán chạy:", error);
        setBestSellingProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
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

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (isBestSelling) => {
    const touchDiff = touchStart - touchMove;
    const threshold = 50;

    if (Math.abs(touchDiff) > threshold) {
      if (isBestSelling) {
        if (touchDiff > 0) scrollBestSellingRight();
        else scrollBestSellingLeft();
      } else {
        if (touchDiff > 0) scrollRight();
        else scrollLeft();
      }
    }
    setTouchStart(0);
    setTouchMove(0);
  };

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

  const brands = [
    "FEMINA",
    "KIEINMONSTES",
    "VE",
    "WINNER",
    "DIVEI",
    "ROGERSON",
    "G.M.Surne",
    "AVALON",
    "RUBERTY",
  ];

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
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
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

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="home-container">
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
                {[...brands, ...brands].map((brand, index) => (
                  <div key={index} className="ub-brand-item">
                    <img
                      src={`/logos/${brand
                        .toLowerCase()
                        .replace(/\./g, "")}.jpg`}
                      alt={`${brand} logo`}
                      className="ub-brand-logo"
                      loading="lazy" // Thêm lazy loading
                    />
                    <div className="ub-brand-view-more-btn">
                      <Link
                        to={`/products/all?brand=${encodeURIComponent(brand)}`}
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
          Bộ sưu tập mới nhất
        </h2>
        <div className="carousel-wrapper">
          <button className="carousel-button left" onClick={scrollLeft}>
            <FaChevronLeft />
          </button>
          <div
            className="products-container"
            ref={productsContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(false)}
          >
            {visibleProducts.map((product) => (
              <div key={product.id} className="product-item">
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
                loading="lazy" // Thêm lazy loading
              />
              <div className="image-text between-images">&</div>
              <div className="image-text above-image2">Độc đáo</div>
              <img
                src="/image2.png"
                alt="Image 2"
                className="angled-image image2"
                loading="lazy" // Thêm lazy loading
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
            className="products-container"
            ref={bestSellingContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(true)}
          >
            {visibleBestSelling.map((product) => (
              <div key={product.id} className="product-item">
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
      <Footer />
    </div>
  );
}

export default Home;
