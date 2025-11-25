import axios from 'axios';
import { EXPO_PUBLIC_API_GATEWAY_URL } from '../consts';

export async function request( data: { method: string;}) {
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${EXPO_PUBLIC_API_GATEWAY_URL}/api/requestHelper`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  };

  const res = await axios.request(config);

  return res.data;
}
