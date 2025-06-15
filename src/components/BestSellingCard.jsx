import { Card } from "react-bootstrap";
import "../styles/components/BestSellingCard.css";

function BestSellingCard({ product }) {
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
    <Card className="best-selling-card">
      <Card.Img
        variant="top"
        src={product.image_url}
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

export default BestSellingCard;
