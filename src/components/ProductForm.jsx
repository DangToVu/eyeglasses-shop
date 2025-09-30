import { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/components/ProductForm.css";
import LoadingScreen from "../components/LoadingScreen";

// Hàm định dạng số tiền với dấu chấm ngắt số ngàn
const formatCurrency = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cleanValue);
};

// Hàm nén và resize ảnh nếu dung lượng lớn hơn 1MB
const compressImage = (file) => {
  return new Promise((resolve) => {
    // Kiểm tra dung lượng file (1MB = 1 * 1024 * 1024 bytes)
    const maxSize = 1 * 1024 * 1024;
    if (file.size <= maxSize) {
      // Nếu dung lượng <= 1MB, trả về file gốc
      resolve(file);
      return;
    }

    // Nếu dung lượng > 1MB, resize và nén ảnh
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDimension = 1920; // Kích thước tối đa (width hoặc height)
      let width = img.width;
      let height = img.height;

      // Resize giữ tỷ lệ
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.7 // Chất lượng nén (0-1), sử dụng 0.7 để đồng bộ với các form khác
      );
    };
  });
};

function ProductForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [productId, setProductId] = useState(product ? product.product_id : "");
  const [price, setPrice] = useState(
    product ? product.price?.toString() || "" : ""
  );
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);
  const [brand, setBrand] = useState(product ? product.brand : "");
  const [material, setMaterial] = useState(product ? product.material : "");
  const [isLoading, setIsLoading] = useState(false);
  const [skipPrice, setSkipPrice] = useState(product ? !product.price : false);
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
    setSkipPrice(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (product) {
      setName(product.name);
      setProductId(product.product_id || "");
      setPrice(product.price?.toString() || "");
      setDescription(product.description || "");
      setBrand(product.brand || "");
      setMaterial(product.material || "");
      setSkipPrice(!product.price);
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
      let deleteOldImagePromise = Promise.resolve(); // Default to resolved promise

      if (image) {
        // Nếu có ảnh cũ, bắt đầu xóa bất đồng bộ
        if (product && product.image_url) {
          const oldImagePath = product.image_url.substring(
            product.image_url.lastIndexOf("/") + 1
          );
          deleteOldImagePromise = axios
            .delete(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/product-images/${oldImagePath}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  apikey: import.meta.env.VITE_SUPABASE_KEY,
                },
              }
            )
            .catch((err) => {
              console.warn("Failed to delete old image:", err.message);
              // Không ném lỗi để tiếp tục upload ảnh mới
            });
        }

        // Nén và upload ảnh mới đồng thời với xóa ảnh cũ
        const compressedImage = await compressImage(image);
        const formData = new FormData();
        formData.append("file", compressedImage);

        // Chờ cả xóa ảnh cũ và upload ảnh mới
        await Promise.all([
          deleteOldImagePromise,
          axios.post(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/product-images/${compressedImage.name}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                apikey: import.meta.env.VITE_SUPABASE_KEY,
              },
            }
          ),
        ]);

        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/product-images/${compressedImage.name}`;
      }

      const productData = {
        name,
        product_id: productId,
        price: skipPrice
          ? null
          : parseFloat(price.replace(/[^0-9]/g, "")) || null,
        description,
        image_url: imageUrl,
        brand,
        material,
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
        toast.success("Thêm sản phẩm thành công!");
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
          <Form.Label>Mã sản phẩm</Form.Label>
          <Form.Control
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="pf-form-input"
          />
        </Form.Group>
        <Form.Group className="pf-form-group">
          <Form.Label>Giá</Form.Label>
          <Form.Control
            type="text"
            value={price}
            onChange={handlePriceChange}
            required={!skipPrice}
            disabled={skipPrice}
            className="pf-form-input"
          />
        </Form.Group>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSkipPrice(!skipPrice)}
          disabled={false}
          className="pf-form-btn pf-mt-2 skip-price-btn"
          style={{ padding: "0.4rem 0.5rem", fontSize: "0.85rem" }}
        >
          {skipPrice ? "Nhập giá" : "Không nhập giá"}
        </Button>
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
          <Form.Label>Thương hiệu</Form.Label>
          <Form.Control
            as="select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="pf-form-input"
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
        <Form.Group className="pf-form-group">
          <Form.Label>Chất liệu</Form.Label>
          <Form.Control
            as="select"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="pf-form-input"
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
        <Form.Group className="pf-form-group">
          <Form.Label>Ảnh sản phẩm</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const compressedImage = await compressImage(file);
                setImage(compressedImage);
              }
            }}
            className="pf-form-input"
            ref={fileInputRef}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="pf-form-btn">
          {product ? "Cập nhật" : "Thêm sản phẩm"}
        </Button>
        {product && (
          <Button
            variant="secondary"
            className="pf-form-btn pf-mt-2"
            onClick={handleCancel}
          >
            Hủy
          </Button>
        )}
        <Button
          variant="secondary"
          className="pf-form-btn pf-mt-2"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
      </Form>
    </>
  );
}

export default ProductForm;
