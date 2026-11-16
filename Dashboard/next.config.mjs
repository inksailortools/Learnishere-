/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/dashboard",
  async rewrites() {
    const apiProxy =
      process.env.DJANGO_API_PROXY || "http://127.0.0.1:8000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxy}/:path*`,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
