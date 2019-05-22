import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { greet } from "./hello_world/hello_world";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

document.querySelector("#app").style.display = "block";
console.info(manifest.author);
console.info(env.name);
console.info(manifest.version);
console.info(process.platform);

document.querySelector("button").addEventListener('click', function () {
  const { spawn } = require('child_process');
  const terminator = spawn('terminator');

  terminator.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  terminator.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  terminator.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
})


