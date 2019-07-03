// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import createWindow from "./helpers/window";
import _ from "lodash";
import pkg from  "../package.json";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

const launchFrontend = () => {
  setApplicationMenu();

  const mainWindow = createWindow("main", {
    width: 400 + 20,
    height: 600 + 20,
    frame: false
  });

  mainWindow.setMaximumSize(400 + 20, 600 + 20);
  mainWindow.setMinimumSize(400 + 20, 600 + 20);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development" && process.env.mode === "test") {
    mainWindow.openDevTools();
  }
}

app.on("ready", () => {
  global.sharedObject = { argv: process.argv }

  if (_.last(process.argv).includes("--show-config-file")) {
    console.log(`
{
  "color": "red",
  "bgColor": "#F2F1F0",
  "cmdList": [
    {
      "title": "xeyes",
      "program": "xeyes"
    },
    {
      "title": "xterm",
      "program": "xterm"
    },
    {
      "title": "terminator",
      "program": "terminator"
    }
  ]
}
`);
    app.quit();
  } else {
    launchFrontend();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
