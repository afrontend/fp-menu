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

const getButton = (command) => {
  const button = document.createElement("div");
  button.className = command.className;
  button.style.color = COLOR;
  button.style.backgroundColor = BGCOLOR;
  button.style.fontSize = "24px";
  button.style.height = "40px";
  button.style.marginBottom = "1px";
  button.style.width = "100%";
  button.appendChild(document.createTextNode(command.name));
  return button;
}

const addButtons = (commands) => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";

  _.each(commands, (command) => {
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

const addCommandEvent = (command) => {
  document.querySelector(`.${command.className}`).addEventListener('click', function () {
    if (command.focused) {
      run(command);
    }
  })
};

const addCommands = (commands) => {
  _.each(commands, (command) => {
    addCommandEvent(command);
  })
}

const updateButtons = (commands) => {
  _.each(commands, (command) => {
    if (command.focused) {
      document.querySelector(`.${command.className}`).style.color = BGCOLOR;
      document.querySelector(`.${command.className}`).style.backgroundColor = COLOR;
    } else {
      document.querySelector(`.${command.className}`).style.color = COLOR;
      document.querySelector(`.${command.className}`).style.backgroundColor = BGCOLOR;
    }
  });
}

const focusNextButton = (commands) => {
  console.log();
  if (commands[commands.length - 1].focused) {
    _.each(commands, (command) => {
      command.focused = false;
    });
    commands[0].focused = true;
  } else {
    let found = false;
    _.each(commands, (command) => {
      if (found) {
        found = false;
        command.focused = true;
      } else if (command.focused) {
        found = true;
        command.focused = false;
      } else {
        command.focused = false;
      }
    });
  }

  updateButtons(commands);
}

const activate = (commands) => {
  addButtons(commands);
  displayAppInfo();
  addCommands(commands);
  updateButtons(commands);

  Mousetrap.bind('j', function() { focusNextButton(commands) });
}


activate([
  {
    className: "terminator",
    name: "터미널",
    program: "terminator",
    args: [],
    focused: true
  },
  {
    className: "localhost",
    name: "로컬 웹 서버 접속",
    program: "google-chrome-stable",
    args: ['http://localhost:3000'],
    focused: false
  }
]);
