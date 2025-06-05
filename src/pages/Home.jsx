import { useState, useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import axios from "axios";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Import biểu tượng mũi tên
import "../styles/pages/Home.css"; // Import CSS

function Home() {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Theo dõi chỉ số thẻ đầu tiên
  const productsContainerRef = useRef(null); // Tham chiếu đến container sản phẩm

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
    fetchProducts();
  }, []);

  // Hàm cuộn sang trái (1 thẻ)
  const scrollLeft = () => {
    if (productsContainerRef.current && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const cardWidth = 296; // 17.5rem + 1rem gap = 18.5rem ≈ 296px (1rem = 16px)
      productsContainerRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Hàm cuộn sang phải (1 thẻ)
  const scrollRight = () => {
    if (productsContainerRef.current && currentIndex < products.length - 4) {
      // Chỉ cuộn nếu còn thẻ để hiển thị
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const cardWidth = 296; // 17.5rem + 1rem gap = 18.5rem ≈ 296px
      productsContainerRef.current.scrollTo({
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
      </Container>
      <Footer />
    </div>
  );
}

export default Home;
