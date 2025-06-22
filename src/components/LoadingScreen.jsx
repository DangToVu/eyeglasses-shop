import React from "react";
import "../styles/components/LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-wave">
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
        <div className="wave-bar"></div>
      </div>
      <p className="loading-text">Đang tải, vui lòng chờ...</p>
    </div>
  );
};

export default LoadingScreen;
