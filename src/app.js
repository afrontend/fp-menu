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

const run = (command) => {
  const { spawn } = require('child_process');
  const child = spawn(command.program, command.args);
  child.stdout.on('data', (data) => {
    console.log(`${command.name} stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`${command.name} stderr: ${data}`);
  });
  child.on('close', (code) => {
    console.log(`${command.name} child process exited with code ${code}`);
  });
}

document.querySelector(".terminator").addEventListener('click', function () {
  run({
    name: "terminator",
    program: "terminator",
    args: []
  });
})

document.querySelector(".localhost").addEventListener('click', function () {
  run({
    name: "localhost",
    program: "google-chrome-stable",
    args: ['http://localhost:3000']
  });
})
