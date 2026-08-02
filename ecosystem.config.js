module.exports = {
  apps: [
    {
      name: "anyrem-mcp",
      script: "pnpm",
      args: "start:http",
      watch: false,
      ignore_watch: ["node_modules"],
      instances: 1,
    },
  ],
};
