import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/components/CreateBrandModal.css";

function CreateBrandModal({ show, onHide, onSave }) {
  const [brandName, setBrandName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setBrandName("");
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        { name: brandName, created_by: userId },
        { headers }
      );
      toast.success("Thêm thương hiệu thành công!");
      handleClose();
      onSave();
    } catch (error) {
      toast.error("Lỗi khi thêm thương hiệu: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return createPortal(
    <div className="cbm-modal-overlay">
      <div className="cbm-modal-content-wrapper">
        <div className="cbm-modal-header">
          <div className="cbm-modal-title-container">
            <h2 className="cbm-modal-title">Thêm Thương hiệu mới</h2>
          </div>
          <button className="cbm-modal-close-button" onClick={onHide}>
            &times;
          </button>
        </div>
        <div className="cbm-modal-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="cbm-modal-form-group">
              <Form.Label>Tên thương hiệu</Form.Label>
              <Form.Control
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="cbm-modal-input"
                required
                placeholder="Nhập tên thương hiệu"
              />
            </Form.Group>
            <div className="cbm-modal-btn-group">
              <Button
                variant="primary"
                type="submit"
                className="cbm-modal-btn cbm-modal-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                variant="secondary"
                className="cbm-modal-btn cbm-modal-btn-secondary"
                onClick={onHide}
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
  );
}

export default CreateBrandModal;
