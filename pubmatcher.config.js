module.exports = {
  apps : [{
    name   : "Pub Matcher",
    script : "./server.js",
    env_production: {
	NODE_ENV: "production"
    },
    env_development: {
	NODE_ENV: "development"
    }
  }]
}
