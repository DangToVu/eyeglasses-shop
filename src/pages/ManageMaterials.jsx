import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import ConfirmBox from "../components/ConfirmBox.jsx";
import Header from "../components/Header.jsx";
import "../styles/pages/ManageMaterials.css";
import LoadingScreen from "../components/LoadingScreen";

function ManageMaterials() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [authLoading, userRole, navigate]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true);
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        };
        const response = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/materials?select=*,users!materials_created_by_fkey(gmail)`,
          { headers }
        );
        const formattedMaterials = response.data.map((material) => ({
          ...material,
          created_by_email: material.users?.gmail || "N/A",
        }));
        setMaterials(formattedMaterials);
      } catch (error) {
        toast.error("Lỗi khi lấy danh sách chất liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchMaterials();
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`,
        { name: formData.name, created_by: userId },
        { headers }
      );
      toast.success("Thêm chất liệu thành công!");
      setFormData({ name: "" });
      setShowModal(false);
      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/materials?select=*,users!materials_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedMaterials = response.data.map((material) => ({
        ...material,
        created_by_email: material.users?.gmail || "N/A",
      }));
      setMaterials(formattedMaterials);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Lỗi khi thêm chất liệu: " + error.message);
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials?id=eq.${
          currentMaterial.id
        }`,
        { name: formData.name },
        { headers }
      );
      const tables = ["products", "best_selling_glasses", "all_product"];
      await Promise.all(
        tables.map((table) =>
          axios.patch(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/rest/v1/${table}?material=eq.${currentMaterial.name}`,
            { material: formData.name },
            { headers }
          )
        )
      );
      toast.success("Cập nhật chất liệu thành công!");
      setFormData({ name: "" });
      setShowModal(false);
      setCurrentMaterial(null);
      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/materials?select=*,users!materials_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedMaterials = response.data.map((material) => ({
        ...material,
        created_by_email: material.users?.gmail || "N/A",
      }));
      setMaterials(formattedMaterials);
    } catch (error) {
      toast.error("Lỗi khi cập nhật chất liệu: " + error.message);
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
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/rest/v1/${table}?material=eq.${materialToDelete.name}`,
            { material: null },
            { headers }
          )
        )
      );
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials?id=eq.${
          materialToDelete.id
        }`,
        { headers }
      );
      toast.success("Xóa chất liệu thành công!");
      setMaterials(materials.filter((m) => m.id !== materialToDelete.id));
      const totalPagesAfterDelete = Math.ceil(
        (materials.length - 1) / itemsPerPage
      );
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa chất liệu: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setMaterialToDelete(null);
    }
  };

  const openModal = (material = null) => {
    setCurrentMaterial(material);
    setFormData({ name: material ? material.name : "" });
    setShowModal(true);
  };

  const handleClose = () => {
    setFormData({ name: "" });
    setCurrentMaterial(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMaterial) {
      await handleEdit();
    } else {
      await handleAdd();
    }
  };

  const confirmDelete = (material) => {
    setMaterialToDelete(material);
    setShowConfirm(true);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    const totalPages = Math.ceil(materials.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(materials.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [...Array(endPage - startPage + 1).keys()].map(
    (i) => startPage + i
  );

  if (authLoading) return <LoadingScreen />;
  if (userRole !== "admin") return null;

  return (
    <div className="mm-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="mm-manage-materials-container">
        <h2 className="mm-manage-materials-title my-4">Quản lý chất liệu</h2>
        <div className="mm-button-group-top">
          <Button
            variant="secondary"
            className="mm-back-btn"
            onClick={() => navigate("/card-management")}
          >
            Quay lại
          </Button>
        </div>
        <div className="mm-table-container">
          <Table className="mm-materials-table">
            <thead>
              <tr>
                <th>Tên chất liệu</th>
                <th>Ngày tạo</th>
                <th>Email người tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.map((material) => (
                <tr key={material.id}>
                  <td>{material.name}</td>
                  <td>
                    {new Date(material.create_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{material.created_by_email}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="mm-edit-btn me-2"
                      onClick={() => openModal(material)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      className="mm-delete-btn"
                      onClick={() => confirmDelete(material)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="mm-button-group-bottom">
          <Button
            variant="primary"
            className="mm-add-btn"
            onClick={() => openModal()}
          >
            Thêm chất liệu
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="mm-pagination">
            <Button
              variant="secondary"
              onClick={firstPage}
              disabled={currentPage === 1}
            >
              &lt;&lt;
            </Button>
            <Button
              variant="secondary"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            {pageNumbers.map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "primary" : "outline-primary"}
                onClick={() => paginate(number)}
                className="mx-1"
              >
                {number}
              </Button>
            ))}
            <Button
              variant="secondary"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
            <Button
              variant="secondary"
              onClick={lastPage}
              disabled={currentPage === totalPages}
            >
              &gt;&gt;
            </Button>
          </div>
        )}
        <div className="mm-items-per-page-selector">
          <Form.Label>Số dòng mỗi trang:</Form.Label>
          <Form.Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="ms-2"
            style={{ display: "inline-block", width: "auto" }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </div>
      </Container>
      {showModal &&
        createPortal(
          <div className="mm-modal-overlay">
            <div className="mm-modal-content-wrapper">
              <div className="mm-modal-header">
                <div className="mm-modal-title-container">
                  <h2 className="mm-modal-title">
                    {currentMaterial ? "Sửa chất liệu" : "Thêm chất liệu"}
                  </h2>
                </div>
                <button className="mm-modal-close-button" onClick={handleClose}>
                  &times;
                </button>
              </div>
              <div className="mm-modal-body">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mm-modal-form-group">
                    <Form.Label>Tên chất liệu</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mm-modal-input"
                      required
                      placeholder="Nhập tên chất liệu"
                    />
                  </Form.Group>
                  <div className="mm-modal-btn-group">
                    <Button
                      variant="primary"
                      type="submit"
                      className="mm-modal-btn mm-modal-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Đang lưu..."
                        : currentMaterial
                        ? "Cập nhật"
                        : "Lưu"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="mm-modal-btn mm-modal-btn-secondary"
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
            message={`Bạn có chắc muốn xóa chất liệu "${materialToDelete.name}" không?`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />,
          document.body
        )}
    </div>
  );
}

export default ManageMaterials;
