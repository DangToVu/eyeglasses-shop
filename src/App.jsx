import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CardManagement from "./pages/CardManagement.jsx";
import Login from "./pages/Login.jsx";
import RegularProducts from "./pages/RegularProducts.jsx";
import BestSellingProducts from "./pages/BestSellingProducts.jsx";
import AllProducts from "./pages/AllProducts.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card-management" element={<CardManagement />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/regular" element={<RegularProducts />} />
        <Route
          path="/products/best-selling"
          element={<BestSellingProducts />}
        />
        <Route path="/products/all" element={<AllProducts />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} closeOnClick />
    </div>
  );
}

export default App;
