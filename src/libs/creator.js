import path, {dirname} from 'path';
import chalk from 'chalk';
import prompts from 'prompts'
import LANGS, {DEFAULT_LANG} from './locales/index.js';
import repositories from './repositories.js'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { initCA, initCert, writeCert } from "../mkcert/index.js";
import { getAllBranches, downloadProcess } from './git.js';
const LANGUATE = LANGS[DEFAULT_LANG]
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// f ix: package.json使用type=module时，__dirname和__filename is undefined
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const creatorPrompt = {
  step0 (params) {
    const { projectName = '' } = params
    return [
      {
        type: 'text',
        name: 'projectName',
        message: LANGUATE.projectName,
        initial: projectName,
        validate(val) {
          if (fs.existsSync(val)) return LANGUATE.foldExist
          return true;
        }
      },
      {
        type: 'select',
        name: 'framework',
        message: LANGUATE.framework,
        choices: repositories.map(item => {
          return {
            title: item.framework,
            value: item.framework,
          }
        })
      }
    ]
  },
  step1 (params) {
    const { branches = [] } = params
    return [
      {
        type: 'select',
        name: 'selectBranch',
        message: LANGUATE.selectBranch,
        choices: branches.map(item => {
          return {
            title: item,
            value: item,
          }
        })
      }
    ]
  }
}
let currentFramework = {}
class Creator {
  constructor(projectName, options, cmd) {
    this.projectName = projectName;
    // 目标文件路径
    const cwd = process.cwd();
    const targetDir = path.join(cwd, projectName);
    this.dir = targetDir;
  }
  async promptsOnSubmit (prompt, answer) {
    if(prompt.name === 'framework') {
    }
  }
  promptsOnCancel () {
    throw new Error(chalk.red('✖') + ' Operation cancelled')
  }
  findRepoObj = (framework) => {
    let repRo = repositories.find(item => item['framework'] === framework)
    if (repRo) {
      currentFramework = repRo
    }
    return repRo
  }
  showInfo = () => {
    console.log('\n')
    console.log(chalk.white(currentFramework['intro']))
    console.log('\n')
    console.log(chalk.bgMagenta('↓↓↓按住ctrl+鼠标单击，可以查看示例↓↓↓'));
    console.table(currentFramework['information'])
  }
  init = async () => {
    let ca = await initCA()
    let cert = await initCert(ca)
    // 写入文件
    // writeCert(cert.key, cert.cert)
    let res
    try {
      res = await prompts(creatorPrompt.step0({projectName: this.projectName}), {onSubmit: this.promptsOnSubmit, onCancel: this.promptsOnCancel})
    } catch (e) {
      console.log(e.message)
      return 
    }
    this.findRepoObj(res['framework'])
    this.showInfo()
    // 查分支
    let allBranches = await getAllBranches({...currentFramework})
    let res1
    try {
      res1 = await prompts(creatorPrompt.step1({branches: allBranches}), {onCancel: this.promptsOnCancel})
      console.log(res1)
    } catch (e) {
      console.log(e.message)
      return 
    }
    await downloadProcess({
      framework: currentFramework['framework'],
      remote: currentFramework['github'],
      dir: res['projectName'],
      option: {clone: true},
      defaultBranch: res1['selectBranch']
    })
    this.afterDownload({...currentFramework, ...{defaultBranch: res1['selectBranch']}})
  }
  afterDownload = async (params = {}) => {
    const {framework, defaultBranch}  = params || {}
    const projectDir = path.resolve(process.cwd(), this.projectName)
    const libsDir = path.resolve(__dirname, '../')
    const frameworkDir = path.join(libsDir, 'framework')
    let fileRes
    function getFile () {
      return new Promise((resolve, reject) => {
        import(`${frameworkDir}/${framework}.js`).then((res) => {
          fileRes = res
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    }
    try {
      fileRes = await getFile()
    } catch (e) {
      console.log(e)
    }
    switch(framework) {
      case 'vue-vben-admin':
        // 每个框架需要做的业务, https://doc.vben.pro/guide/introduction/thin.html
        let main = fileRes['steps'][defaultBranch]
        main && main.afterDownload({
          fileRes,
          defaultBranch,
          projectDir,
          readFile: this.readFile,
          writeFile: this.writeFile
        })
        break;
      case 'XXXX':
        break;
      default:
        chalk.green(console.log('已完成，请自行进入目录操作。'))
    }
  }
  readFile = (path) => {
    return fs.readJSONSync(path)
  }
  writeFile = (path, data) => {
    fs.writeJSONSync(path, data, {spaces: '\t'})
  }
}
export default Creator