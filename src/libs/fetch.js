import axios from 'axios';
import https from 'https';
import fs from 'fs-extra'
import path from 'path'
let key = fs.readFileSync(path.resolve(__dirname, `../mkcert/key.pem`))
let cert = fs.readFileSync(path.resolve(__dirname, `../mkcert/cert.pem`))
// fix: UNABLE_TO_VERIFY_LEAF_SIGNATURE: https://bobbyhadz.com/blog/unable-to-verify-the-first-certificate-node
// 方法一：直接跳过SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // skip
});
const fetch = axios.create({
  httpsAgent: httpsAgent
})
export default fetch