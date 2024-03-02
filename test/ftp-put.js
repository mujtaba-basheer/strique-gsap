const FtpClient = require("ftp");
require("dotenv").config();

const ftp = new FtpClient();

ftp.on("ready", () => {
  console.log("FTP client connected successfully.");
  ftp.put(
    "dist/min/index.min.js",
    "./domains/mujtababasheer.com/public_html/js/strique.min.js",
    false,
    (err) => {
      if (err) console.error(err);
      else console.log("File PUT successfully");
      ftp.end();
    }
  );
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
