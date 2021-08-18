import axiosBase, { AxiosRequestConfig } from "axios";
const ProxyAgent = require("proxy-agent");

const httpProxy = process.env["HTTP_PROXY"] || process.env["http_proxy"];
const httpsProxy = process.env["HTTPS_PROXY"] || process.env["https_proxy"];

let proxyConf = {};

if (httpProxy || httpsProxy) {
  console.log(`Found proxy setting. Using to download files.`);
  console.log(`HTTP: ${httpProxy}`);
  console.log(`HTTPS: ${httpProxy}`);
  proxyConf = {
    proxy: false,
    httpAgent: httpProxy ? new ProxyAgent(httpProxy) : undefined,
    httpsAgent: httpsProxy ? new ProxyAgent(httpsProxy) : undefined,
  };
}

const axios = axiosBase.create({ ...proxyConf });

export async function request(
  url: string,
  options: AxiosRequestConfig = {}
): Promise<any> {
  console.log(`Request to: ${url} with options: ${JSON.stringify(options)}`);
  try {
    const result = await axios.get(url, { ...options });
    return result.data;
  } catch (e: any) {
    console.error(e.toJSON());
    throw new Error(`Request for terraform binary failed: ${e && e.message}`);
  }
}
