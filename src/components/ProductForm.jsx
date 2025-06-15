import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/ProductForm.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox"; // Import ConfirmBox

// Hàm định dạng số tiền với dấu chấm ngắt số ngàn
const formatCurrency = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cleanValue);
};

function ProductForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [price, setPrice] = useState(product ? product.price.toString() : "");
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State cho ConfirmBox

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = product ? product.image : "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/product-images/${image.name}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/product-images/${image.name}`;
      }

      const productData = {
        name,
        price: parseFloat(price.replace(/[^0-9]/g, "")),
        description,
        image: imageUrl,
      };

      const table = "products";
      const idField = product ? `id=eq.${product.id}` : null;

      if (product) {
        await axios.patch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?${idField}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
          }
        );
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await axios.post(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
          }
        );
        toast.success("Thêm sản phẩm thành công!");
      }
      onSave();
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!product) return;
    setShowConfirm(true); // Hiển thị ConfirmBox khi nhấn Xóa
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      const table = "products";
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${table}?id=eq.${
          product.id
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            apikey: import.meta.env.VITE_SUPABASE_KEY,
          },
        }
      );
      toast.success("Xóa sản phẩm thành công!");
      onSave();
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false); // Ẩn ConfirmBox sau khi xóa
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^0-9]/g, "");
    setPrice(formatCurrency(cleanValue));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setDescription(value);
    }
  };

  const charactersLeft = 50 - description.length;

  return (
    <>
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Form onSubmit={handleSubmit} className="pf-form">
        <Form.Group className="pf-form-group">
          <Form.Label>Tên sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pf-form-input"
          />
        </Form.Group>
        <Form.Group className="pf-form-group">
          <Form.Label>Giá</Form.Label>
          <Form.Control
            type="text"
            value={price}
            onChange={handlePriceChange}
            required
            className="pf-form-input"
          />
        </Form.Group>
        <Form.Group className="pf-form-group">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={handleDescriptionChange}
            className="pf-form-input pf-form-textarea"
            maxLength={50}
          />
          <small className="pf-text-muted">
            {charactersLeft}/50 ký tự còn lại
          </small>
        </Form.Group>
        <Form.Group className="pf-form-group">
          <Form.Label>Ảnh sản phẩm</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="pf-form-input"
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="pf-form-btn">
          {product ? "Cập nhật" : "Thêm sản phẩm"}
        </Button>
        {product && (
          <Button
            variant="danger"
            className="pf-form-btn pf-mt-2"
            onClick={handleDelete}
          >
            Xóa
          </Button>
        )}
      </Form>
    </>
  );
}

export default ProductForm;
