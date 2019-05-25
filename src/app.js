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

const commands = [
  {
    className: "terminator",
    name: "terminator",
    program: "terminator",
    args: []
  },
  {
    className: "localhost",
    name: "localhost",
    program: "google-chrome-stable",
    args: ['http://localhost:3000']
  }
];

const getButton = (name) => {
  const button = document.createElement("button");
  button.style.width = "100%"
  button.className = name;
  button.appendChild(document.createTextNode(name));
  return button;
}

const appendHtmlContent = () => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";

  _.each(commands, (command) => {
    div.appendChild(getButton(command.className));
  });

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

const addCommandButton = (command) => {
  document.querySelector(`.${command.className}`).addEventListener('click', function () {
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
