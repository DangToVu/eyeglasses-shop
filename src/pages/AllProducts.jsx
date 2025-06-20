import { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AllProductForm from "../components/AllProductForm.jsx";
import AllProductCard from "../components/AllProductCard.jsx";
import "../styles/pages/AllProducts.css";
import LoadingScreen from "../components/LoadingScreen";
import ConfirmBox from "../components/ConfirmBox";

function AllProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [regularProducts, setRegularProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, table: null });
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
            },
          }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  };

  const handleDelete = (id, table) => {
    setDeleteData({ id, table });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      let productToDelete = null;
      let imagePath = "";
      let bucket = "";

      if (deleteData.table === "products") {
        productToDelete = regularProducts.find((p) => p.id === deleteData.id);
        bucket = "product-images";
      } else if (deleteData.table === "best_selling_glasses") {
        productToDelete = bestSellingProducts.find(
          (p) => p.id === deleteData.id
        );
        bucket = "best-selling-images";
      } else if (deleteData.table === "all_product") {
        productToDelete = allProducts.find((p) => p.id === deleteData.id);
        bucket = "all-product-images";
      }

      if (productToDelete) {
        if (productToDelete.image_url) {
          imagePath = productToDelete.image_url.substring(
            productToDelete.image_url.lastIndexOf("/") + 1
          );
        } else if (productToDelete.image) {
          imagePath = productToDelete.image.substring(
            productToDelete.image.lastIndexOf("/") + 1
          );
        }
        if (imagePath && bucket) {
          await axios.delete(
            `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/${bucket}/${imagePath}`,
            {
              headers: {
                apikey: import.meta.env.VITE_SUPABASE_KEY,
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      }

      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${
          deleteData.table
        }?id=eq.${deleteData.id}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Prefer: "return=representation",
          },
        }
      );

      if (deleteData.table === "products") {
        setRegularProducts(
          regularProducts.filter((p) => p.id !== deleteData.id)
        );
      } else if (deleteData.table === "best_selling_glasses") {
        setBestSellingProducts(
          bestSellingProducts.filter((p) => p.id !== deleteData.id)
        );
      } else if (deleteData.table === "all_product") {
        setAllProducts(allProducts.filter((p) => p.id !== deleteData.id));
      }
      toast.success("Xóa sản phẩm thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setDeleteData({ id: null, table: null });
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteData({ id: null, table: null });
  };

  const allProductsList = [
    ...regularProducts.map((p) => ({ ...p, table: "products" })),
    ...bestSellingProducts.map((p) => ({
      ...p,
      table: "best_selling_glasses",
      image: p.image_url,
    })),
    ...allProducts.map((p) => ({
      ...p,
      table: "all_product",
      image: p.image_url,
    })),
  ];

  return (
    <div className="page-wrapper">
      {isLoading && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="all-products-container">
        <Button
          variant="secondary"
          className="back-btn mb-3"
          onClick={() => navigate("/card-management")}
        >
          Quay lại
        </Button>
        <h2 className="all-products-title my-4">Tất cả sản phẩm</h2>
        {isAdmin && (
          <AllProductForm
            product={selectedProduct}
            onSave={handleSave}
            table={selectedProduct ? selectedProduct.table : "all_product"}
          />
        )}
        {isAdmin ? (
          <Table striped bordered hover className="all-products-table mt-4">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mã sản phẩm</th>
                <th>Giá</th>
                <th>Mô tả</th>
                <th>Ảnh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {allProductsList.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.product_id || "-"}</td>
                  <td>{product.price}</td>
                  <td>{product.description || "-"}</td>
                  <td>
                    <img
                      src={product.image || product.image_url}
                      alt={product.name}
                      width="50"
                      style={{ borderRadius: "4px" }}
                      onError={() =>
                        console.log(
                          "Lỗi tải ảnh:",
                          product.image || product.image_url
                        )
                      }
                    />
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      className="all-products-btn me-2"
                      onClick={() => setSelectedProduct(product)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      className="all-products-btn"
                      onClick={() => handleDelete(product.id, product.table)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="all-products-cards">
            {allProductsList.map((product) => (
              <div key={product.id} className="product-item">
                <AllProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default AllProducts;
