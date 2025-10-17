/* eslint-disable react-hooks/exhaustive-deps */
import { Card } from "react-bootstrap";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "../../styles/components/cards/BestSellingCard.css";

function BestSellingCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const expiresAt = parseInt(localStorage.getItem("token_expires_at"));
      if (expiresAt && Date.now() > expiresAt) {
        console.log("Token expired at:", new Date(expiresAt));
        localStorage.removeItem("token");
        localStorage.removeItem("token_expires_at");
        localStorage.removeItem("refresh_token");
        return;
      }

      const userResponse = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userId = userResponse.data.id;
      if (!userId) {
        console.log("No user found in session");
        return;
      }

      const favoriteResponse = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/favorites?user_id=eq.${userId}&product_id=eq.${
          product.id
        }&table_name=eq.${product.table || "best_selling_glasses"}&select=*`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsFavorite(favoriteResponse.data.length > 0);
    } catch (error) {
      console.error("Error checking favorite:", error.message);
    }
  };

  useEffect(() => {
    checkFavorite();

    const handleFavoriteToggled = (event) => {
      const { productId, tableName } = event.detail;
      if (
        productId === product.id &&
        tableName === (product.table || "best_selling_glasses")
      ) {
        checkFavorite();
      }
    };

    window.addEventListener("favoriteToggled", handleFavoriteToggled);
    return () =>
      window.removeEventListener("favoriteToggled", handleFavoriteToggled);
  }, [product.id, product.table]);

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
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
      const userEmail = userResponse.data.email;
      if (!userId) {
        toast.error("Bạn cần đăng nhập để sử dụng chức năng này!");
        return;
      }

      if (!product.id || !product.name) {
        toast.error("Thông tin sản phẩm không hợp lệ!");
        return;
      }

      if (isFavorite) {
        await axios.delete(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/favorites?user_id=eq.${userId}&product_id=eq.${
            product.id
          }&table_name=eq.${product.table || "best_selling_glasses"}`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setIsFavorite(false);
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/favorites`,
          {
            user_id: userId,
            email: userEmail,
            product_name: product.name,
            product_id: product.id,
            product_code: product.product_id || null,
            table_name: product.table || "best_selling_glasses",
          },
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setIsFavorite(true);
        toast.success("Đã thêm sản phẩm vào danh sách yêu thích!");
      }

      // Phát sự kiện để thông báo trạng thái yêu thích đã thay đổi
      window.dispatchEvent(
        new CustomEvent("favoriteToggled", {
          detail: {
            productId: product.id,
            tableName: product.table || "best_selling_glasses",
          },
        })
      );
    } catch (error) {
      console.error("Error toggling favorite:", error.message);
      toast.error("Lỗi khi xử lý yêu thích: " + error.message);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Card className="best-card">
      <Card.Img
        variant="top"
        src={product.image_url}
        alt={product.name}
        className="best-img"
        loading="lazy"
      />
      <Card.Body className="best-body">
        <div className="title-with-heart">
          <Card.Title className="best-title">{product.name}</Card.Title>
          <div className="heart-icon" onClick={handleFavoriteToggle}>
            {isFavorite ? <BiSolidHeart /> : <BiHeart />}
          </div>
        </div>
        <Card.Text className="best-text">
          Thương hiệu: {product.brand || "-"}
          <br />
          Mã sản phẩm: {product.product_id || "-"}
          {product.price !== null && (
            <>
              <br />
              Giá: {formatCurrency(product.price)}
            </>
          )}
          <br />
          Chất liệu: {product.material || "-"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default BestSellingCard;
