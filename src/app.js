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
  button.className = cmd.id;
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
  run(cmdList);
}

const run = cmdAry => {
  const found = _.find(cmdAry, (cmd) => cmd.focused === true);
  if (!found) return;

  if (!found.program) {
    console.warn("Invalid program");
    return;
  }

  const { spawn } = require('child_process');
  const child = spawn(found.program, found.args);
  child.stdout.on('data', (data) => {
    console.log(`${found.name} stdout: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`${found.name} stderr: ${data}`);
  });
  child.on('close', (code) => {
    console.log(`${found.name} child process exited with code ${code}`);
  });
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
  _.each(cmdAry, cmd => {
    if (cmd.focused) {
      document.querySelector(`.${cmd.id}`).style.color = BGCOLOR;
      document.querySelector(`.${cmd.id}`).style.backgroundColor = COLOR;
    } else {
      document.querySelector(`.${cmd.id}`).style.color = COLOR;
      document.querySelector(`.${cmd.id}`).style.backgroundColor = BGCOLOR;
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
  Mousetrap.bind('enter', () => { run(cmdAry); });
}

const getCmdListFromArgv = () => {
  const remote = require('electron').remote;
  const ary = remote.getGlobal('sharedObject').argv;

  ary.shift();

  if (ary[0] === ".") {
    ary.shift();
  }

  const titleAry = _.filter(ary, (value, index) => (index % 2 === 0));
  const programAry = _.filter(ary, (value, index) => (index % 2 !== 0));
  const cmdAry = _.filter(
    _.zip(titleAry, programAry),
    pair => pair[0] && pair[1] && pair[0][0] !== '-'
  );

  return _.map(cmdAry, ([title, program], index) => {
    return {
      id: `id${index}`,
      name: title,
      program: program.split(' ')[0],
      args: _.tail(program.split(' '))
    }
  });
}

const getCmdListFromFile = () => {

/*
 * ~/.fp-menu.json
 *
 * {
 *   "cmdList": [
 *     {
 *       "title": "xeyes",
 *       "program": "xeyes"
 *     }
 *   ]
 * }
 */

  const fs = require('fs');
  const path = require('path');
  const rc_file_path = path.resolve(process.env.HOME, '.fp-menu.json')

  let cmdList = [];

  if (fs.existsSync(rc_file_path)) {
    const obj = JSON.parse(fs.readFileSync(rc_file_path, 'utf8'));
    cmdList = obj.cmdList;
  }

  return _.map(cmdList, (cmd, index) => {
    return {
      id: `id${index}`,
      name: cmd.title,
      program: cmd.program.split(' ')[0],
      args: _.tail(cmd.program.split(' '))
    }
  });
}

// let cmdList = getCmdListFromArgv();
let cmdList = getCmdListFromFile();

activate(cmdList);
