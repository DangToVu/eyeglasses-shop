import { Card } from "react-bootstrap";
import "../styles/BestSellingCard.css"; // Import CSS đã cập nhật

function BestSellingCard({ product }) {
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
          Giá: {product.price} VNĐ
          <br />
          Mô tả: {product.description || "-"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default BestSellingCard;
