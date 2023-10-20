import "dotenv/config";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import transporter from "../helpers/emailTransport.js";
import { systemLogs } from "./Logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (email, subject, payload, template) => {
  try {
    // in the current directory look for folder called templates
    const sourceDirectory = fs.readFileSync(path.join(__dirname, template));
    // use handlebars to compile all the templates in this directory
    const compiledTemplate = handlebars.compile(sourceDirectory);
    const emailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error(err);
    systemLogs.error(`email not send: ${error}`);
  }
};

export default sendEmail;

// (alias) fileURLToPath(url: string | URL): string (+1 overload)
// import fileURLToPath
// This function ensures the correct decodings of percent-encoded characters
// as well as ensuring a cross-platform valid absolute path string.

// import { fileURLToPath } from 'node:url';

// const __filename = fileURLToPath(import.meta.url);

// new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
// fileURLToPath('file:///C:/path/');         // Correct:   C:\path\ (Windows)

// new URL('file://nas/foo.txt').pathname;    // Incorrect: /foo.txt
// fileURLToPath('file://nas/foo.txt');       // Correct:   \\nas\foo.txt (Windows)

// new URL('file:///你好.txt').pathname;      // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
// fileURLToPath('file:///你好.txt');         // Correct:   /你好.txt (POSIX)

// new URL('file:///hello world').pathname;   // Incorrect: /hello%20world
// fileURLToPath('file:///hello world');      // Correct:   /hello world (POSIX)
// @since — v10.12.0

// @param url — The file URL string or URL object to convert to a path.

// @return — The fully-resolved platform-specific Node.js file path
