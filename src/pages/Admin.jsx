import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import ProductForm from "../components/ProductForm.jsx";

function Admin() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_KEY,
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProducts(response.data);
      } catch (error) {
        toast.error("Lỗi khi lấy sản phẩm: " + error.message);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProducts(products.filter((product) => product.id !== id));
      toast.success("Xóa sản phẩm thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  const handleSave = () => {
    setSelectedProduct(null);
    const fetchProducts = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_KEY,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProducts(response.data);
    };
    fetchProducts();
  };

  return (
    <div>
      <Header />
      <Container>
        <h2 className="my-4">Quản lý sản phẩm</h2>
        <ProductForm product={selectedProduct} onSave={handleSave} />
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.description}</td>
                <td>
                  <img src={product.image} alt={product.name} width="50" />
                </td>
                <td>
                  <Button
                    variant="warning"
                    className="me-2"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
      <Footer />
    </div>
  );
}

export default Admin;
