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

const getButton = command => {
  const button = document.createElement("div");
  button.className = command.className;
  button.style.color = COLOR;
  button.style.backgroundColor = BGCOLOR;
  button.style.fontSize = "24px";
  button.style.height = "40px";
  button.style.lineHeight= "40px";
  button.style.marginBottom = "1px";
  button.style.width = "100%";
  button.style.paddingRight = "5px";
  button.style.paddingLeft = "5px";
  button.appendChild(document.createTextNode(command.name));
  return button;
}

const addButtons = commands => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";

  _.each(commands, command => {
    div.appendChild(getButton(command));
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

const run = command => {
  if (Array.isArray(command)) {
    const found = _.find(command, (command) => command.focused === true);
    if (found) {
      return run(found);
    }
  }

  if (!command.program) {
    console.warn("Invalid program");
    return;
  }

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

const addCommandEvent = command => {
  document.querySelector(`.${command.className}`).addEventListener('click', function () {
    run(command);
  })
};

const addCommands = commands => {
  _.each(commands, command => {
    addCommandEvent(command);
  })
}

const render = commands => {
  _.each(commands, command => {
    if (command.focused) {
      document.querySelector(`.${command.className}`).style.color = BGCOLOR;
      document.querySelector(`.${command.className}`).style.backgroundColor = COLOR;
    } else {
      document.querySelector(`.${command.className}`).style.color = COLOR;
      document.querySelector(`.${command.className}`).style.backgroundColor = BGCOLOR;
    }
  });
}

const focusNextButton = commands => {
  if (!commands.length > 1) {
    return;
  }
  if (_.every(commands, (command) => (command.focused))) {
    commands[0].focused = true;
  } else {
    const currFocusedCommandIndex = _.findIndex(commands, { focused: true })
    commands[currFocusedCommandIndex].focused = false;
    if (commands[currFocusedCommandIndex + 1]) {
      commands[currFocusedCommandIndex + 1].focused = true;
    } else {
      commands[0].focused = true;
    }
  }

  render(commands);
}

const focusPrevButton = commands => {
  if (!commands.length > 1) {
    return;
  }
  if (_.every(commands, (command) => (command.focused))) {
    commands[0].focused = true;
  } else {
    const currFocusedCommandIndex = _.findIndex(commands, { focused: true })
    commands[currFocusedCommandIndex].focused = false;
    if (commands[currFocusedCommandIndex - 1]) {
      commands[currFocusedCommandIndex - 1].focused = true;
    } else {
      commands[commands.length - 1].focused = true;
    }
  }

  render(commands);
}

const activate = (commands) => {
  addButtons(commands);
  displayAppInfo();
  addCommands(commands);
  render(commands);
  Mousetrap.bind('j', () => { focusNextButton(commands); });
  Mousetrap.bind('down', () => { focusNextButton(commands); });
  Mousetrap.bind('k', () => { focusPrevButton(commands); });
  Mousetrap.bind('up', () => { focusPrevButton(commands); });
  Mousetrap.bind('enter', () => { run(commands); });
}

const commands = [
  {
    className: "typora",
    name: "Typora",
    program: "typora",
    args: ["~/doc/document.md"],
    focused: false
  },
  {
    className: "folder",
    name: "Folder",
    program: "nautilus",
    args: [],
    focused: false
  },
  {
    className: "terminator",
    name: "Terminator Terminal",
    program: "terminator",
    args: [],
    focused: false
  },
  {
    className: "hyper",
    name: "Hyper Terminal",
    program: "hyper",
    args: [],
    focused: false
  },
  {
    className: "localhost",
    name: "로컬 웹 서버 접속",
    program: "google-chrome-stable",
    args: ['http://localhost:3000'],
    focused: false
  }
];

commands[0].focused = true;

activate(commands);
