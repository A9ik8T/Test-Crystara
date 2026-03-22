import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import categoryChipBracelet from "@/assets/category-chip-bracelet.jpg";
import categoryBeadsBracelet from "@/assets/category-beads-bracelet.jpg";
import categoryRing from "@/assets/category-ring.jpg";
import categoryLocket from "@/assets/category-locket.jpg";
import categoryPyramids from "@/assets/category-pyramids.jpg";

const categories = [
  {
    name: "Chip Bracelet",
    description: "Natural crystal chips",
    image: categoryChipBracelet,
    href: "/category/bracelets/chip-bracelet",
  },
  {
    name: "Beads Bracelet",
    description: "Polished healing beads",
    image: categoryBeadsBracelet,
    href: "/category/bracelets/beads-bracelet",
  },
  {
    name: "Ring",
    description: "Crystal energy rings",
    image: categoryRing,
    href: "/category/rings",
  },
  {
    name: "Locket",
    description: "Healing pendants",
    image: categoryLocket,
    href: "/category/lockets",
  },
  {
    name: "Pyramid",
    description: "Vastu & spiritual healing",
    image: categoryPyramids,
    href: "/category/pyramids",
  },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-gradient-aurora">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of healing crystals and spiritual products
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={category.href}
                className="group block relative overflow-hidden rounded-xl aspect-square shadow-crystal"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-serif font-semibold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/70">
                    {category.description}
                  </p>
                </div>
                <div className="absolute inset-0 border-2 border-primary/0 rounded-xl transition-all duration-300 group-hover:border-primary/50" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
