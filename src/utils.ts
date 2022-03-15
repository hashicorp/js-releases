import axiosBase, { AxiosRequestConfig } from 'axios';
const ProxyAgent = require('proxy-agent');

const httpProxy = process.env['HTTP_PROXY'] || process.env['http_proxy'];
const httpsProxy = process.env['HTTPS_PROXY'] || process.env['https_proxy'];

let proxyConf = {};

if (httpProxy || httpsProxy) {
  proxyConf = {
    proxy: false,
    httpAgent: httpProxy ? new ProxyAgent(httpProxy) : undefined,
    httpsAgent: httpsProxy ? new ProxyAgent(httpsProxy) : undefined,
  };
}

const axios = axiosBase.create({ ...proxyConf });

export async function request<T = any>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  const result = await axios.get(url, { ...options });
  return result.data;
}
