import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AllProductCard from "../components/AllProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import "../styles/pages/FavoriteProduct.css";

function FavoriteProduct() {
  const { userRole, isLoading } = useAuthCheck();
  const [favorites, setFavorites] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để truy cập sản phẩm yêu thích!");
        return;
      }

      const expiresAt = parseInt(localStorage.getItem("token_expires_at"));
      if (expiresAt && Date.now() > expiresAt) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires_at");
          localStorage.removeItem("refresh_token");
          return;
        }

        const refreshResponse = await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/auth/v1/token?grant_type=refresh_token`,
          { refresh_token: refreshToken },
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { access_token, refresh_token, expires_in } =
          refreshResponse.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem(
          "token_expires_at",
          Date.now() + expires_in * 1000
        );
      }

      const userResponse = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userId = userResponse.data.id;
      if (!userId) {
        toast.error("Vui lòng đăng nhập để truy cập sản phẩm yêu thích!");
        return;
      }
      console.log("Fetching favorites for userId:", userId);

      const favoriteResponse = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/favorites?user_id=eq.${userId}&select=product_id,table_name`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const favoriteProducts = [];
      for (const fav of favoriteResponse.data) {
        const { product_id, table_name } = fav;
        const productResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/${table_name}?id=eq.${product_id}&select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (productResponse.data && productResponse.data.length > 0) {
          favoriteProducts.push({
            ...productResponse.data[0],
            table: table_name,
          });
        }
      }
      setFavorites(favoriteProducts);
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      toast.error("Lỗi khi lấy danh sách yêu thích: " + error.message);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!userRole) {
      toast.error("Vui lòng đăng nhập để truy cập sản phẩm yêu thích!");
      return;
    }
    fetchFavorites();

    const handleFavoriteToggled = () => {
      fetchFavorites();
    };

    window.addEventListener("favoriteToggled", handleFavoriteToggled);
    return () =>
      window.removeEventListener("favoriteToggled", handleFavoriteToggled);
  }, [userRole, isLoading]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  if (isLoading) return null;

  return (
    <>
      <Header />
      <Container className="favorite-product">
        <h1>Sản phẩm yêu thích</h1>
        {favorites.length === 0 ? (
          <div className="no-favorites">Chưa có sản phẩm yêu thích nào 😢</div>
        ) : (
          <div className="favorite-cards">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="favorite-card-item"
                onClick={() => handleProductClick(product)}
              >
                <AllProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </Container>
      <ProductDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
      />
      <Footer />
    </>
  );
}

export default FavoriteProduct;
