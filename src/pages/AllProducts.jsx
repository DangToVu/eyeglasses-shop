import { useState, useEffect } from "react";
import { Container, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AllProductForm from "../components/AllProductForm.jsx";
import useAuthCheck from "../hooks/useAuthCheck.jsx";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { userRole, isLoading: authLoading } = useAuthCheck();
  const navigate = useNavigate();

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!authLoading && userRole !== "admin") {
      toast.error("Bạn không có quyền truy cập trang quản lý này!");
      navigate("/");
    }
  }, [userRole, authLoading, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const adminHeaders = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        };

        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          { headers: adminHeaders }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          { headers: adminHeaders }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          { headers: adminHeaders }
        );
        setBestSellingProducts(bestSellingResponse.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (userRole === "admin") {
      fetchProducts();
    }
  }, [userRole]);

  const handleSave = () => {
    setSelectedProduct(null);
    setIsLoading(true);
    const fetchProducts = async () => {
      try {
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_KEY,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        };

        const allResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/all_product`,
          { headers }
        );
        setAllProducts(allResponse.data);

        const regularResponse = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          { headers }
        );
        setRegularProducts(regularResponse.data);

        const bestSellingResponse = await axios.get(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/rest/v1/best_selling_glasses?select=*`,
          { headers }
        );
        setBestSellingProducts(bestSellingResponse.data);
        const allProductsList = [
          ...regularResponse.data,
          ...bestSellingResponse.data,
          ...allResponse.data,
        ];
        if (
          allProductsList.length === 0 ||
          allProductsList.length < allProducts.length
        ) {
          setCurrentPage(1);
          console.log("Saved, resetting to page 1, currentPage:", currentPage);
        } else {
          console.log("Saved, giữ currentPage:", currentPage);
        }
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  };

  const handleDelete = (id, table) => {
    if (userRole === "admin") {
      setDeleteData({ id, table });
      setShowConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (userRole === "admin") {
      setIsLoading(true);
      setShowConfirm(false);

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

        let deleteImagePromise = Promise.resolve();
        if (productToDelete && productToDelete.image_url) {
          imagePath = productToDelete.image_url.substring(
            productToDelete.image_url.lastIndexOf("/") + 1
          );
          deleteImagePromise = axios
            .delete(
              `${
                import.meta.env.VITE_SUPABASE_URL
              }/storage/v1/object/${bucket}/${imagePath}`,
              {
                headers: {
                  apikey: import.meta.env.VITE_SUPABASE_KEY,
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            )
            .catch((err) => {
              console.warn("Failed to delete image:", err.message);
            });
        }

        await Promise.all([
          deleteImagePromise,
          axios.delete(
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
          ),
        ]);

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
        const allProductsList = [
          ...regularProducts,
          ...bestSellingProducts,
          ...allProducts,
        ].filter((p) => p.id !== deleteData.id);
        if (currentPage > Math.ceil(allProductsList.length / itemsPerPage)) {
          setCurrentPage(1);
          console.log(
            "Deleted, resetting to page 1, currentPage:",
            currentPage
          );
        } else {
          console.log("Deleted, giữ currentPage:", currentPage);
        }
        toast.success("Xóa sản phẩm thành công!");
      } catch (error) {
        toast.error("Lỗi khi xóa: " + error.message);
      } finally {
        setIsLoading(false);
        setDeleteData({ id: null, table: null });
      }
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
    })),
    ...allProducts.map((p) => ({
      ...p,
      table: "all_product",
    })),
  ];

  const filteredProducts = allProductsList;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [...Array(endPage - startPage + 1).keys()].map(
    (i) => startPage + i
  );

  return (
    <div className="ap-page-wrapper">
      {(isLoading || authLoading) && <LoadingScreen />}
      {showConfirm && (
        <ConfirmBox
          message="Bạn có chắc chắn muốn xóa sản phẩm này không?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <Header />
      <Container className="ap-main-container" fluid>
        <h2 className="ap-main-title my-4">Quản lý tất cả sản phẩm</h2>

        <div className="ap-layout">
          <div className="ap-form-container">
            <AllProductForm
              product={selectedProduct}
              onSave={handleSave}
              table={selectedProduct ? selectedProduct.table : "all_product"}
            />
          </div>
          <div className="ap-list-container">
            <Table striped bordered hover className="ap-table mt-4">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mã sản phẩm</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Thương hiệu</th>
                  <th>Chất liệu</th>
                  <th>Ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.product_id || "-"}</td>
                    <td>{product.price}</td>
                    <td>{product.description || "-"}</td>
                    <td>{product.brand || "-"}</td>
                    <td>{product.material || "-"}</td>
                    <td>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        width="50"
                        style={{ borderRadius: "4px" }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/path/to/fallback-image.jpg";
                          console.log("Lỗi tải ảnh:", product.image_url);
                        }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        className="ap-btn me-2"
                        onClick={() => setSelectedProduct(product)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        className="ap-btn"
                        onClick={() => handleDelete(product.id, product.table)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="ap-pagination" key={currentPage}>
                <Button
                  variant="secondary"
                  onClick={firstPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </Button>
                <Button
                  variant="secondary"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;
                </Button>
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    variant={
                      currentPage === number ? "primary" : "outline-primary"
                    }
                    onClick={() => paginate(number)}
                    className="mx-1"
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </Button>
                <Button
                  variant="secondary"
                  onClick={lastPage}
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

export default AllProducts;
