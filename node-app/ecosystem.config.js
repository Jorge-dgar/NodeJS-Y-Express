module.exports = {
  apps: [
    {
      name: "server",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "server-cluster",
      script: "server-cluster.js",
      instances: 0,
      exec_mode: "cluster",
    },
  ],
};
