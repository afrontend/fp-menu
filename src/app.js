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
import _ from "lodash"

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const appendHtmlContent = () => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";
  const terminatorButton = document.createElement("button");
  terminatorButton.style.width = "100%"
  terminatorButton.className = "terminator"
  terminatorButton.appendChild(document.createTextNode("terminator"));
  const localhostButton = document.createElement("button");
  localhostButton.style.width = "100%"
  localhostButton.className = "localhost"
  localhostButton.appendChild(document.createTextNode("localhost"));
  div.appendChild(terminatorButton);
  div.appendChild(localhostButton);
  document.getElementsByTagName("body")[0].appendChild(div);
  document.querySelector("#app").style.display = "block";
};

const displayAppInfo = () => {
  console.info(manifest.author);
  console.info(env.name);
  console.info(manifest.version);
  console.info(process.platform);
};

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
};

const commands = [
  {
    domSelector: ".terminator",
    name: "terminator",
    program: "terminator",
    args: []
  },
  {
    domSelector: ".localhost",
    name: "localhost",
    program: "google-chrome-stable",
    args: ['http://localhost:3000']
  }
];

const addCommandButton = (command) => {
  document.querySelector(command.domSelector).addEventListener('click', function () {
    run(command);
  })
};

const activate = () => {
  appendHtmlContent();
  displayAppInfo();
  _.each(commands, (command) => {
    addCommandButton(command);
  })
}

activate();
