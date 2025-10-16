import { useState, useEffect } from "react";
import { Container, Table, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
import ConfirmBox from "../components/ConfirmBox.jsx";
import Header from "../components/Header.jsx";
import "../styles/pages/ManageUniqueBrand.css";
import LoadingScreen from "../components/LoadingScreen";

function ManageUniqueBrand() {
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUniqueBrand, setCurrentUniqueBrand] = useState(null);
  const [formData, setFormData] = useState({ brand_id: "", image: null });
  const [showConfirm, setShowConfirm] = useState(false);
  const [uniqueBrandToDelete, setUniqueBrandToDelete] = useState(null);
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        };

        // Fetch unique brands
        const uniqueBrandsResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/unique_brands?select=*,brands(name),users!unique_brands_created_by_fkey(gmail)`,
          { headers }
        );
        const formattedUniqueBrands = uniqueBrandsResponse.data.map((ub) => ({
          ...ub,
          brand_name: ub.brands?.name || "N/A",
          created_by_email: ub.users?.gmail || "N/A",
        }));
        setUniqueBrands(formattedUniqueBrands);

        // Fetch all brands for dropdown
        const brandsResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands?select=id,name`,
          { headers }
        );
        setBrands(brandsResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy dữ liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchData();
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

      let imageUrl =
        "https://xrmccpvwxagewnbwjnra.supabase.co/storage/v1/object/public/public_picture/no_picture.jpg";
      if (formData.image) {
        const formDataUpload = new FormData();
        const fileName = `${Date.now()}_${formData.image.name}`;
        formDataUpload.append("file", formData.image);
        await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/unique-brand-image/${fileName}`,
          formDataUpload,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/unique-brand-image/${fileName}`;
      }

      await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/unique_brands`,
        {
          brand_id: formData.brand_id,
          image_url: imageUrl,
          created_by: userId,
        },
        { headers }
      );
      toast.success("Thêm thương hiệu độc quyền thành công!");
      setFormData({ brand_id: "", image: null });
      setShowModal(false);

      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/unique_brands?select=*,brands(name),users!unique_brands_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedUniqueBrands = response.data.map((ub) => ({
        ...ub,
        brand_name: ub.brands?.name || "N/A",
        created_by_email: ub.users?.gmail || "N/A",
      }));
      setUniqueBrands(formattedUniqueBrands);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Lỗi khi thêm thương hiệu độc quyền: " + error.message);
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

      let imageUrl = currentUniqueBrand.image_url;
      if (formData.image) {
        const formDataUpload = new FormData();
        const fileName = `${Date.now()}_${formData.image.name}`;
        formDataUpload.append("file", formData.image);
        await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/unique-brand-image/${fileName}`,
          formDataUpload,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/unique-brand-image/${fileName}`;

        // Delete old image if exists and is not the default image
        if (
          currentUniqueBrand.image_url &&
          currentUniqueBrand.image_url !==
            "https://xrmccpvwxagewnbwjnra.supabase.co/storage/v1/object/public/public_picture/no_picture.jpg"
        ) {
          const oldFileName = currentUniqueBrand.image_url.split("/").pop();
          await axios.delete(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/unique-brand-image/${oldFileName}`,
            { headers }
          );
        }
      }

      await axios.patch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/unique_brands?id=eq.${
          currentUniqueBrand.id
        }`,
        { brand_id: formData.brand_id, image_url: imageUrl },
        { headers }
      );
      toast.success("Cập nhật thương hiệu độc quyền thành công!");
      setFormData({ brand_id: "", image: null });
      setShowModal(false);
      setCurrentUniqueBrand(null);

      const response = await axios.get(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/rest/v1/unique_brands?select=*,brands(name),users!unique_brands_created_by_fkey(gmail)`,
        { headers }
      );
      const formattedUniqueBrands = response.data.map((ub) => ({
        ...ub,
        brand_name: ub.brands?.name || "N/A",
        created_by_email: ub.users?.gmail || "N/A",
      }));
      setUniqueBrands(formattedUniqueBrands);
    } catch (error) {
      toast.error("Lỗi khi cập nhật thương hiệu độc quyền: " + error.message);
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

      // Delete image if exists and is not the default image
      if (
        uniqueBrandToDelete.image_url &&
        uniqueBrandToDelete.image_url !==
          "https://xrmccpvwxagewnbwjnra.supabase.co/storage/v1/object/public/public_picture/no_picture.jpg"
      ) {
        const fileName = uniqueBrandToDelete.image_url.split("/").pop();
        await axios.delete(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/unique-brand-image/${fileName}`,
          { headers }
        );
      }

      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/unique_brands?id=eq.${
          uniqueBrandToDelete.id
        }`,
        { headers }
      );
      toast.success("Xóa thương hiệu độc quyền thành công!");
      setUniqueBrands(
        uniqueBrands.filter((ub) => ub.id !== uniqueBrandToDelete.id)
      );
      const totalPagesAfterDelete = Math.ceil(
        (uniqueBrands.length - 1) / itemsPerPage
      );
      if (currentPage > totalPagesAfterDelete && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa thương hiệu độc quyền: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setUniqueBrandToDelete(null);
    }
  };

  const openModal = (uniqueBrand = null) => {
    setCurrentUniqueBrand(uniqueBrand);
    setFormData({
      brand_id: uniqueBrand ? uniqueBrand.brand_id : "",
      image: null,
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setFormData({ brand_id: "", image: null });
    setCurrentUniqueBrand(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUniqueBrand) {
      await handleEdit();
    } else {
      await handleAdd();
    }
  };

  const confirmDelete = (uniqueBrand) => {
    setUniqueBrandToDelete(uniqueBrand);
    setShowConfirm(true);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    const totalPages = Math.ceil(uniqueBrands.length / newItemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUniqueBrands = uniqueBrands.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(uniqueBrands.length / itemsPerPage);

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
    <div className="mub-page-wrapper">
      {isLoading && <LoadingScreen />}
      <Header />
      <Container className="mub-manage-unique-brands-container">
        <h2 className="mub-manage-unique-brands-title my-4">
          Quản lý thương hiệu độc quyền
        </h2>
        <div className="mub-button-group-top">
          <Button
            variant="secondary"
            className="mub-back-btn"
            onClick={() => navigate("/card-management")}
          >
            Quay lại
          </Button>
        </div>
        <div className="mub-table-container">
          <Table className="mub-unique-brands-table">
            <thead>
              <tr>
                <th>Tên thương hiệu</th>
                <th>Ảnh</th>
                <th>Ngày tạo</th>
                <th>Email người tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUniqueBrands.map((ub) => (
                <tr key={ub.id}>
                  <td>{ub.brand_name}</td>
                  <td>
                    {ub.image_url ? (
                      <img
                        src={ub.image_url}
                        alt={ub.brand_name}
                        className="mub-brand-image"
                      />
                    ) : (
                      "Không có ảnh"
                    )}
                  </td>
                  <td>
                    {new Date(ub.create_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{ub.created_by_email}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="mub-edit-btn me-2"
                      onClick={() => openModal(ub)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      className="mub-delete-btn"
                      onClick={() => confirmDelete(ub)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="mub-button-group-bottom">
          <Button
            variant="primary"
            className="mub-add-btn"
            onClick={() => openModal()}
          >
            Thêm thương hiệu độc quyền
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="mub-pagination">
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
        <div className="mub-items-per-page-selector">
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
          <div className="mub-modal-overlay">
            <div className="mub-modal-content-wrapper">
              <div className="mub-modal-header">
                <div className="mub-modal-title-container">
                  <h2 className="mub-modal-title">
                    {currentUniqueBrand
                      ? "Sửa thương hiệu độc quyền"
                      : "Thêm thương hiệu độc quyền"}
                  </h2>
                </div>
                <button
                  className="mub-modal-close-button"
                  onClick={handleClose}
                >
                  &times;
                </button>
              </div>
              <div className="mub-modal-body">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mub-modal-form-group">
                    <Form.Label>Thương hiệu</Form.Label>
                    <Form.Select
                      value={formData.brand_id}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_id: e.target.value })
                      }
                      className="mub-modal-input"
                      required
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mub-modal-form-group">
                    <Form.Label>Ảnh thương hiệu (tùy chọn)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.files[0] })
                      }
                      className="mub-modal-input"
                    />
                    {currentUniqueBrand && currentUniqueBrand.image_url && (
                      <div className="mub-current-image-preview">
                        <p>Hình ảnh hiện tại:</p>
                        <img
                          src={currentUniqueBrand.image_url}
                          alt="Current brand"
                          style={{
                            width: "100px",
                            height: "auto",
                            marginTop: "10px",
                          }}
                        />
                      </div>
                    )}
                  </Form.Group>
                  <div className="mub-modal-btn-group">
                    <Button
                      variant="primary"
                      type="submit"
                      className="mub-modal-btn mub-modal-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Đang lưu..."
                        : currentUniqueBrand
                        ? "Cập nhật"
                        : "Lưu"}
                    </Button>
                    <Button
                      variant="secondary"
                      className="mub-modal-btn mub-modal-btn-secondary"
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
            message={`Bạn có chắc muốn xóa thương hiệu độc quyền "${uniqueBrandToDelete.brand_name}" không?`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />,
          document.body
        )}
    </div>
  );
}

export default ManageUniqueBrand;
