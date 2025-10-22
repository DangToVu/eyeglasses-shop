import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/components/modals/CreateTypeModal.css";

function CreateTypeModal({ show, onHide, onSave }) {
  const [typeName, setTypeName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setTypeName("");
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
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`,
        { name: typeName, created_by: userId },
        { headers }
      );
      toast.success("Thêm loại hàng thành công!");
      handleClose();
      onSave();
    } catch (error) {
      toast.error("Lỗi khi thêm loại hàng: " + error.message);
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
    <div className="ctm-modal-overlay">
      <div className="ctm-modal-content-wrapper">
        <div className="ctm-modal-header">
          <div className="ctm-modal-title-container">
            <h2 className="ctm-modal-title">Thêm Loại hàng mới</h2>
          </div>
          <button className="ctm-modal-close-button" onClick={onHide}>
            &times;
          </button>
        </div>
        <div className="ctm-modal-body">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="ctm-modal-form-group">
              <Form.Label>Tên loại hàng</Form.Label>
              <Form.Control
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="ctm-modal-input"
                required
                placeholder="Nhập tên loại hàng"
              />
            </Form.Group>
            <div className="ctm-modal-btn-group">
              <Button
                variant="primary"
                type="submit"
                className="ctm-modal-btn ctm-modal-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                variant="secondary"
                className="ctm-modal-btn ctm-modal-btn-secondary"
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

export default CreateTypeModal;
