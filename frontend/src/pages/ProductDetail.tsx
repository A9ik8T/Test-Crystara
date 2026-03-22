import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, Sparkles, Shield, Truck, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductById, useAllProducts } from "@/hooks/useProducts";

import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { data: product, isLoading } = useProductById(productId);
  const { data: allProducts = [] } = useAllProducts();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const relatedProducts = product
    ? allProducts.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4)
    : [];

  // Build gallery from Sanity images (primary + gallery), fallback to just primary
  const galleryImages = product
    ? [product.image, ...(product.galleryImages || [])].filter(Boolean)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="animate-pulse bg-muted rounded-xl h-96" />
              <div className="space-y-4">
                <div className="animate-pulse bg-muted rounded h-8 w-3/4" />
                <div className="animate-pulse bg-muted rounded h-6 w-1/2" />
                <div className="animate-pulse bg-muted rounded h-10 w-1/3" />
                <div className="animate-pulse bg-muted rounded h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h1 className="text-2xl font-serif font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6 text-sm">The product you're looking for doesn't exist.</p>
            <Link to="/shop"><Button><ChevronLeft size={18} className="mr-2" />Back to Shop</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const features = [
    { icon: Sparkles, text: "100% Natural Crystal" },
    { icon: Shield, text: "Energetically Cleansed" },
    { icon: Truck, text: "Free Delivery above ₹999" },
    { icon: RotateCcw, text: "7 Days Easy Return" },
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price,
      originalPrice: product.originalPrice, image: product.image, category: product.category, subCategory: product.subCategory,
    }, quantity);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id, name: `${product.name} ${product.subCategory}`, price: product.price,
      originalPrice: product.originalPrice, image: product.image, category: product.category, subCategory: product.subCategory,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mb-6 md:mb-8 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/category/${product.categorySlug}`} className="hover:text-foreground transition-colors">{product.category}</Link>
            <span>/</span>
            <Link to={`/category/${product.categorySlug}/${product.subCategorySlug}`} className="hover:text-foreground transition-colors">{product.subCategory}</Link>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-12">
            {/* Product Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <ProductImageGallery images={galleryImages} productName={product.name} />
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
              <span className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider mb-1">{product.subCategory}</span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold mb-3">{product.name} {product.subCategory}</h1>
              <p className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-6">{product.benefit}</p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg md:text-xl text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <Badge variant="destructive" className="text-xs">-{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <Badge variant="secondary" className="w-fit bg-accent/20 text-accent-foreground mb-6 text-xs">+ Exclusive Gifts</Badge>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-sm md:text-base">About this crystal</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  This beautiful {product.name} is carefully selected for its exceptional quality and powerful
                  metaphysical properties. Known for its ability to {product.benefit.toLowerCase()}, this crystal
                  makes a perfect addition to your spiritual practice or as a meaningful gift.
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-medium text-sm">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></Button>
                  <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingBag size={18} className="mr-2" /> Add to Cart
                </Button>
                <Button size="lg" variant="outline" onClick={handleToggleWishlist}>
                  <Heart size={18} className="mr-2" fill={isWishlisted ? "currentColor" : "none"} />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                    <feature.icon size={16} className="text-primary flex-shrink-0" />
                    <span className="text-xs md:text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-16 md:mt-20">
              <h2 className="text-xl md:text-3xl font-serif font-bold mb-6 md:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {relatedProducts.map((rp, index) => (
                  <ProductCard key={rp.id} product={{ id: rp.id, name: `${rp.name} ${rp.subCategory}`, price: rp.price, originalPrice: rp.originalPrice, image: rp.image, category: rp.category, benefit: rp.benefit }} index={index} linkTo={`/product/${rp.id}`} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
