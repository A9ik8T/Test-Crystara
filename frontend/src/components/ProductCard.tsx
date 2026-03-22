import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    subCategory?: string;
    tag?: string;
    benefit?: string;
  };
  index?: number;
  linkTo?: string;
}

const ProductCard = ({ product, index = 0, linkTo }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const productLink = linkTo || `/product/${product.id}`;
  const wishlisted = isInWishlist(String(product.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      subCategory: product.subCategory,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      subCategory: product.subCategory,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <div className="relative bg-card rounded-xl overflow-hidden shadow-crystal hover:shadow-glow transition-shadow duration-300">
        <Link to={productLink} className="block relative aspect-square overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discount > 0 && <Badge variant="destructive" className="text-xs">-{discount}%</Badge>}
            <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">+ Exclusive Gifts</Badge>
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <Button size="icon" variant="secondary" className={`w-8 h-8 rounded-full ${wishlisted ? 'bg-primary text-primary-foreground' : 'bg-background/90 hover:bg-background'}`} onClick={handleToggleWishlist}>
              <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
            </Button>
            <Link to={productLink}>
              <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-background/90 hover:bg-background">
                <Eye size={14} />
              </Button>
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button className="w-full text-xs h-8" size="sm" onClick={handleAddToCart}>
              <ShoppingBag size={14} className="mr-1.5" /> Add to Cart
            </Button>
          </div>
        </Link>

        <Link to={productLink} className="block p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{product.category}</p>
          <h3 className="font-serif font-semibold text-foreground text-sm mb-0.5 line-clamp-2">{product.name}</h3>
          {product.benefit && <p className="text-[10px] text-muted-foreground mb-1.5">{product.benefit}</p>}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>}
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
