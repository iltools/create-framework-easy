import { createCA, createCert } from "mkcert";
import fs from 'fs-extra'
export const initCA = () => {
  return new Promise((resolve, reject) => {
    createCA({
      organization: "Hello CA",
      countryCode: "NP",
      state: "Bagmati",
      locality: "Kathmandu",
      validity: 365
    }).then(res => {
      resolve(res)
    })
  }) 
}
export const initCert = (ca) => {
  return new Promise((resolve, reject) => {
    createCert({
      ca: { key: ca.key, cert: ca.cert },
      domains: ["127.0.0.1", "localhost", "github.com"],
      validity: 365
    }).then(res => {
      resolve(res)
    })
  }) 
}

export const writeCert = (keyContent, certContent) => {
  fs.writeFile(`${__dirname}/key.pem`, keyContent)
  fs.writeFile(`${__dirname}/cert.pem`, certContent)
}