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
import Mousetrap from "mousetrap";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const COLOR = 'black'
const BGCOLOR = "#F2F1F0"

const getButton = cmd => {
  const button = document.createElement("div");
  button.className = cmd.className;
  button.style.color = COLOR;
  button.style.backgroundColor = BGCOLOR;
  button.style.fontSize = "24px";
  button.style.height = "40px";
  button.style.lineHeight= "40px";
  button.style.marginBottom = "1px";
  button.style.width = "100%";
  button.style.paddingRight = "5px";
  button.style.paddingLeft = "5px";
  button.appendChild(document.createTextNode(cmd.name));
  return button;
}

const addButtons = cmds => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";

  _.each(cmds, cmd => {
    div.appendChild(getButton(cmd));
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

const run = cmd => {
  if (Array.isArray(cmd)) {
    const found = _.find(cmd, (cmd) => cmd.focused === true);
    if (found) {
      return run(found);
    }
  }

  if (!cmd.program) {
    console.warn("Invalid program");
    return;
  }

  const { spawn } = require('child_process');
  const child = spawn(cmd.program, cmd.args);
  child.stdout.on('data', (data) => {
    console.log(`${cmd.name} stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`${cmd.name} stderr: ${data}`);
  });
  child.on('close', (code) => {
    console.log(`${cmd.name} child process exited with code ${code}`);
  });
};

const addCommandEvent = cmd => {
  document.querySelector(`.${cmd.className}`).addEventListener('click', function () {
    run(cmd);
  })
};

const addCommands = cmds => {
  _.each(cmds, cmd => {
    addCommandEvent(cmd);
  })
}

const render = cmds => {
  _.each(cmds, cmd => {
    if (cmd.focused) {
      document.querySelector(`.${cmd.className}`).style.color = BGCOLOR;
      document.querySelector(`.${cmd.className}`).style.backgroundColor = COLOR;
    } else {
      document.querySelector(`.${cmd.className}`).style.color = COLOR;
      document.querySelector(`.${cmd.className}`).style.backgroundColor = BGCOLOR;
    }
  });
}

const focusNextButton = cmds => {
  if (!(cmds.length > 1)) {
    return;
  }
  if (_.every(cmds, (cmd) => (!cmd.focused))) {
    cmds[0].focused = true;
  } else {
    const index = _.findIndex(cmds, { focused: true })
    cmds[index].focused = false;
    if (cmds[index + 1]) {
      cmds[index + 1].focused = true;
    } else {
      cmds[0].focused = true;
    }
  }

  render(cmds);
}

const focusPrevButton = cmds => {
  if (!(cmds.length > 1)) {
    return;
  }
  if (_.every(cmds, (cmd) => (!cmd.focused))) {
    cmds[0].focused = true;
  } else {
    const index = _.findIndex(cmds, { focused: true })
    cmds[index].focused = false;
    if (cmds[index - 1]) {
      cmds[index - 1].focused = true;
    } else {
      cmds[cmds.length - 1].focused = true;
    }
  }

  render(cmds);
}

const activate = cmds => {
  cmds[0].focused = true;

  addButtons(cmds);
  displayAppInfo();
  addCommands(cmds);
  render(cmds);
  Mousetrap.bind('j', () => { focusNextButton(cmds); });
  Mousetrap.bind('down', () => { focusNextButton(cmds); });
  Mousetrap.bind('k', () => { focusPrevButton(cmds); });
  Mousetrap.bind('up', () => { focusPrevButton(cmds); });
  Mousetrap.bind('enter', () => { run(cmds); });
}

const commands = [
  {
    className: "typora",
    name: "Typora",
    program: "typora",
    args: ["~/doc/document.md"]
  },
  {
    className: "folder",
    name: "Folder",
    program: "nautilus",
    args: []
  },
  {
    className: "terminator",
    name: "Terminator Terminal",
    program: "terminator",
    args: []
  },
  {
    className: "hyper",
    name: "Hyper Terminal",
    program: "hyper",
    args: []
  },
  {
    className: "localhost",
    name: "로컬 웹 서버 접속",
    program: "google-chrome-stable",
    args: ['http://localhost:3000']
  }
];

activate(commands);
