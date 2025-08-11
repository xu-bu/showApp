import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { View, Button, ActivityIndicator, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { getTokenConfig, getListConfig } from './requestConfig';
import { injectRequestConfig } from './injectRequestConfig';
import { keywords } from './consts';
import { Picker } from '@react-native-picker/picker';

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
  const [currentImage, setCurrentImage] = useState<{ uri: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
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
  // for cities filter
  const cities = useMemo(() => {
    if (!data) return [];
    const allCities = data.map(item => item.city);
    return Array.from(new Set(allCities));
  }, [data]);
  // for artist filter
  const artists = useMemo(() => {
    if (!data) return [];
    const allArtists = data.map(item => item.artist);
    return Array.from(new Set(allArtists));
  }, [data]);
  // filter based on city and artist
  const filteredEventInfo = useMemo(() => {
    if (!data) return [];
    let filteredEvents = data;

    if (selectedCity) filteredEvents = filteredEvents.filter(item => item.city === selectedCity);
    if (selectedArtist) filteredEvents = filteredEvents.filter(item => item.artist === selectedArtist);

    return filteredEvents;
  }, [data, selectedCity, selectedArtist]);

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

      {data && data.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue) => setSelectedCity(itemValue)}
            style={{ flex: 1 }}
          >
            <Picker.Item label="All Cities" value="" />
            {cities.map((city, idx) => (
              <Picker.Item key={idx} label={city} value={city} />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedArtist}
            onValueChange={(itemValue) => setSelectedArtist(itemValue)}
            style={{ flex: 1 }}
          >
            <Picker.Item label="All Artists" value="" />
            {artists.map((artist, idx) => (
              <Picker.Item key={idx} label={artist} value={artist} />
            ))}
          </Picker>
        </View>
      )}

      {filteredEventInfo && (
        <ScrollView style={{ flex: 1, marginTop: 20 }}>
          {filteredEventInfo.map((item, index) => (
            <View key={index} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.artist}</Text>
              <Text>{item.city}</Text>
              <Text>{item.showTime}</Text>
              <Text>{item.siteName}</Text>
              <TouchableOpacity onPress={() => setCurrentImage({ uri: item.avatar })}>
                <Image
                  source={{ uri: item.avatar }}
                  style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }}
                />
              </TouchableOpacity>
              {currentImage && (
                <ImageViewing
                  images={[currentImage]}
                  imageIndex={0}
                  visible={true}
                  onRequestClose={() => setCurrentImage(null)}
                />
              )}
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
