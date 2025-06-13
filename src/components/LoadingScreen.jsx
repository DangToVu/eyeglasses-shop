import React from "react";
import "../styles/components/LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-text">Đang tải, vui lòng chờ...</p>
    </div>
  );
};

export default LoadingScreen;
