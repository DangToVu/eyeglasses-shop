import { Card } from "react-bootstrap";
import "../styles/components/AllProductCard.css";

function AllProductCard({ product }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Card className="all-prod-card-container">
      <Card.Img
        variant="top"
        src={product.image || product.image_url}
        alt={product.name}
        className="all-prod-card-image"
      />
      <Card.Body className="all-prod-card-body">
        <Card.Title className="all-prod-card-title">{product.name}</Card.Title>
        <Card.Text className="all-prod-card-text">
          Thương hiệu: {product.brand || "-"}
          <br />
          Mã sản phẩm: {product.product_id || "-"}
          <br />
          Giá: {formatCurrency(product.price)}
          <br />
          Chất liệu: {product.material || "-"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default AllProductCard;
