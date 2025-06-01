import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/ProductForm.css"; // Import CSS

function ProductForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [price, setPrice] = useState(product ? product.price : "");
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        price: parseFloat(price),
        description,
        image: imageUrl,
      };

      if (product) {
        await axios.patch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?id=eq.${
            product.id
          }`,
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
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
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
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="product-form">
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
      <Button type="submit" variant="primary" className="product-form-btn">
        {product ? "Cập nhật" : "Thêm sản phẩm"}
      </Button>
    </Form>
  );
}

export default ProductForm;
