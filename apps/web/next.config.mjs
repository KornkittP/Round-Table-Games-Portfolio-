import createNextIntlPlugin from "next-intl/plugin"
export default createNextIntlPlugin()({
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/", destination: "/th", permanent: false }]
  }
})
