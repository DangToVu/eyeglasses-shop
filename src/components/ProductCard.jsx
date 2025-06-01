import { Card, Button } from "react-bootstrap";
import "../styles/ProductCard.css"; // Import CSS

function ProductCard({ product }) {
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
          Giá: {product.price} VNĐ
          <br />
          Mô tả: {product.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
