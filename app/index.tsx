import axios from 'axios';
import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Text, ScrollView, StyleSheet } from 'react-native';
import { getTokenConfig, getListConfig } from './requestConfig';
import { injectRequestConfig } from './injectRequestConfig';

export default function App() {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false); // 用于控制按钮显示隐藏

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const keywords = ['shokran'];
      for (const keyword of keywords) {
        await injectRequestConfig(getTokenConfig, '/waf/gettoken', '');
        let res = await axios.request(getTokenConfig);
        const accessToken = res.data.result.accessToken.access_token;

        const listConfig = getListConfig(keyword);
        await injectRequestConfig(listConfig, '/wap/activity/list', accessToken);
        res = await axios.request(listConfig);
        setData(JSON.stringify(res.data, null, 2));
        setFetched(true); // 点击后隐藏按钮
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!fetched && <Button title="Fetch Data" onPress={fetchData} />}

      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {data && (
        <ScrollView style={{ marginTop: 20, maxHeight: 300 }}>
          <Text style={styles.text}>{data}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    color: '#333',
  },
  error: {
    marginTop: 20,
    fontSize: 14,
    color: 'red',
  },
});
