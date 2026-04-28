module.exports = {
  apps: [
    {
      name: "whatsapp-webhook-luhaif",
      cwd: "/var/www/whatsapp-webhook-luhaif",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
