import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/BestSellingForm.css"; // Sử dụng CSS riêng cho BestSellingForm

function BestSellingForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [price, setPrice] = useState(product ? product.price : "");
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = product ? product.image_url : "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/best-selling-images/${image.name}`,
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
        }/storage/v1/object/public/best-selling-images/${image.name}`;
      }

      const productData = {
        name,
        price: parseFloat(price),
        description,
        image_url: imageUrl,
      };

      const table = "best_selling_glasses";
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
        toast.success("Cập nhật sản phẩm bán chạy thành công!");
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
        toast.success("Thêm sản phẩm bán chạy thành công!");
      }
      onSave();
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      const table = "best_selling_glasses";
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
      toast.success("Xóa sản phẩm bán chạy thành công!");
      onSave();
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="best-selling-form">
      <Form.Group className="form-group">
        <Form.Label>Tên sản phẩm</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Giá</Form.Label>
        <Form.Control
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input form-textarea"
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>Ảnh sản phẩm</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="form-input"
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="best-selling-form-btn">
        {product ? "Cập nhật" : "Thêm sản phẩm"}
      </Button>
      {product && (
        <Button
          variant="danger"
          className="best-selling-form-btn mt-2"
          onClick={handleDelete}
        >
          Xóa
        </Button>
      )}
    </Form>
  );
}

export default BestSellingForm;
