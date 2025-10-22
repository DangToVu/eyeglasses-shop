import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../../hooks/useAuthCheck.jsx";
import ConfirmBox from "../../components/ConfirmBox.jsx";
import Header from "../../components/Header.jsx";
import "../../styles/pages/managePages/ManageBrands.css";
import LoadingScreen from "../../components/LoadingScreen.jsx";

function ManageBrands() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
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
    const fetchBrands = async () => {
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
          }/rest/v1/brands?select=*,users!brands_created_by_fkey(gmail)`,
          { headers }
        );
        const formattedBrands = response.data.map((brand) => ({
          ...brand,
          created_by_email: brand.users?.gmail || "N/A",
        }));
        setBrands(formattedBrands);
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
          created_by: userId,
        },
        { headers }
      );
      toast.success("Thêm thương hiệu thành công!");
      setFormData({ name: "" });
      setShowModal(false);
      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/brands?select=*,users!brands_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedBrands = response.data.map((brand) => ({
        ...brand,
        created_by_email: brand.users?.gmail || "N/A",
      }));
      setBrands(formattedBrands);
      setCurrentPage(1);
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
        { name: formData.name },
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
      setFormData({ name: "" });
      setShowModal(false);
      setCurrentBrand(null);
      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/brands?select=*,users!brands_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedBrands = response.data.map((brand) => ({
        ...brand,
        created_by_email: brand.users?.gmail || "N/A",
      }));
      setBrands(formattedBrands);
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
      const totalPagesAfterDelete = Math.ceil(
        (brands.length - 1) / itemsPerPage
      );
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setFormData({ name: "" });
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

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    const totalPages = Math.ceil(brands.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(brands.length / itemsPerPage);

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
    <div className="mb-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="mb-manage-brands-container">
        <h2 className="mb-manage-brands-title my-4">Quản lý thương hiệu</h2>
        <div className="mb-button-group-top">
          <Button
            variant="secondary"
            className="mb-back-btn"
            onClick={() => navigate("/card-management")}
          >
            Quay lại
          </Button>
        </div>
        <div className="mb-table-container">
          <Table className="mb-brands-table">
            <thead>
              <tr>
                <th>Tên thương hiệu</th>
                <th>Ngày tạo</th>
                <th>Email người tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentBrands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.name}</td>
                  <td>
                    {new Date(brand.create_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{brand.created_by_email}</td>
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
        </div>
        <div className="mb-button-group-bottom">
          <Button
            variant="primary"
            className="mb-add-btn"
            onClick={() => openModal()}
          >
            Thêm thương hiệu
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="mb-pagination">
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
        <div className="mb-items-per-page-selector">
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
