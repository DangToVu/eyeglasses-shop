import { useState, useEffect, useRef } from "react";
import { Container, Row, Button } from "react-bootstrap";
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

  const scrollLeft = () => {
    if (productsContainerRef.current && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const cardWidth = 296;
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

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
      {isLoading && <LoadingScreen />}
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

        <div className="my-4 text-center">
          <Link to="/products/all">
            <Button variant="primary" size="lg" className="w-100">
              Tất cả sản phẩm
            </Button>
          </Link>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default Home;
