import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/components/ProductDetailModal.css";

const formatPrice = (price) =>
  price === Infinity
    ? "Không giới hạn"
    : price.toLocaleString("vi-VN") + " VND";

function ProductDetailModal({ show, onHide, product }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const fullScreenImageRef = useRef(null);
  const containerRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (isFullScreen && containerRef.current) {
      // Reset position to top-left when changing zoom level (default zoom behavior)
      setPosition({ x: 0, y: 0 });
    }

    // Disable page scrolling when full-screen is open
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup to re-enable scrolling when component unmounts or full-screen closes
    return () => {
      if (!isFullScreen) {
        document.body.style.overflow = "";
      }
    };
  }, [zoomLevel, isFullScreen]);

  if (!product || !show) return null;

  const handleOverlayClick = (e) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target)
    ) {
      onHide();
    }
    if (
      isFullScreen &&
      containerRef.current &&
      !containerRef.current.contains(e.target)
    ) {
      setIsFullScreen(false);
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

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
    setZoomLevel((prev) => Math.min(prev + 1, 4));
    // Position is reset to top-left in useEffect
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 1));
    // Position is reset to top-left in useEffect
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1 && isFullScreen && containerRef.current) {
      e.preventDefault();
      const dx = (e.clientX - startPos.x) / zoomLevel; // Adjust for zoom level
      const dy = (e.clientY - startPos.y) / zoomLevel;
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPos({ x: e.clientX, y: e.clientY }); // Update start position for continuous drag
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1 && isFullScreen) {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoomLevel > 1 && isFullScreen && containerRef.current) {
      e.preventDefault();
      const dx = (e.touches[0].clientX - startPos.x) / zoomLevel;
      const dy = (e.touches[0].clientY - startPos.y) / zoomLevel;
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content-wrapper" ref={modalContentRef}>
        <div className="modal-header">
          <h2 className="modal-title">{product.name}</h2>
          <button className="modal-close-button" onClick={onHide}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-content-container">
            <div className="modal-image-section">
              <img
                ref={imageRef}
                src={product.image_url || "/placeholder-image.jpg"}
                alt={product.name}
                className="modal-product-image"
                onClick={handleImageClick}
                loading="lazy"
              />
            </div>
            <div className="modal-details-section">
              <div className="detail-item">
                <h3 className="detail-title">Mã sản phẩm</h3>
                <p className="detail-text">{product.product_id || "N/A"}</p>
              </div>
              <div className="detail-item">
                <h3 className="detail-title">Giá</h3>
                <p className="detail-text">{formatPrice(product.price)}</p>
              </div>
              <div className="detail-item">
                <h3 className="detail-title">Mô tả</h3>
                <p className="detail-text">
                  {product.description || "Không có mô tả"}
                </p>
              </div>
              <div className="detail-item">
                <h3 className="detail-title">Thương hiệu</h3>
                <p className="detail-text">{product.brand || "N/A"}</p>
              </div>
              <div className="detail-item">
                <h3 className="detail-title">Chất liệu</h3>
                <p className="detail-text">{product.material || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFullScreen && (
        <div className="full-screen-overlay" onClick={handleCloseFullScreen}>
          <div
            ref={containerRef}
            className="full-screen-image-container"
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
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: "0 0", // Default zoom from top-left
                cursor: isFullScreen
                  ? zoomLevel > 1
                    ? "url(/minus-cursor.png), auto"
                    : "url(/plus-cursor.png), auto"
                  : "zoom-in",
              }}
            />
            <div className="zoom-controls">
              <button
                className="zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
              >
                -
              </button>
              <span className="zoom-label">Zoom x{zoomLevel}</span>
              <button
                className="zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
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
