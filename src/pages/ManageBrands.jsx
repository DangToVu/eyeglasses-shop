import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import ConfirmBox from "../components/ConfirmBox.jsx";
import "../styles/pages/ManageBrands.css";
import LoadingScreen from "../components/LoadingScreen";

function ManageBrands() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", image_url: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`,
          { headers }
        );
        setBrands(response.data);
      } catch (error) {
        toast.error("Lỗi khi lấy danh sách thương hiệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchBrands();
    }
  }, [userRole]);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      const headers = {
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split(".")[1])).sub;
      await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`,
        {
          name: formData.name,
          image_url: formData.image_url || null,
          created_by: userId,
        },
        { headers }
      );
      toast.success("Thêm thương hiệu thành công!");
      setFormData({ name: "", image_url: "" });
      setShowModal(false);
      const response = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`,
        { headers }
      );
      setBrands(response.data);
    } catch (error) {
      toast.error("Lỗi khi thêm thương hiệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      const headers = {
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      await axios.patch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands?id=eq.${
          currentBrand.id
        }`,
        { name: formData.name, image_url: formData.image_url || null },
        { headers }
      );
      const tables = ["products", "best_selling_glasses", "all_product"];
      await Promise.all(
        tables.map((table) =>
          axios.patch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?brand=eq.${
              currentBrand.name
            }`,
            { brand: formData.name },
            { headers }
          )
        )
      );
      toast.success("Cập nhật thương hiệu thành công!");
      setFormData({ name: "", image_url: "" });
      setShowModal(false);
      setCurrentBrand(null);
      const response = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`,
        { headers }
      );
      setBrands(response.data);
    } catch (error) {
      toast.error("Lỗi khi cập nhật thương hiệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const headers = {
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const tables = ["products", "best_selling_glasses", "all_product"];
      await Promise.all(
        tables.map((table) =>
          axios.patch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?brand=eq.${
              brandToDelete.name
            }`,
            { brand: null },
            { headers }
          )
        )
      );
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands?id=eq.${
          brandToDelete.id
        }`,
        { headers }
      );
      toast.success("Xóa thương hiệu thành công!");
      setBrands(brands.filter((b) => b.id !== brandToDelete.id));
    } catch (error) {
      toast.error("Lỗi khi xóa thương hiệu: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setBrandToDelete(null);
    }
  };

  const openModal = (brand = null) => {
    setCurrentBrand(brand);
    setFormData({
      name: brand ? brand.name : "",
      image_url: brand ? brand.image_url || "" : "",
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setFormData({ name: "", image_url: "" });
    setCurrentBrand(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentBrand) {
      await handleEdit();
    } else {
      await handleAdd();
    }
  };

  const confirmDelete = (brand) => {
    setBrandToDelete(brand);
    setShowConfirm(true);
  };

  if (authLoading) return <LoadingScreen />;
  if (userRole !== "admin") return null;

  return (
    <div className="mb-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Container className="mb-manage-brands-container">
        <h2 className="mb-manage-brands-title my-4">Quản lý thương hiệu</h2>
        <Button
          variant="primary"
          className="mb-add-btn mb-3"
          onClick={() => openModal()}
        >
          Thêm thương hiệu
        </Button>
        <Table className="mb-brands-table">
          <thead>
            <tr>
              <th>Tên thương hiệu</th>
              <th>Ảnh</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td>{brand.name}</td>
                <td>
                  {brand.image_url ? (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className="mb-brand-image"
                    />
                  ) : (
                    "Không có ảnh"
                  )}
                </td>
                <td>
                  {new Date(brand.create_date).toLocaleDateString("vi-VN")}
                </td>
                <td>
                  <Button
                    variant="warning"
                    className="mb-edit-btn me-2"
                    onClick={() => openModal(brand)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    className="mb-delete-btn"
                    onClick={() => confirmDelete(brand)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button
          variant="secondary"
          className="mb-back-btn mt-3"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
      </Container>
      {showModal &&
        createPortal(
          <div className="mb-modal-overlay">
            <div className="mb-modal-content-wrapper">
              <div className="mb-modal-header">
                <div className="mb-modal-title-container">
                  <h2 className="mb-modal-title">
                    {currentBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
                  </h2>
                </div>
                <button className="mb-modal-close-button" onClick={handleClose}>
                  &times;
                </button>
              </div>
              <div className="mb-modal-body">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-modal-form-group">
                    <Form.Label>Tên thương hiệu</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mb-modal-input"
                      required
                      placeholder="Nhập tên thương hiệu"
                    />
                  </Form.Group>
                  <Form.Group className="mb-modal-form-group">
                    <Form.Label>URL ảnh (tùy chọn)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="mb-modal-input"
                      placeholder="Nhập URL ảnh"
                    />
                  </Form.Group>
                  <div className="mb-modal-btn-group">
                    <Button
                      variant="primary"
                      type="submit"
                      className="mb-modal-btn mb-modal-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Đang lưu..."
                        : currentBrand
                        ? "Cập nhật"
                        : "Lưu"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="mb-modal-btn mb-modal-btn-secondary"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Hủy
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>,
          document.body
        )}
      {showConfirm &&
        createPortal(
          <ConfirmBox
            message={`Bạn có chắc muốn xóa thương hiệu "${brandToDelete.name}" không?`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />,
          document.body
        )}
    </div>
  );
}

export default ManageBrands;
