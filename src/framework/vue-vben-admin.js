
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts'
import {get, omit} from 'lodash-es'
import { rimrafSync } from 'rimraf'
export const steps = {
  main: {
    choices: [{
      message: '请选择模式',
      type: 'select',
      name: 'selectModel',
      choices: [{title: '完整版', value: 'all'}, {title: '精简版', value: 'thin'}]
    }],
    ifChoices: {
      thin: [
        {message: '请选择UI组件库', type: 'multiselect', name: 'uiframework', dir: 'apps', choices: [{title: 'Ant Design Vue', value: 'web-antd'}, {title: 'Element Plus', value: 'web-ele'}, {title: 'Naive UI', value: 'web-naive'}]},
        {message: '删除演示代码?', type: 'select', name: 'play', dir: 'playground', choices: [{title: '是', value: 1}, {title: '否', value: 0}]},
        {message: '删除文档?', type: 'select', name: 'docs', dir: 'docs', choices: [{title: '是', value: 1}, {title: '否', value: 0}]},
        {message: '删除Mock?', type: 'select', name: 'mock', dir: 'apps/backend-mock',  choices: [{title: '是', value: 1}, {title: '否', value: 0}]},
      ]
    },
    afterDownload: async (params) => {
      const {defaultBranch, fileRes, projectDir, readFile, writeFile} = params || {}
      if (defaultBranch === 'main') {
        let main = fileRes['steps'][defaultBranch]
        if (main) {
          let res = await prompts(main.choices)
          let model = main['ifChoices'][res['selectModel']]
          let selectObj = {}
          if (model) {
            for (let index = 0; index < model.length; index ++) {
              const item = model[index];
              const res = await prompts(item)
              selectObj = {
                ...selectObj,
                ...res
              }
            }
            let dirs = []
            let delScriptKeys = []
            for (const [key, value] of Object.entries(selectObj)) {
              let options = model.find(item => item.name === key)
              if (key === 'uiframework') {
                if (Array.isArray(value) && value.length > 0) {
                  for(let i = 0; i < value.length; i++) {
                    let paths = path.join(projectDir, options.dir, value[i])
                    dirs.push(paths)
                    // remove web-
                    delScriptKeys.push(value[i].replace(/^(web-)/, ''))
                  }
                }
              } else {
                if (value === 1) {
                  let paths = path.join(projectDir, options.dir)
                  dirs.push(paths)
                  delScriptKeys.push(key)
                }
              }
            }
            for (const item of dirs) {
              // 删除文件夹
              rimrafSync(item)
            }
            let pkgFile = path.join(projectDir, 'package.json')
            let pkg = readFile(pkgFile)
            let scriptObj = get(pkg, 'scripts')
            let delScriptKeysFormat = []
            delScriptKeys.forEach(item => {
              let array = [`dev:${item}`, `build:${item}`]
              delScriptKeysFormat.push(...array)
            })
            scriptObj = omit(scriptObj, delScriptKeysFormat)
            pkg['scripts'] = scriptObj
            writeFile(pkgFile, pkg)
          } else {
            chalk.green(console.log('已完成，请自行进入目录操作。'))
          }
        }
      }
    }
  }
}