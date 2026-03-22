import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Sparkles, Heart, Shield, Star } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            About <span className="text-gradient-mystic">Crystara</span>
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Your trusted destination for authentic healing crystals and spiritual products.
          </p>

          {/* Story Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl p-8 md:p-12 border border-border"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Crystara was born from a deep passion for the healing power of crystals and a desire to share their magic with the world. Our journey began with a simple belief: that everyone deserves access to authentic, high-quality crystals that can transform their lives.
              </p>
              <p className="text-muted-foreground mb-4">
                We carefully source each crystal from trusted mines and suppliers around the world, ensuring that every piece carries genuine healing energy. Each crystal is cleansed, energized, and blessed before reaching you.
              </p>
              <p className="text-muted-foreground">
                Today, Crystara has grown into a community of crystal lovers, spiritual seekers, and wellness enthusiasts who believe in the transformative power of nature's most beautiful creations.
              </p>
            </motion.div>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              {
                icon: Sparkles,
                title: "Authenticity",
                description: "100% genuine natural crystals sourced ethically from around the world.",
              },
              {
                icon: Heart,
                title: "Passion",
                description: "Every crystal is selected with love and care for your spiritual journey.",
              },
              {
                icon: Shield,
                title: "Quality",
                description: "Premium grade crystals that meet our strict quality standards.",
              },
              {
                icon: Star,
                title: "Trust",
                description: "Thousands of satisfied customers trust Crystara for their crystal needs.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions? We'd love to hear from you.
            </p>
            <p className="text-primary font-medium">contact@crystara.com</p>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
