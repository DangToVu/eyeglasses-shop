import { useState, useEffect, useRef } from "react";
import { Container, Row, Button } from "react-bootstrap";
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
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
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
        setBestSellingProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm bán chạy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const maxSteps = Math.max(products.length - 4, 0);
    setUnderlineStep(
      Math.min((currentIndex / (products.length > 4 ? maxSteps : 1)) * 100, 100)
    );
  }, [currentIndex, products.length]);

  useEffect(() => {
    const maxSteps = Math.max(bestSellingProducts.length - 4, 0);
    setUnderlineStep(
      Math.min(
        (bestSellingIndex / (bestSellingProducts.length > 4 ? maxSteps : 1)) *
          100,
        100
      )
    );
  }, [bestSellingIndex, bestSellingProducts.length]);

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
    const threshold = 50; // Ngưỡng vuốt (pixel) để xác định cuộn

    if (Math.abs(touchDiff) > threshold) {
      if (isBestSelling) {
        if (touchDiff > 0) {
          scrollBestSellingRight();
        } else {
          scrollBestSellingLeft();
        }
      } else {
        if (touchDiff > 0) {
          scrollRight();
        } else {
          scrollLeft();
        }
      }
    }
    setTouchStart(0);
    setTouchMove(0);
  };

  // Hiển thị 4 thẻ, bắt đầu từ currentIndex
  const visibleProducts = products.slice(currentIndex, currentIndex + 4);
  if (visibleProducts.length < 4 && products.length > 0) {
    const remainingCount = 4 - visibleProducts.length;
    visibleProducts.push(...products.slice(0, remainingCount));
  }

  const visibleBestSelling = bestSellingProducts.slice(
    bestSellingIndex,
    bestSellingIndex + 4
  );
  if (visibleBestSelling.length < 4 && bestSellingProducts.length > 0) {
    const remainingCount = 4 - visibleBestSelling.length;
    visibleBestSelling.push(...bestSellingProducts.slice(0, remainingCount));
  }

  // Logic cho carousel thương hiệu
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
  useEffect(() => {
    let animationFrameId;
    const animateBrands = () => {
      if (brandCarouselRef.current) {
        let currentPosition = brandCarouselRef.current.style.transform
          ? parseInt(brandCarouselRef.current.style.transform.split("(")[1]) ||
            0
          : 0;
        const newPosition = currentPosition - 1;
        const maxScroll =
          brandCarouselRef.current.scrollWidth -
          brandCarouselRef.current.clientWidth;
        if (newPosition <= -maxScroll) {
          brandCarouselRef.current.style.transform = `translateX(0px)`;
        } else {
          brandCarouselRef.current.style.transform = `translateX(${newPosition}px)`;
        }
        animationFrameId = requestAnimationFrame(animateBrands);
      }
    };
    animationFrameId = requestAnimationFrame(animateBrands);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="home-container">
        {/* Phân phối các thương hiệu độc quyền - Đặt lên trên */}
        <div className="ub-unique-brands-section">
          <div className="ub-brands-container">
            <h2 className="ub-title">Phân phối các thương hiệu độc quyền</h2>
            <div className="ub-brand-carousel-wrapper">
              <div className="ub-brand-carousel" ref={brandCarouselRef}>
                {[...brands, ...brands].map((brand, index) => (
                  <div key={index} className="ub-brand-item">
                    <img
                      src={`/logos/${brand
                        .toLowerCase()
                        .replace(/\./g, "")}.jpg`}
                      alt={`${brand} logo`}
                      className="ub-brand-logo"
                    />
                    <div className="ub-brand-view-more-btn">
                      <Link
                        to={`/products/all?brand=${encodeURIComponent(brand)}`} // Thêm query string cho brand
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
              />
              <div className="image-text between-images">&</div>
              <div className="image-text above-image2">Độc đáo</div>
              <img
                src="/image2.png"
                alt="Image 2"
                className="angled-image image2"
              />
            </div>
          </div>
        </div>

        <h2
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
