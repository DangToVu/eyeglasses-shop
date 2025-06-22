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
    <Card className="prod-card">
      <Card.Img
        variant="top"
        src={product.image}
        alt={product.name}
        className="prod-img"
      />
      <Card.Body className="prod-body">
        <Card.Title className="prod-title">{product.name}</Card.Title>
        <Card.Text className="prod-text">
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

export default ProductCard;
