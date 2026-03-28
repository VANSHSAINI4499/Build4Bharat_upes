import React from 'react';
import '../Styles/Product.css';
import Subtitles from './Subtitles';
import {useNavigate} from 'react-router-dom'

const Productdetails = () => {
  const product = {
    title: 'Web Development Course With Python',
    description: 'Master the art of building modern, responsive websites with HTML, CSS, JavaScript, and React in this hands-on web development course.',
    price: 1299,
    images: [
      'https://th.bing.com/th/id/OIP.4M26FjQyNM9zcNhiU8pckgHaEK?w=284&h=180&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3',
      'https://th.bing.com/th/id/OIP.DKfUeszXOH15EOtW5SMayAHaEK?w=284&h=180&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3',
      'https://th.bing.com/th/id/OIP.rl3yw44k59V_RUunnheLeAHaEK?w=331&h=186&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3',
    ],
    rating: 4.6,
    reviews: [
      { user: 'Aarav', comment: 'Super comfy and stylish!' },
      { user: 'Meera', comment: 'Love the quality and fit.' },
    ],
    stock: 12,
    variants: ['S', 'M', 'L', 'XL'],
    shippingInfo: 'Free delivery within 5–7 days across India.',
  };

  const navigate = useNavigate();

  const move = ()=>{
    navigate("/video")
  }

  return (
    <div className="product-details">
      <div className="product-images">
        {product.images.map((img, index) => (
          <img key={index} src={img} alt={`${product.title} view ${index + 1}`} />
        ))}
      </div>

      <div className="product-info">
        <h1>{product.title}</h1>
        <p className="short-description">{product.description}</p>
        <p className="price">₹{product.price}</p>
        <p className="stock-status">
          {product.stock > 0 ? `In stock (${product.stock} left)` : 'Out of stock'}
        </p>

        <div className="variants">
          <label htmlFor="variant-select">Slots Available:</label>
          <select id="variant-select">
            {product.variants.map((variant, idx) => (
              <option key={idx} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </div>

        <div className="ratings">
          <span>⭐ {product.rating} / 5</span>
          <span>({product.reviews.length} reviews)</span>
        </div>

        <button className="add-to-cart" disabled={product.stock === 0} onClick={move}>
          Watch Video Now
        </button>

        <p className="shipping">{product.shippingInfo}</p>

        {/* Subtitles component with spacing */}
        <div className="subtitles-wrapper">
          <Subtitles />
        </div>
      </div>
    </div>
  );
};

export default Productdetails;