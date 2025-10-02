import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CardManagement from "./pages/CardManagement.jsx";
import Login from "./pages/Login.jsx";
import RegularProducts from "./pages/RegularProducts.jsx";
import BestSellingProducts from "./pages/BestSellingProducts.jsx";
import AllProducts from "./pages/AllProducts.jsx";
import AllProductsCustomer from "./pages/AllProductsCustomer.jsx";
import SignUp from "./pages/SignUp.jsx";
import NotFound404 from "./pages/NotFound404.jsx";
import AuthGuard from "./guards/AuthGuard.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import FavoriteProduct from "./pages/FavoriteProduct.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/products/all" element={<AllProductsCustomer />} />
        <Route path="/favorite-products" element={<FavoriteProduct />} />
        <Route element={<AuthGuard />}>
          <Route path="/card-management" element={<CardManagement />} />
          <Route path="/products/regular" element={<RegularProducts />} />
          <Route
            path="/products/best-selling"
            element={<BestSellingProducts />}
          />
          <Route path="/products/all-management" element={<AllProducts />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
        </Route>
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} closeOnClick />
    </div>
  );
}

export default App;
