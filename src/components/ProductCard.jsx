import { Card, Button } from "react-bootstrap";

function ProductCard({ product }) {
  return (
    <Card style={{ width: "18rem" }} className="mb-4">
      <Card.Img variant="top" src={product.image} alt={product.name} />
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>
          Giá: {product.price} VNĐ
          <br />
          Mô tả: {product.description}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
