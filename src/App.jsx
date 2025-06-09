import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CardManagement from "./pages/CardManagement.jsx"; // Thêm CardManagement
import Login from "./pages/Login.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card-management" element={<CardManagement />} />
        <Route path="/login" element={<Login />} />
        {/* Loại bỏ hoặc giữ /admin nếu cần */}
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} closeOnClick />
    </div>
  );
}

export default App;
