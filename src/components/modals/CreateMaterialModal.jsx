import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/components/modals/CreateMaterialModal.css";

function CreateMaterialModal({ show, onHide, onSave }) {
  const [materialName, setMaterialName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setMaterialName("");
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`,
        { name: materialName, created_by: userId },
        { headers }
      );
      toast.success("Thêm chất liệu thành công!");
      handleClose();
      onSave();
    } catch (error) {
      toast.error("Lỗi khi thêm chất liệu: " + error.message);
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
    <div className="cmm-modal-overlay">
      <div className="cmm-modal-content-wrapper">
        <div className="cmm-modal-header">
          <div className="cmm-modal-title-container">
            <h2 className="cmm-modal-title">Thêm Chất liệu mới</h2>
          </div>
          <button className="cmm-modal-close-button" onClick={onHide}>
            &times;
          </button>
        </div>
        <div className="cmm-modal-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="cmm-modal-form-group">
              <Form.Label>Tên chất liệu</Form.Label>
              <Form.Control
                type="text"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="cmm-modal-input"
                required
                placeholder="Nhập tên chất liệu"
              />
            </Form.Group>
            <div className="cmm-modal-btn-group">
              <Button
                variant="primary"
                type="submit"
                className="cmm-modal-btn cmm-modal-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                variant="secondary"
                className="cmm-modal-btn cmm-modal-btn-secondary"
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

export default CreateMaterialModal;
