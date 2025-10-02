import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import { toast } from "react-toastify";
import Header from "../components/Header";

function UserProfile() {
  const { userRole, isLoading } = useAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!userRole || userRole !== "customer") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [userRole, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <>
      <Header />
      <div className="user-profile">
        <h1>Hồ sơ người dùng</h1>
      </div>
    </>
  );
}

export default UserProfile;
