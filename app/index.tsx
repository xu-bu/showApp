import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Button, ActivityIndicator, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import ImageModal from "react-native-image-modal";
import { getTokenConfig, getListConfig } from './requestConfig';
import { injectRequestConfig } from './injectRequestConfig';
import { Picker } from '@react-native-picker/picker';
// import { getItems } from './services/supabase';
import { useRouter, Link } from 'expo-router';

interface ActivityData {
  title: string;
  city: string;
  avatar: string;
  showTime: string;
  siteName: string;
  artist: string;
}

export default function App() {
  const router = useRouter();
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
      // const keywordDocs = await getItems()
      // const keyWords = keywordDocs[0].keyWords

      // localStorage.setItem('keyWords', JSON.stringify(keyWords));
      // for (const keyword of keyWords) {
      //   const listConfig = getListConfig(keyword);

      //   await injectRequestConfig(listConfig, '/wap/activity/list', accessToken);
      //   res = await axios.request(listConfig);
      //   parsedData.push(...parseRes(res.data, keyword));
      // }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
    setData(parsedData);
  };
  async function manageKeywords() {
    router.push('/manageKeywords');
  }
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
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button title="Fetch Data" onPress={fetchData} disabled={loading} />
        <Button title="Manage Keywords" onPress={manageKeywords} />
      </View>

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
            onValueChange={(itemValue: any) => setSelectedCity(itemValue)}
            style={{ flex: 1 }}
          >
            <Picker.Item label="All Cities" value="" />
            {cities.map((city, idx) => (
              <Picker.Item key={idx} label={city} value={city} />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedArtist}
            onValueChange={(itemValue: any) => setSelectedArtist(itemValue)}
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
                <ImageModal
                  // resizeMode="contain"
                  // imageBackgroundColor="#000"
                  // style={styles.thumbnail}
                  source={{ uri: currentImage.uri }}
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
