import { Card } from "react-bootstrap";
import "../styles/components/ProductCard.css";

function ProductCard({ product }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Cắt mô tả nếu vượt quá 50 ký tự và thêm dấu "..."
  const truncatedDescription = product.description
    ? product.description.length > 50
      ? product.description.substring(0, 50) + "..."
      : product.description
    : "-";

  return (
    <Card className="product-card">
      <Card.Img
        variant="top"
        src={product.image}
        alt={product.name}
        className="product-img"
      />
      <Card.Body className="product-body">
        <Card.Title className="product-title">{product.name}</Card.Title>
        <Card.Text className="product-text">
          Giá: {formatCurrency(product.price)}
          <br />
          Mô tả: {truncatedDescription}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
