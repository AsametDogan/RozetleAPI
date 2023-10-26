module.exports = {
  apps: [
    {
      name: "rozetle",
      script: "ts-node ./src/index.ts",
      out_file: "./logs/out_pm2.log",
      error_file: "./logs/error_pm2.log",
    },
  ],
};
