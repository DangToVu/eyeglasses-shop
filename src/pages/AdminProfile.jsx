import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import { toast } from "react-toastify";
import Header from "../components/Header";

function AdminProfile() {
  const { userRole, isLoading } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!userRole || userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <>
      <Header />
      <div className="admin-profile">
        <h1>Hồ sơ quản trị viên</h1>
      </div>
    </>
  );
}

export default AdminProfile;
