#! /usr/bin/env node

import pkg from '../package.json' assert { type: 'json' };
import figlet from 'figlet'
import { Command  } from 'commander';
import Creator from './libs/creator';
const program = new Command();
const NAME = pkg.name
// console.log(
//     figlet.textSync('Hello', {
//         font: "Ghost",
//         horizontalLayout: "default",
//         verticalLayout: "default",
//         width: 80,
//         whitespaceBreak: true,
//     })
// );

program
  .command("create <project-name>") // 增加创建指令
  .description("create a new project") // 添加描述信息
  // .option('-f, --force', 'overwrite target directory if it is existed')
  .action(async (projectName, options, cmd) => {
    // 处理用户输入create 指令附加的参数
    console.log(projectName, options)
    const creator = new Creator(projectName, options, cmd)
    creator.init()
  });
// 使用XXX --version/XXX -V
program.name(`${NAME}`).usage('<command> [options]').version(`${pkg.version}`);
program.on('--help', () => {
    console.log();
    console.log(`当前版本：${pkg.version}`);
    console.log();
  });
// commander需要以此作为结束
program.parse();