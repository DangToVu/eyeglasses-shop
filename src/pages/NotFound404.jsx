import { Link } from "react-router-dom";
import { FaGlasses } from "react-icons/fa";
import "../styles/pages/NotFound404.css";

function NotFound404() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="glasses-icon">
          <FaGlasses size={80} />
        </div>
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          Có vẻ do bạn mờ mắt nên mở nhầm trang rồi.
        </p>
        <p className="not-found-submessage">
          Hãy quay về trang chủ để tìm cho mình một cặp kính thật xịn nhé!!
        </p>
        <Link to="/" className="not-found-button">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound404;
