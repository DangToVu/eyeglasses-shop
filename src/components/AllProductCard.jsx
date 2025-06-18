import { Card } from "react-bootstrap";
import "../styles/components/AllProductCard.css";

function AllProductCard({ product }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const truncatedDescription = product.description
    ? product.description.length > 50
      ? product.description.substring(0, 50) + "..."
      : product.description
    : "-";

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

export default AllProductCard;
