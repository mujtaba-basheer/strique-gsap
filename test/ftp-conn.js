const FtpClient = require("ftp");
require("dotenv").config();

const ftp = new FtpClient();

ftp.on("ready", () => {
  console.log("FTP client connected successfully.");
  ftp.end();
});
ftp.on("error", (err) => {
  console.error(err);
});

ftp.connect({
  host: process.env.FTP_HOST,
  user: process.env.FTP_USERNAME,
  port: process.env.FTP_PORT,
  password: process.env.FTP_PASSWORD,
});
