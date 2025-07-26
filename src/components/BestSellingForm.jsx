import { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/components/BestSellingForm.css";
import LoadingScreen from "../components/LoadingScreen";

// Hàm định dạng số tiền với dấu chấm ngắt số ngàn
const formatCurrency = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cleanValue);
};

// Hàm nén ảnh trước khi upload (không giới hạn chiều dài/rộng, chỉ nén chất lượng)
const compressImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; // Giữ nguyên chiều rộng
      canvas.height = img.height; // Giữ nguyên chiều cao
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.8 // Chất lượng nén (0-1)
      );
    };
  });
};

function BestSellingForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [productId, setProductId] = useState(product ? product.product_id : "");
  const [price, setPrice] = useState(product ? product.price.toString() : "");
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);
  const [brand, setBrand] = useState(product ? product.brand : "");
  const [material, setMaterial] = useState(product ? product.material : "");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const brandOptions = [
    "G.M.Surne",
    "VE",
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

  const resetForm = () => {
    setName("");
    setProductId("");
    setPrice("");
    setDescription("");
    setImage(null);
    setBrand("");
    setMaterial("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setProductId(product.product_id || "");
      setPrice(formatCurrency(product.price.toString()));
      setDescription(product.description || "");
      setBrand(product.brand || "");
      setMaterial(product.material || "");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
      if (image) {
        // Nếu có ảnh cũ và tải ảnh mới, xóa ảnh cũ trước
        if (product && product.image_url) {
          const oldImagePath = product.image_url.substring(
            product.image_url.lastIndexOf("/") + 1
          );
          await axios.delete(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/best-selling-images/${oldImagePath}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                apikey: import.meta.env.VITE_SUPABASE_KEY,
              },
            }
          );
        }

        // Upload ảnh mới sau khi xóa ảnh cũ (nếu có)
        const compressedImage = await compressImage(image);
        const formData = new FormData();
        formData.append("file", compressedImage);
        await axios.post(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/best-selling-images/${compressedImage.name}`,
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
        }/storage/v1/object/public/best-selling-images/${compressedImage.name}`;
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
        resetForm();
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
        resetForm();
      }
      onSave();
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onSave();
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
      <Form onSubmit={handleSubmit} className="bsf-form">
        <Form.Group className="bsf-form-group">
          <Form.Label>Tên sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bsf-form-input"
          />
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <Form.Label>Mã sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="bsf-form-input"
          />
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <Form.Label>Giá</Form.Label>
          <Form.Control
            type="text"
            value={price}
            onChange={handlePriceChange}
            required
            className="bsf-form-input"
          />
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <Form.Label>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            value={description}
            onChange={handleDescriptionChange}
            className="bsf-form-input bsf-form-textarea"
            maxLength={50}
          />
          <small className="bsf-text-muted">
            {charactersLeft}/50 ký tự còn lại
          </small>
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <Form.Label>Thương hiệu</Form.Label>
          <Form.Control
            as="select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="bsf-form-input"
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
        <Form.Group className="bsf-form-group">
          <Form.Label>Chất liệu</Form.Label>
          <Form.Control
            as="select"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="bsf-form-input"
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
        <Form.Group className="bsf-form-group">
          <Form.Label>Ảnh sản phẩm</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const compressedImage = await compressImage(file); // Nén ảnh
                setImage(compressedImage);
              }
            }}
            className="bsf-form-input"
            ref={fileInputRef}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="bsf-form-btn">
          {product ? "Cập nhật" : "Thêm sản phẩm"}
        </Button>
        {product && (
          <Button
            variant="secondary"
            className="bsf-form-btn bsf-mt-2"
            onClick={handleCancel}
          >
            Hủy
          </Button>
        )}
        <Button
          variant="secondary"
          className="bsf-form-btn bsf-mt-2"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
      </Form>
    </>
  );
}

export default BestSellingForm;
