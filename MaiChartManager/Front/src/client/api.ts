import { Api } from "@/client/apiGen";
import { Api as AquaMaiVersionConfigApi } from "@/client/aquaMaiVersionConfigApiGen";

declare global {
  const backendUrl: string | undefined;
}
// 在 WebView2 环境中，域名是 mcm.invalid，backendUrl 会通过 PostWebMessageAsString 注入
// 在远程浏览器（export 模式）中，直接用相对路径（当前 origin）
export const isWebView = location.hostname === 'mcm.invalid';
const getBaseUrl = () => (globalThis as any).backendUrl ?? (isWebView ? undefined : '');

export const apiClient = new Api({
  // @ts-ignore
  baseUrl: getBaseUrl(),
  baseApiParams: {
    headers: {
      accept: 'application/json',
    },
  },
})

export default apiClient.maiChartManagerServlet

export const aquaMaiVersionConfig = new AquaMaiVersionConfigApi({
  baseUrl: 'https://aquamai-version-config.mumur.net',
  baseApiParams: {
    headers: {
      accept: 'application/json',
    },
  },
}).api

export const getUrl = (suffix: string) => {
  // @ts-ignore
  return `${globalThis.backendUrl ?? ''}/MaiChartManagerServlet/${suffix}`;
}
