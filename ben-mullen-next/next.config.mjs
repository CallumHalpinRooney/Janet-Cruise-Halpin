/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Harvested photography is the content — allow modern formats and a
    // sensible set of device widths so next/image serves the right size.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
