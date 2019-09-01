import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import Mousetrap from "mousetrap";
import _ from "lodash"
import env from "env";
import fs from 'fs';
import jetpack from "fs-jetpack";
import path from 'path';
import { greet } from "./hello_world/hello_world";
import { remote } from "electron";
import { spawn } from 'child_process';
import { run, getCmdList } from './menu';

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const DEFAULT_RC_FILE = ".xmenu.json";

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const config = (function () {
  const op = {};
  op.color = 'black';
  op.bgColor = 'white';
  const setColor = (color = 'black', bgColor = 'white') => {
    op.color = color;
    op.bgColor = bgColor;
  }

  const getColor = () => {
    return {
      color: op.color,
      bgColor: op.bgColor
    };
  }
  return {
    setColor,
    getColor
  }
})();

const COLOR = 'black'
const BGCOLOR = "#F2F1F0"

const addSpace = name => {
  return name.replace(/ /g, '&nbsp;');
};

const getButton = cmd => {
  const button = document.createElement("div");
  const { color, bgColor } = config.getColor();
  button.className = cmd.id;
  button.style.color = color;
  button.style.backgroundColor = bgColor;
  button.style.fontSize = "1.8em";
  button.style.height = "2em";
  button.style.lineHeight= "2em";
  button.style.marginBottom = "1px";
  button.style.width = "400px";
  button.style.paddingRight = "5px";
  button.style.paddingLeft = "5px";
  button.innerHTML = addSpace(cmd.name);
  return button;
}

const addButtons = cmdAry => {
  const div = document.createElement("div");
  div.id = "app";
  div.className = "container";
  div.style = "display: none";

  _.each(cmdAry, cmd => {
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

const runById = (id) => {
  _.each(cmdList, cmd => {
    if (cmd.id == id) {
      cmd.focused = true;
    } else {
      cmd.focused = false;
    }
  });

  render(cmdList);
  runFocusedItem(cmdList);
}

const runFocusedItem = cmdAry => {
  const found = _.find(cmdAry, (cmd) => cmd.focused === true);
  if (!found) return;
  if (!found.program) {
    console.warn("Invalid program");
    return;
  }
  run(found.program, found.args);
  app.quit();
};

const addCommandEvent = id => {
  document.querySelector(`.${id}`).addEventListener('click', function () {
    runById(id);
  })
};

const addCommands = cmdAry => {
  _.each(cmdAry, cmd => {
    addCommandEvent(cmd.id);
  })
}

const render = cmdAry => {
  const { color, bgColor } = config.getColor();
  _.each(cmdAry, cmd => {
    if (cmd.focused) {
      document.querySelector(`.${cmd.id}`).style.color = bgColor;
      document.querySelector(`.${cmd.id}`).style.backgroundColor = color;
    } else {
      document.querySelector(`.${cmd.id}`).style.color = color;
      document.querySelector(`.${cmd.id}`).style.backgroundColor = bgColor;
    }
  });
}

const focusNextButton = cmdAry => {
  if (!(cmdAry.length > 1)) {
    return;
  }
  if (_.every(cmdAry, (cmd) => (!cmd.focused))) {
    cmdAry[0].focused = true;
  } else {
    const index = _.findIndex(cmdAry, { focused: true })
    cmdAry[index].focused = false;
    if (cmdAry[index + 1]) {
      cmdAry[index + 1].focused = true;
    } else {
      cmdAry[0].focused = true;
    }
  }

  render(cmdAry);
}

const focusPrevButton = cmdAry => {
  if (!(cmdAry.length > 1)) {
    return;
  }
  if (_.every(cmdAry, (cmd) => (!cmd.focused))) {
    cmdAry[0].focused = true;
  } else {
    const index = _.findIndex(cmdAry, { focused: true })
    cmdAry[index].focused = false;
    if (cmdAry[index - 1]) {
      cmdAry[index - 1].focused = true;
    } else {
      cmdAry[cmdAry.length - 1].focused = true;
    }
  }

  render(cmdAry);
}

const activate = cmdAry => {
  if (!cmdAry) return [];

  if (cmdAry[0]) {
    cmdAry[0].focused = true;
  }

  addButtons(cmdAry);
  displayAppInfo();
  addCommands(cmdAry);
  render(cmdAry);
  Mousetrap.bind('j', () => { focusNextButton(cmdAry); });
  Mousetrap.bind('down', () => { focusNextButton(cmdAry); });
  Mousetrap.bind('k', () => { focusPrevButton(cmdAry); });
  Mousetrap.bind('up', () => { focusPrevButton(cmdAry); });
  Mousetrap.bind('enter', () => { runFocusedItem(cmdAry); });
  Mousetrap.bind('q', () => { app.quit(); });
}

const makeCmd = (cmd, index) => {
  return {
    id: `id${index}`,
    name: cmd.title,
    program: cmd.program.split(' ')[0],
    args: _.tail(cmd.program.split(' '))
  }
}

const notify = (msg) => {
  new Notification('Info', { body: msg });
}

const argv = remote.getGlobal('sharedObject').argv;
argv.shift();
if (argv[0] === ".") {
  argv.shift();
}
const cmdList = getCmdList(argv);

activate(cmdList);
