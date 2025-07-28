import { getRandStr,getMD5 } from './utils/utils';
import { headers } from './requestConfig'
import { now } from './consts';

const deviceInfo = "%7B%22vendorName%22:%22%22,%22deviceMode%22:%22iPhone%22,%22deviceName%22:%22%22,%22systemName%22:%22ios%22,%22systemVersion%22:%2213.2.3%22,%22cpuMode%22:%22%20%22,%22cpuCores%22:%22%22,%22cpuArch%22:%22%22,%22memerySize%22:%22%22,%22diskSize%22:%22%22,%22network%22:%22UNKNOWN%22,%22resolution%22:%22390*844%22,%22pixelResolution%22:%22%22%7D"
const localToken = getRandStr(32)


export async function injectRequestConfig(config: { method?: string; maxBodyLength?: number; url?: string; data: any; headers?: any; }, sourceURL: string, accessToken: string) {
    config.headers = headers;

    headers['cusat'] = accessToken;
    headers["cusut"] = "nil"
    headers["cusid"] = "0"
    headers["cusit"] = "nil"
    headers["cusname"] = "nil"
    headers["cdeviceno"] = localToken
    headers["cuuserref"] = localToken
    headers["cversion"] = "997"
    headers["cterminal"] = "wap"
    headers["csappid"] = "wap"
    headers["cdeviceinfo"] = deviceInfo
    headers["crtraceid"] = `${getRandStr(32)}${now * 1000}`
    headers["ctrackpath"] = ""
    headers["csourcepath"] = ""
    const jsonBody = JSON.stringify(config.data);
    const str = accessToken + '0wap' + localToken + jsonBody +
        sourceURL + '997' + 'wap' + headers['crtraceid'];
    headers['crpsign'] = await getMD5(str);

    return headers;
}
