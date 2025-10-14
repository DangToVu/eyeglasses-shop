import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import ConfirmBox from "../components/ConfirmBox.jsx";
import "../styles/pages/ManageTypes.css";
import LoadingScreen from "../components/LoadingScreen";

function ManageTypes() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`,
          { headers }
        );
        setTypes(response.data);
      } catch (error) {
        toast.error("Lỗi khi lấy danh sách loại hàng: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchTypes();
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`,
        { name: formData.name, created_by: userId },
        { headers }
      );
      toast.success("Thêm loại hàng thành công!");
      setFormData({ name: "" });
      setShowModal(false);
      const response = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`,
        { headers }
      );
      setTypes(response.data);
    } catch (error) {
      toast.error("Lỗi khi thêm loại hàng: " + error.message);
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types?id=eq.${
          currentType.id
        }`,
        { name: formData.name },
        { headers }
      );
      const tables = ["products", "best_selling_glasses", "all_product"];
      await Promise.all(
        tables.map((table) =>
          axios.patch(
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?type=eq.${
              currentType.name
            }`,
            { type: formData.name },
            { headers }
          )
        )
      );
      toast.success("Cập nhật loại hàng thành công!");
      setFormData({ name: "" });
      setShowModal(false);
      setCurrentType(null);
      const response = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`,
        { headers }
      );
      setTypes(response.data);
    } catch (error) {
      toast.error("Lỗi khi cập nhật loại hàng: " + error.message);
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
            `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?type=eq.${
              typeToDelete.name
            }`,
            { type: null },
            { headers }
          )
        )
      );
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types?id=eq.${
          typeToDelete.id
        }`,
        { headers }
      );
      toast.success("Xóa loại hàng thành công!");
      setTypes(types.filter((t) => t.id !== typeToDelete.id));
    } catch (error) {
      toast.error("Lỗi khi xóa loại hàng: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setTypeToDelete(null);
    }
  };

  const openModal = (type = null) => {
    setCurrentType(type);
    setFormData({ name: type ? type.name : "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setFormData({ name: "" });
    setCurrentType(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentType) {
      await handleEdit();
    } else {
      await handleAdd();
    }
  };

  const confirmDelete = (type) => {
    setTypeToDelete(type);
    setShowConfirm(true);
  };

  if (authLoading) return <LoadingScreen />;
  if (userRole !== "admin") return null;

  return (
    <div className="mt-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Container className="mt-manage-types-container">
        <h2 className="mt-manage-types-title my-4">Quản lý loại hàng</h2>
        <Button
          variant="primary"
          className="mt-add-btn mb-3"
          onClick={() => openModal()}
        >
          Thêm loại hàng
        </Button>
        <Table className="mt-types-table">
          <thead>
            <tr>
              <th>Tên loại hàng</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id}>
                <td>{type.name}</td>
                <td>
                  {new Date(type.create_date).toLocaleDateString("vi-VN")}
                </td>
                <td>
                  <Button
                    variant="warning"
                    className="mt-edit-btn me-2"
                    onClick={() => openModal(type)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    className="mt-delete-btn"
                    onClick={() => confirmDelete(type)}
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
          className="mt-back-btn mt-3"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
      </Container>
      {showModal &&
        createPortal(
          <div className="mt-modal-overlay">
            <div className="mt-modal-content-wrapper">
              <div className="mt-modal-header">
                <div className="mt-modal-title-container">
                  <h2 className="mt-modal-title">
                    {currentType ? "Sửa loại hàng" : "Thêm loại hàng"}
                  </h2>
                </div>
                <button className="mt-modal-close-button" onClick={handleClose}>
                  &times;
                </button>
              </div>
              <div className="mt-modal-body">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mt-modal-form-group">
                    <Form.Label>Tên loại hàng</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-modal-input"
                      required
                      placeholder="Nhập tên loại hàng"
                    />
                  </Form.Group>
                  <div className="mt-modal-btn-group">
                    <Button
                      variant="primary"
                      type="submit"
                      className="mt-modal-btn mt-modal-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Đang lưu..."
                        : currentType
                        ? "Cập nhật"
                        : "Lưu"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="mt-modal-btn mt-modal-btn-secondary"
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
            message={`Bạn có chắc muốn xóa loại hàng "${typeToDelete.name}" không?`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />,
          document.body
        )}
    </div>
  );
}

export default ManageTypes;
