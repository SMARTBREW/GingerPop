module.exports = {
  apps: [
    {
      name: "gingerpop-backend",
      cwd: "/var/www/gingerpop-backend/backend",
      script: "dist/index.js",
      node_args: "--env-file=/var/www/gingerpop-backend/.env",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
