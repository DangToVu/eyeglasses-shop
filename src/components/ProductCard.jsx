import { Card } from "react-bootstrap";
import "../styles/components/ProductCard.css";

function ProductCard({ product }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Card className="prod-card">
      <Card.Img
        variant="top"
        src={product.image_url} // Updated from product.image to product.image_url
        alt={product.name}
        className="prod-img"
        loading="lazy"
        onError={(e) => {
          e.target.src = "/path/to/fallback-image.jpg"; // Fallback image for broken links
          console.log("Lỗi tải ảnh:", product.image_url);
        }}
      />
      <Card.Body className="prod-body">
        <Card.Title className="prod-title">{product.name}</Card.Title>
        <Card.Text className="prod-text">
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

export default ProductCard;
