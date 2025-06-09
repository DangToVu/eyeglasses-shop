import { useState, useEffect, useRef } from "react";
import { Container, Row } from "react-bootstrap";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import BestSellingCard from "../components/BestSellingCard.jsx"; // Import component mới
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/pages/Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const productsContainerRef = useRef(null);
  const bestSellingContainerRef = useRef(null); // Tham chiếu cho carousel bán chạy
  const [currentIndex, setCurrentIndex] = useState(0); // Cho Bộ sưu tập mới nhất
  const [bestSellingIndex, setBestSellingIndex] = useState(0); // Cho Sản phẩm bán chạy

  useEffect(() => {
    const fetchProducts = async () => {
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
    };

    const fetchBestSellingProducts = async () => {
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
        setBestSellingProducts(response.data); // Lấy toàn bộ sản phẩm, loại bỏ slice(0, 4)
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm bán chạy:", error);
      }
    };

    fetchProducts();
    fetchBestSellingProducts();
  }, []);

  // Hàm cuộn sang trái cho Bộ sưu tập mới nhất
  const scrollLeft = () => {
    if (productsContainerRef.current && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const cardWidth = 296; // 17.5rem + 1rem gap = 18.5rem ≈ 296px
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Hàm cuộn sang phải cho Bộ sưu tập mới nhất
  const scrollRight = () => {
    if (productsContainerRef.current && currentIndex < products.length - 4) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const cardWidth = 296;
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Hàm cuộn sang trái cho Sản phẩm bán chạy
  const scrollBestSellingLeft = () => {
    if (bestSellingContainerRef.current && bestSellingIndex > 0) {
      const newIndex = bestSellingIndex - 1;
      setBestSellingIndex(newIndex);
      const cardWidth = 296;
      bestSellingContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Hàm cuộn sang phải cho Sản phẩm bán chạy
  const scrollBestSellingRight = () => {
    if (
      bestSellingContainerRef.current &&
      bestSellingIndex < bestSellingProducts.length - 4
    ) {
      const newIndex = bestSellingIndex + 1;
      setBestSellingIndex(newIndex);
      const cardWidth = 296;
      bestSellingContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <Container className="home-container">
        <h2 className="home-title my-4">Bộ sưu tập mới nhất</h2>
        <div className="carousel-wrapper">
          <button
            className="carousel-button left"
            onClick={scrollLeft}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <div className="products-container" ref={productsContainerRef}>
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <button
            className="carousel-button right"
            onClick={scrollRight}
            disabled={currentIndex >= products.length - 4}
          >
            <FaChevronRight />
          </button>
        </div>

        <h2 className="home-title my-4">Sản Phẩm Bán Chạy Nhất</h2>
        <div className="carousel-wrapper">
          <button
            className="carousel-button left"
            onClick={scrollBestSellingLeft}
            disabled={bestSellingIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <div className="products-container" ref={bestSellingContainerRef}>
            {bestSellingProducts.map((product) => (
              <div key={product.id} className="product-item">
                <BestSellingCard product={product} />
              </div>
            ))}
          </div>
          <button
            className="carousel-button right"
            onClick={scrollBestSellingRight}
            disabled={bestSellingIndex >= bestSellingProducts.length - 4}
          >
            <FaChevronRight />
          </button>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default Home;
