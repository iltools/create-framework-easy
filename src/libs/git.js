import downloadGitRepo from 'download-git-repo';
import path from 'path';
import {get} from 'lodash-es'
import ora, {oraPromise} from 'ora';
import chalk from 'chalk';
import fetch from './fetch.js'
export const gitClone = (remote, dir, option, defaultBranch) => {
  return new Promise((resolve, reject) => {
    downloadGitRepo(`direct:${remote}#${defaultBranch}`, path.join(process.cwd(), dir), option, err => {
      if (err) {
        console.log("err", chalk.red(err));
        reject(err);
        return;
      };  
      resolve();
    })
  })
}

export const downloadProcess = (params = {}) => {
  const {framework, remote, dir, option, defaultBranch = 'main', successText = '下载成功。', failText = '失败了，请重试。', text = '正在下载, 请耐心等待。'} = params
  return oraPromise(gitClone(remote, dir, option, defaultBranch), {
    successText,
    failText,
    prefixText: ``,
    text,
  })
}

export const getAllBranches = (params) => {
  const {owner, framework, githubApi} = params || {}
  return new Promise((resolve, reject) => {
    const spinner = ora(`Loading`).start();
    let url = `${githubApi}/repos/${owner}/${framework}/branches`
    fetch.get(url).then(res => {
      let data = get(res, 'data', []).map(item => item.name)
      let hasMain = data.findIndex(item => item === 'main')
      let hasMaster = data.findIndex(item => item === 'master')
      if(hasMain > -1) {
        data.splice(hasMain, 1)
        data.unshift('main')
      } else if (hasMaster > -1) {
        data.splice(hasMain, 1)
        data.unshift('main')
      }
      resolve(data)
      spinner.succeed()
    }).catch(e => {
      spinner.fail(e)
    });
  })
}