import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../../hooks/useAuthCheck.jsx";
import ConfirmBox from "../../components/ConfirmBox.jsx";
import Header from "../../components/Header.jsx";
import "../../styles/pages/managePages/ManageTypes.css";
import LoadingScreen from "../../components/LoadingScreen.jsx";

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
    const fetchTypes = async () => {
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
          }/rest/v1/types?select=*,users!types_created_by_fkey(gmail)`,
          { headers }
        );
        const formattedTypes = response.data.map((type) => ({
          ...type,
          created_by_email: type.users?.gmail || "N/A",
        }));
        setTypes(formattedTypes);
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
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/types?select=*,users!types_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedTypes = response.data.map((type) => ({
        ...type,
        created_by_email: type.users?.gmail || "N/A",
      }));
      setTypes(formattedTypes);
      setCurrentPage(1);
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
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/types?select=*,users!types_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedTypes = response.data.map((type) => ({
        ...type,
        created_by_email: type.users?.gmail || "N/A",
      }));
      setTypes(formattedTypes);
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
      const totalPagesAfterDelete = Math.ceil(
        (types.length - 1) / itemsPerPage
      );
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    const totalPages = Math.ceil(types.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTypes = types.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(types.length / itemsPerPage);

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
    <div className="mt-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="mt-manage-types-container">
        <h2 className="mt-manage-types-title my-4">Quản lý loại hàng</h2>
        <div className="mt-button-group-top">
          <Button
            variant="secondary"
            className="mt-back-btn"
            onClick={() => navigate("/card-management")}
          >
            Quay lại
          </Button>
        </div>
        <div className="mt-table-container">
          <Table className="mt-types-table">
            <thead>
              <tr>
                <th>Tên loại hàng</th>
                <th>Ngày tạo</th>
                <th>Email người tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentTypes.map((type) => (
                <tr key={type.id}>
                  <td>{type.name}</td>
                  <td>
                    {new Date(type.create_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{type.created_by_email}</td>
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
        </div>
        <div className="mt-button-group-bottom">
          <Button
            variant="primary"
            className="mt-add-btn"
            onClick={() => openModal()}
          >
            Thêm loại hàng
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="mt-pagination">
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
        <div className="mt-items-per-page-selector">
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
