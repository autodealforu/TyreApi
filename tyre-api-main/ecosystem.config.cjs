module.exports = {
  apps: [
    {
      name: 'api',
      cwd: '/var/www/api',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
