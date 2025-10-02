import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import { toast } from "react-toastify";
import Header from "../components/Header";

function FavoriteProduct() {
  const { userRole, isLoading } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!userRole) {
      toast.error("Vui lòng đăng nhập để truy cập sản phẩm ưu thích!");
      navigate("/login");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <>
      <Header />
      <div className="favorite-product">
        <h1>Sản phẩm ưu thích</h1>
      </div>
    </>
  );
}

export default FavoriteProduct;
