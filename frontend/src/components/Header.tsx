import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, User, Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import SearchModal from "@/components/SearchModal";
import { useProductCatalog } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: productCatalog = [] } = useProductCatalog();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-lg md:text-3xl font-serif font-bold text-gradient-mystic leading-tight">
                Crystara
              </h1>
              <p className="text-[10px] tracking-widest text-muted-foreground -mt-0.5">
                Crafted for Energy. Designed for You.
              </p>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}

              {/* All Categories Dropdown - Horizontal */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                  All Categories
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-0 right-0 top-[80px] z-50 bg-card border-b border-border shadow-lg"
                    >
                      <div className="container mx-auto px-4 py-6">
                        <div className="flex gap-8 overflow-x-auto">
                          {productCatalog.map((category) => (
                            <div key={category.id} className="flex-shrink-0 min-w-[160px]">
                              <Link
                                to={`/category/${category.slug}`}
                                className="font-serif font-semibold text-primary hover:text-primary/80 transition-colors mb-3 block text-sm"
                              >
                                {category.name}
                              </Link>
                              <ul className="space-y-1.5">
                                {category.subCategories.map((sub) => (
                                  <li key={sub.id}>
                                    <Link
                                      to={`/category/${category.slug}/${sub.slug}`}
                                      className="text-xs text-muted-foreground hover:text-foreground transition-colors block py-0.5 whitespace-nowrap"
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-0.5 md:gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSearchOpen(true)}>
                <Search size={20} />
              </Button>
              <Link to={user ? "/profile" : "/auth"}>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User size={20} />
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Heart size={20} />
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.href} className="text-base font-medium py-2 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Categories */}
                <div className="border-t border-border pt-3">
                  <p className="font-serif font-semibold text-primary mb-3 text-sm">All Categories</p>
                  {productCatalog.map((category) => (
                    <div key={category.id} className="mb-3">
                      <Link to={`/category/${category.slug}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors block mb-1.5" onClick={() => setIsMenuOpen(false)}>
                        {category.name}
                      </Link>
                      <div className="pl-3 flex flex-wrap gap-x-3 gap-y-1">
                        {category.subCategories.slice(0, 4).map((sub) => (
                          <Link key={sub.id} to={`/category/${category.slug}/${sub.slug}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5" onClick={() => setIsMenuOpen(false)}>
                            {sub.name}
                          </Link>
                        ))}
                        {category.subCategories.length > 4 && (
                          <Link to={`/category/${category.slug}`} className="text-xs text-primary hover:text-primary/80 py-0.5" onClick={() => setIsMenuOpen(false)}>
                            +{category.subCategories.length - 4} more
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}>
                    <Search size={16} className="mr-1.5" /> Search
                  </Button>
                  <Link to={user ? "/profile" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm">
                      <User size={16} className="mr-1.5" /> {user ? "Account" : "Sign In"}
                    </Button>
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm">
                      <Heart size={16} className="mr-1.5" /> Wishlist
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
