import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CardManagement from "./pages/CardManagement.jsx";
import Login from "./pages/Login.jsx";
import RegularProducts from "./pages/RegularProducts.jsx";
import BestSellingProducts from "./pages/BestSellingProducts.jsx";
import AllProducts from "./pages/AllProducts.jsx";
import AuthGuard from "./guards/AuthGuard.jsx"; // Import AuthGuard
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Trang công khai */}
        <Route path="/login" element={<Login />} /> {/* Trang công khai */}
        <Route path="/products/all" element={<AllProducts />} />{" "}
        {/* Trang công khai */}
        {/* Route bảo vệ bằng AuthGuard */}
        <Route element={<AuthGuard />}>
          <Route path="/card-management" element={<CardManagement />} />
          <Route path="/products/regular" element={<RegularProducts />} />
          <Route
            path="/products/best-selling"
            element={<BestSellingProducts />}
          />
        </Route>
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} closeOnClick />
    </div>
  );
}

export default App;
