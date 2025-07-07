import { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/components/AllProductForm.css";
import LoadingScreen from "../components/LoadingScreen";

const formatCurrency = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cleanValue);
};

function AllProductForm({ product, onSave, table }) {
  const [name, setName] = useState(product ? product.name : "");
  const [productId, setProductId] = useState(product ? product.product_id : "");
  const [price, setPrice] = useState(product ? product.price.toString() : "");
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null); // Mặc định luôn là null, không fetch ảnh
  const [brand, setBrand] = useState(product ? product.brand : "");
  const [material, setMaterial] = useState(product ? product.material : "");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref để reset file input

  const brandOptions = [
    "G.M.Surne",
    "V/E",
    "WINNER",
    "DIVEI",
    "KIEINMONSTES",
    "FEMINA",
    "ENCINO",
    "AVALON",
    "RUBERTY",
    "ROGERSON",
  ];
  const materialOptions = ["Kim loại", "Titan", "Nhựa"];

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setName("");
    setProductId("");
    setPrice("");
    setDescription("");
    setImage(null); // Clear ảnh khi reset
    setBrand("");
    setMaterial("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  // Cập nhật dữ liệu form khi product thay đổi
  useEffect(() => {
    if (product) {
      setName(product.name);
      setProductId(product.product_id || "");
      setPrice(formatCurrency(product.price.toString()));
      setDescription(product.description || "");
      setBrand(product.brand || "");
      setMaterial(product.material || "");
      setImage(null); // Luôn đặt image về null khi fetch dữ liệu sản phẩm
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input khi load sản phẩm
      }
    } else {
      resetForm();
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = product ? product.image_url : "";
      let bucket = "";
      if (table === "products") bucket = "product-images";
      else if (table === "best_selling_glasses") bucket = "best-selling-images";
      else if (table === "all_product") bucket = "all-product-images";

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await axios.post(
          `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${
            image.name
          }`,
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
        }/storage/v1/object/public/${bucket}/${image.name}`;
      }

      const productData = {
        name,
        product_id: productId,
        price: parseFloat(price.replace(/[^0-9]/g, "")),
        description,
        image_url: imageUrl,
        brand,
        material,
      };

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
        resetForm(); // Clear form sau khi cập nhật thành công
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
        resetForm(); // Clear form sau khi thêm thành công, bao gồm trường ảnh
      }
      onSave();
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm(); // Xóa dữ liệu trong form
    onSave(); // Gọi onSave để cập nhật lại trạng thái, có thể làm mới danh sách
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
      <Form onSubmit={handleSubmit} className="apf-form">
        <Form.Group className="apf-form-group">
          <Form.Label>Tên sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="apf-form-input"
          />
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Mã sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="apf-form-input"
          />
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Giá</Form.Label>
          <Form.Control
            type="text"
            value={price}
            onChange={handlePriceChange}
            required
            className="apf-form-input"
          />
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={handleDescriptionChange}
            className="apf-form-input apf-form-textarea"
            maxLength={50}
          />
          <small className="apf-text-muted">
            {charactersLeft}/50 ký tự còn lại
          </small>
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Thương hiệu</Form.Label>
          <Form.Control
            as="select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="apf-form-input"
            required
          >
            <option value="">Chọn thương hiệu</option>
            {brandOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Chất liệu</Form.Label>
          <Form.Control
            as="select"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="apf-form-input"
            required
          >
            <option value="">Chọn chất liệu</option>
            {materialOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group className="apf-form-group">
          <Form.Label>Ảnh sản phẩm</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="apf-form-input"
            ref={fileInputRef} // Gắn ref vào input file
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="apf-form-btn">
          {product ? "Cập nhật" : "Thêm sản phẩm"}
        </Button>
        {product && (
          <Button
            variant="secondary"
            className="apf-form-btn apf-mt-2"
            onClick={handleCancel}
          >
            Hủy
          </Button>
        )}
        <Button
          variant="secondary"
          className="apf-form-btn apf-mt-2"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
      </Form>
    </>
  );
}

export default AllProductForm;
