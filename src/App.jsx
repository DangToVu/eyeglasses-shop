import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CardManagement from "./pages/CardManagement.jsx";
import Login from "./pages/Login.jsx";
import RegularProducts from "./pages/RegularProducts.jsx"; // Import trang mới
import BestSellingProducts from "./pages/BestSellingProducts.jsx"; // Import trang mới
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card-management" element={<CardManagement />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/regular" element={<RegularProducts />} />{" "}
        {/* Route mới */}
        <Route
          path="/products/best-selling"
          element={<BestSellingProducts />}
        />{" "}
        {/* Route mới */}
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} closeOnClick />
    </div>
  );
}

export default App;
