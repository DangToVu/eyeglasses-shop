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
    <Card className="best-card">
      <Card.Img
        variant="top"
        src={product.image_url}
        alt={product.name}
        className="best-img"
      />
      <Card.Body className="best-body">
        <Card.Title className="best-title">{product.name}</Card.Title>
        <Card.Text className="best-text">
          Mã sản phẩm: {product.product_id || "-"}
          <br />
          Giá: {formatCurrency(product.price)}
          <br />
          Mô tả: {truncatedDescription}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default BestSellingCard;
