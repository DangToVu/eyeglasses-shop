import { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../styles/components/forms/BestSellingForm.css";
import LoadingScreen from "../LoadingScreen";
import CreateBrandModal from "../CreateBrandModal";
import CreateMaterialModal from "../CreateMaterialModal";
import CreateTypeModal from "../CreateTypeModal";

const formatCurrency = (value) => {
  const cleanValue = value.replace(/[^0-9]/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(cleanValue);
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const maxSize = 1 * 1024 * 1024;
    if (file.size <= maxSize) {
      resolve(file);
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxDimension = 1920;
      let width = img.width;
      let height = img.height;
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
        0.8
      );
    };
  });
};

function BestSellingForm({ product, onSave }) {
  const [name, setName] = useState(product ? product.name : "");
  const [productId, setProductId] = useState(product ? product.product_id : "");
  const [price, setPrice] = useState(
    product ? product.price?.toString() || "" : ""
  );
  const [description, setDescription] = useState(
    product ? product.description : ""
  );
  const [image, setImage] = useState(null);
  const [type, setType] = useState(product ? product.type : "");
  const [brand, setBrand] = useState(product ? product.brand : "");
  const [material, setMaterial] = useState(product ? product.material : "");
  const [isLoading, setIsLoading] = useState(false);
  const [skipPrice, setSkipPrice] = useState(product ? !product.price : false);
  const [typeOptions, setTypeOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        };
        const [typesResponse, brandsResponse, materialsResponse] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`, {
              headers,
            }),
            axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`, {
              headers,
            }),
            axios.get(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`,
              { headers }
            ),
          ]);
        setTypeOptions(typesResponse.data.map((t) => t.name));
        setBrandOptions(brandsResponse.data.map((b) => b.name));
        setMaterialOptions(materialsResponse.data.map((m) => m.name));
      } catch (error) {
        toast.error(
          "Lỗi khi tải danh sách loại hàng, thương hiệu và chất liệu: " +
            error.message
        );
      }
    };
    fetchOptions();
  }, []);

  const resetForm = () => {
    setName("");
    setProductId("");
    setPrice("");
    setDescription("");
    setImage(null);
    setType("");
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
      setType(product.type || "");
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
      let imageUrl =
        "https://xrmccpvwxagewnbwjnra.supabase.co/storage/v1/object/public/public_picture/no_picture.jpg";
      if (product && product.image_url) {
        imageUrl = product.image_url;
      }
      let deleteOldImagePromise = Promise.resolve();
      if (image) {
        if (product && product.image_url) {
          const oldImagePath = product.image_url.substring(
            product.image_url.lastIndexOf("/") + 1
          );
          deleteOldImagePromise = axios
            .delete(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/best-selling-images/${oldImagePath}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  apikey: import.meta.env.VITE_SUPABASE_KEY,
                },
              }
            )
            .catch((err) => {
              console.warn("Failed to delete old image:", err.message);
            });
        }
        const compressedImage = await compressImage(image);
        const formData = new FormData();
        formData.append("file", compressedImage);
        await Promise.all([
          deleteOldImagePromise,
          axios.post(
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
          ),
        ]);
        imageUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/best-selling-images/${compressedImage.name}`;
      }

      const productData = {
        name,
        product_id: productId,
        price: skipPrice
          ? null
          : parseFloat(price.replace(/[^0-9]/g, "")) || null,
        description,
        image_url: imageUrl,
        type,
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
        await axios.patch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/favorites?product_id=eq.${
            product.id
          }&table_name=eq.${table}`,
          {
            product_name: name,
            product_code: productId || null,
          },
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

  const handleOptionsUpdate = async () => {
    try {
      const headers = {
        apikey: import.meta.env.VITE_SUPABASE_KEY,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };
      const [typesResponse, brandsResponse, materialsResponse] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/types`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/brands`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/materials`, {
            headers,
          }),
        ]);
      setTypeOptions(typesResponse.data.map((t) => t.name));
      setBrandOptions(brandsResponse.data.map((b) => b.name));
      setMaterialOptions(materialsResponse.data.map((m) => m.name));
      onSave(); // Trigger parent component update
    } catch (error) {
      toast.error("Lỗi khi cập nhật danh sách: " + error.message);
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
            required={!skipPrice}
            disabled={skipPrice}
            className="bsf-form-input"
          />
        </Form.Group>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSkipPrice(!skipPrice)}
          disabled={false}
          className="bsf-form-btn bsf-mt-2 skip-price-btn"
          style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
        >
          {skipPrice ? "Nhập giá" : "Không nhập giá"}
        </Button>
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
          <div className="bsf-form-group-label">
            <Form.Label>Loại hàng</Form.Label>
          </div>
          <div className="bsf-input-button-group">
            <Form.Control
              as="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bsf-form-input"
              required
            >
              <option value="">Chọn loại hàng</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Control>
            <Button
              variant="primary"
              size="sm"
              className="create-new-btn"
              onClick={() => setShowTypeModal(true)}
            >
              Tạo mới
            </Button>
            <CreateTypeModal
              show={showTypeModal}
              onHide={() => setShowTypeModal(false)}
              onSave={handleOptionsUpdate}
            />
          </div>
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <div className="bsf-form-group-label">
            <Form.Label>Thương hiệu</Form.Label>
          </div>
          <div className="bsf-input-button-group">
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
            <Button
              variant="primary"
              size="sm"
              className="create-new-btn"
              onClick={() => setShowBrandModal(true)}
            >
              Tạo mới
            </Button>
            <CreateBrandModal
              show={showBrandModal}
              onHide={() => setShowBrandModal(false)}
              onSave={handleOptionsUpdate}
            />
          </div>
        </Form.Group>
        <Form.Group className="bsf-form-group">
          <div className="bsf-form-group-label">
            <Form.Label>Chất liệu</Form.Label>
          </div>
          <div className="bsf-input-button-group">
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
            <Button
              variant="primary"
              size="sm"
              className="create-new-btn"
              onClick={() => setShowMaterialModal(true)}
            >
              Tạo mới
            </Button>
            <CreateMaterialModal
              show={showMaterialModal}
              onHide={() => setShowMaterialModal(false)}
              onSave={handleOptionsUpdate}
            />
          </div>
        </Form.Group>
        <Form.Group className="bsf-form-group">
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
