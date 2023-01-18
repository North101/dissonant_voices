module.exports = {
  apps: [
    {
      name: "Dissonant Voices",
      script: "dist/index.js",
      cwd: "server",
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}
