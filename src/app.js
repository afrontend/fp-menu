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

const addCommands = cmdAry => {
  _.each(cmdAry, cmd => {
    addCommandEvent(cmd);
  })
}

const render = cmdAry => {
  _.each(cmdAry, cmd => {
    if (cmd.focused) {
      document.querySelector(`.${cmd.className}`).style.color = BGCOLOR;
      document.querySelector(`.${cmd.className}`).style.backgroundColor = COLOR;
    } else {
      document.querySelector(`.${cmd.className}`).style.color = COLOR;
      document.querySelector(`.${cmd.className}`).style.backgroundColor = BGCOLOR;
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

const getCmdList = () => {
  const remote = require('electron').remote;
  const ary = remote.getGlobal('sharedObject').argv;

  console.log(ary);
  ary.shift();
  ary.shift();
  const titleAry = _.filter(ary, (value, index) => (index % 2 === 0));
  const programAry = _.filter(ary, (value, index) => (index % 2 !== 0));
  const cmdAry = _.filter(_.zip(titleAry, programAry), pair => pair[0] && pair[1] && pair[0][0] !== '-');

  console.log('cmdAry: ' + cmdAry);

  return _.map(cmdAry, ([title, cmd], index) => {
    return {
      "className": `id${index}`,
      "name": title,
      "program": cmd.split(' ')[0],
      "args": _.tail(cmd.split(' '))
    }
  });
};

const cmdList = getCmdList();

activate(cmdList);
