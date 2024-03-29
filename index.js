const FtpClient = require("ftp");
const minify = require("babel-minify");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const ftp = new FtpClient();

const upload = (file) => {
  return new Promise((res, rej) => {
    ftp.put(
      `dist/min/${file}`,
      `./domains/mujtababasheer.com/public_html/js/${file}`,
      (err) => {
        if (err) return rej(err);
        res(null);
      }
    );
  });
};

const init = async () => {
  const filesToUpload = [
    "strique",
    // ""
  ];

  for (const file of filesToUpload) {
    try {
      const inputCode = fs.readFileSync(`dist/${file}.js`, {
        encoding: "utf8",
      });
      const lb = inputCode.indexOf("\n");
      const outputCode = minify(inputCode.substring(lb + 1), {}).code;
      fs.writeFileSync(`dist/min/${file}.min.js`, outputCode, {
        encoding: "utf8",
      });
      await upload(file + ".min.js");
      console.log(`Uploaded: ${file}.min.js`);
    } catch (error) {
      console.error(error);
    }
  }

  ftp.end();
};

ftp.on("ready", init);
ftp.connect({
  host: process.env.FTP_HOST,
  user: process.env.FTP_USERNAME,
  port: process.env.FTP_PORT,
  password: process.env.FTP_PASSWORD,
});
