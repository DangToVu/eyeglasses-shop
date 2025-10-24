/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/components/modals/ProductDetailModal.css";

const formatPrice = (price) =>
  price === Infinity
    ? "Không giới hạn"
    : price.toLocaleString("vi-VN") + " VND";

function ProductDetailModal({ show, onHide, product }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // UI: 1 hoặc 2
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const imageRef = useRef(null);
  const fullScreenImageRef = useRef(null);
  const containerRef = useRef(null);

  // === CHUYỂN Đ, HIỂN THỊ x2 NHƯNG THỰC TẾ x2.5 ===
  const ACTUAL_ZOOM_LEVEL = zoomLevel === 1 ? 1 : 2.5;

  // === ZOOM VÀO GIỮA ẢNH ===
  useEffect(() => {
    if (!isFullScreen || !containerRef.current || !fullScreenImageRef.current)
      return;

    const container = containerRef.current;
    const img = fullScreenImageRef.current;

    const updateCenteredZoom = () => {
      const containerRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;

      const currentCenterX = imgRect.width / 2 + position.x * ACTUAL_ZOOM_LEVEL;
      const currentCenterY =
        imgRect.height / 2 + position.y * ACTUAL_ZOOM_LEVEL;

      const offsetX = centerX - currentCenterX;
      const offsetY = centerY - currentCenterY;

      setPosition((prev) => ({
        x: prev.x + offsetX / ACTUAL_ZOOM_LEVEL,
        y: prev.y + offsetY / ACTUAL_ZOOM_LEVEL,
      }));
    };

    updateCenteredZoom();
  }, [zoomLevel, isFullScreen, ACTUAL_ZOOM_LEVEL]);

  // Reset khi zoom về 1
  useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // === CHẶN SCROLL / VUỐT TRANG KHI FULLSCREEN ===
  useEffect(() => {
    if (!isFullScreen) return;

    const preventScroll = (e) => e.preventDefault();

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScroll);
    };
  }, [isFullScreen]);

  const checkFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const expiresAt = parseInt(localStorage.getItem("token_expires_at"));
      if (expiresAt && Date.now() > expiresAt) {
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
      if (!userId) return;

      const favoriteResponse = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/favorites?user_id=eq.${userId}&product_id=eq.${
          product.id
        }&table_name=eq.${product.table || "products"}&select=*`,
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
    if (!show || !product) return;
    checkFavorite();
    const handleFavoriteToggled = (event) => {
      const { productId, tableName } = event.detail;
      if (
        productId === product.id &&
        tableName === (product.table || "products")
      ) {
        checkFavorite();
      }
    };
    window.addEventListener("favoriteToggled", handleFavoriteToggled);
    return () =>
      window.removeEventListener("favoriteToggled", handleFavoriteToggled);
  }, [product, show]);

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
          }&table_name=eq.${product.table || "products"}`,
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
            table_name: product.table || "products",
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
      window.dispatchEvent(
        new CustomEvent("favoriteToggled", {
          detail: {
            productId: product.id,
            tableName: product.table || "products",
          },
        })
      );
    } catch (error) {
      console.error("Error toggling favorite:", error.message);
      toast.error("Lỗi khi xử lý yêu thích: " + error.message);
    }
  };

  if (!product || !show) return null;

  const handleImageClick = () => {
    setIsFullScreen(true);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCloseFullScreen = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsFullScreen(false);
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(2); // UI: x2
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1); // UI: x1
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      const x = e.clientX - startPos.x;
      const y = e.clientY - startPos.y;
      setPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      const x = e.touches[0].clientX - startPos.x;
      const y = e.touches[0].clientY - startPos.y;
      setPosition({ x, y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const productType = product.type || product.product_type || "N/A";

  const transformStyle = {
    transform: `scale(${ACTUAL_ZOOM_LEVEL}) translate(${position.x}px, ${position.y}px)`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.25s ease-out",
    cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
  };

  return createPortal(
    <div className="pdm-modal-overlay">
      <div className="pdm-modal-content-wrapper">
        <div className="pdm-modal-header">
          <div className="pdm-modal-title-container">
            <h2 className="pdm-modal-title">{product.name}</h2>
            <div
              className="pdm-modal-heart-icon"
              onClick={handleFavoriteToggle}
            >
              {isFavorite ? <BiSolidHeart /> : <BiHeart />}
            </div>
          </div>
          <button className="pdm-modal-close-button" onClick={onHide}>
            ×
          </button>
        </div>
        <div className="pdm-modal-body">
          <div className="pdm-modal-content-container">
            <div className="pdm-modal-image-section">
              <img
                ref={imageRef}
                src={product.image_url || "/placeholder-image.jpg"}
                alt={product.name}
                className="pdm-modal-product-image"
                onClick={handleImageClick}
                loading="lazy"
              />
            </div>
            <div className="pdm-modal-details-section">
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Mã sản phẩm</h3>
                <p className="pdm-detail-text">{product.product_id || "N/A"}</p>
              </div>
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Giá</h3>
                <p className="pdm-detail-text">{formatPrice(product.price)}</p>
              </div>
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Loại hàng</h3>
                <p className="pdm-detail-text">{productType}</p>
              </div>
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Mô tả</h3>
                <p className="pdm-detail-text">
                  {product.description || "Không có mô tả"}
                </p>
              </div>
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Thương hiệu</h3>
                <p className="pdm-detail-text">{product.brand || "N/A"}</p>
              </div>
              <div className="pdm-detail-item">
                <h3 className="pdm-detail-title">Chất liệu</h3>
                <p className="pdm-detail-text">{product.material || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN ZOOM - HIỂN THỊ x2, THỰC TẾ x2.5 */}
      {isFullScreen && (
        <div
          className="pdm-full-screen-overlay"
          onClick={handleCloseFullScreen}
        >
          <div
            ref={containerRef}
            className="pdm-full-screen-image-container"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={fullScreenImageRef}
              src={product.image_url || "/placeholder-image.jpg"}
              alt={product.name}
              style={transformStyle}
            />
            <div className="pdm-zoom-controls">
              <button
                className="pdm-zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
                disabled={zoomLevel === 1}
              >
                −
              </button>
              <span className="pdm-zoom-label">Zoom x{zoomLevel}</span>
              <button
                className="pdm-zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
                disabled={zoomLevel === 2}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

export default ProductDetailModal;
