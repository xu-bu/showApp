import axios from 'axios';
import React, { useState } from 'react';
import { View, Button, ActivityIndicator, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { getTokenConfig, getListConfig } from './requestConfig';
import { injectRequestConfig } from './injectRequestConfig';
import { keywords } from './consts';

interface ActivityData {
  title: string;
  city: string;
  avatar: string;
  showTime: string;
  siteName: string;
  artist: string;
}

export default function App() {
  const [data, setData] = useState<ActivityData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    const parsedData: ActivityData[] = [];
    try {
      await injectRequestConfig(getTokenConfig, '/waf/gettoken', '');
      let res = await axios.request(getTokenConfig);
      const accessToken = res.data.result.accessToken.access_token;
      for (const keyword of keywords) {
        const listConfig = getListConfig(keyword);

        await injectRequestConfig(listConfig, '/wap/activity/list', accessToken);
        res = await axios.request(listConfig);
        parsedData.push(...parseRes(res.data, keyword));
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
    setData(parsedData);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button
        title="Fetch Data"
        onPress={fetchData}
        disabled={loading}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ marginTop: 20 }}
        />
      )}

      {error && (
        <Text style={{ marginTop: 20, fontSize: 14, color: 'red' }}>
          {error}
        </Text>
      )}

      {data && (
        <ScrollView style={{ flex: 1, marginTop: 20 }}>
          {data.map((item, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.city}</Text>
              <Text>{item.showTime}</Text>
              <Text>{item.siteName}</Text>
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function parseRes(res: any, keyword: string): ActivityData[] {
  const activityInfo = res?.result?.activityInfo || [];
  const parseResult: ActivityData[] = [];
  activityInfo.forEach((activity: any) => {
    parseResult.push({
      artist: keyword,
      title: activity.title,
      city: activity.city,
      avatar: activity.avatar,
      showTime: activity.showTime,
      siteName: activity.siteName,
    });
  });

  return parseResult;
}
