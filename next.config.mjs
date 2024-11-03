/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 修改这里，使用正确的配置项
  experimental: {
    serverMinification: false,
  },
  // 在 package.json 的 scripts 中设置环境变量来控制端口和主机
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'http://localhost:8080/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?!text/html).*'
          }
        ]
      }
    ]
  }
};

export default nextConfig;