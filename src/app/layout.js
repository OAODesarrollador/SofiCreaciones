import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sofi Creaciones - Disfraces e Indumentaria",
  description: "Descubrí la mejor selección de disfraces, uniformes y accesorios profesionales.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
