import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

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
        // Tải ảnh lên Supabase Storage
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
        // Lấy URL công khai của ảnh
        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/product-images/${image.name}`;
      }

      // Tạo object chứa dữ liệu sản phẩm
      const productData = {
        name,
        price: parseFloat(price), // Đảm bảo price là số
        description,
        image: imageUrl,
      };

      if (product) {
        // Cập nhật sản phẩm
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
        // Thêm sản phẩm mới
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
      onSave(); // Gọi hàm onSave để làm mới danh sách sản phẩm
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Tên sản phẩm</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Giá</Form.Label>
        <Form.Control
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ảnh sản phẩm</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        {product ? "Cập nhật" : "Thêm sản phẩm"}
      </Button>
    </Form>
  );
}

export default ProductForm;
