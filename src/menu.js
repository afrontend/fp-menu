const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const DEFAULT_RC_FILE = ".xmenu.json";

const run = (program, args = []) => {
  if (!program) return;
  const child = spawn(program, args);
  child.stdout.on("data", data => {
    console.log(`${program} stdout: ${data}`);
  });
  child.stderr.on("data", data => {
    console.log(`${program} stderr: ${data}`);
  });
  child.on("close", code => {
    console.log(`${program} child process exited with code ${code}`);
  });
};

const makeCmd = (cmd, index) => {
  return {
    id: `id${index}`,
    name: cmd.title.trim(),
    program: cmd.program.split(" ")[0],
    args: _.tail(cmd.program.split(" "))
  };
};

const even = index => index % 2 === 0;
const odd = index => index % 2 !== 0;

const getCmdListFromAry = aAry => {
  const ary = _.filter(aAry, arg => {
    return arg[0] !== "/";
  });
  const titleAry = _.filter(ary, (value, index) => even(index));
  const programAry = _.filter(ary, (value, index) => odd(index));
  const cmdAry = _.filter(
    _.zip(titleAry, programAry),
    pair => pair[0] && pair[1] && pair[0][0] !== "-"
  );

  const cmdList = _.map(cmdAry, cmd => {
    return {
      title: cmd[0],
      program: cmd[1]
    };
  });

  return _.map(cmdList, makeCmd);
};

const getCmdListFromDefaultFile = () => {
  return getCmdListFromFile(path.resolve(process.env.HOME, DEFAULT_RC_FILE));
};

const getCmdListFromFile = (rcFilePath) => {
  let cmdList = [];
  if (fs.existsSync(rcFilePath)) {
    let obj = {};
    try {
      obj = JSON.parse(fs.readFileSync(rcFilePath, 'utf8'));
    } catch (e) {
      notify(`parse error (~/${DEFAULT_RC_FILE})`);
      obj.cmdList = [];
    }
    cmdList = obj.cmdList;
  }
  return _.map(cmdList, makeCmd);
}

const getCmdList = () => {
  let cmdList = [];
  cmdList = getCmdListFromAry(process.argv);
  if (cmdList.length === 0) {
    cmdList = getCmdListFromDefaultFile();
  }
  return cmdList;
};

module.exports = {
  run,
  getCmdList,
  getCmdListFromFile,
  getCmdListFromDefaultFile
};
