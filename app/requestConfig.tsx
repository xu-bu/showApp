import { now } from './consts';

export const headers: Record<string, string> = {
  "Cookie": `Hm_lvt_da038bae565bb601b53cc9cb25cdca74=1689569273; Hm_lpvt_da038bae565bb601b53cc9cb25cdca74=${now}`,
  "Content-Type": "application/json",
  "st_flpv": "540fLHaRp55EDb6ihpbg",
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
  "Origin": "https://wap.showstart.com",
  "Referer": "https://wap.showstart.com",
};
export const getListData = (keyword: string) => ({
  activityIds: "",
  cityCode: "99999",
  couponCode: "",
  hosterId: "",
  keyword,
  pageNo: 1,
  performerId: "",
  sign: "",
  siteId: "",
  st_flpv: "540fLHaRp55EDb6ihpbg",
  style: "",
  tag: "",
  themeId: "",
  tourId: "",
  trackPath: "",
});
export function getListConfig(keyword: string) {
  return {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://wap.showstart.com/v3/wap/activity/list",
    data: getListData(keyword),
  };
}
export const getTokenConfig = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://wap.showstart.com/v3/waf/gettoken",
  data: { "sign": "", "st_flpv": "540fLHaRp55EDb6ihpbg" },
};

