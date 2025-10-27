import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Text, IconButton, Chip, Portal, Snackbar, Provider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { getKeyWords, updateItem } from './services/supabase';
import storage from './storage';
import { ManageKeywordsStyles } from './styles/styles';
import { useRouter } from 'expo-router';

export default function ManageKeywords() {
  const [keyWords, setKeyWords] = useState<string[]>(storage.getItem('keyWords')!);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      if (!keyWords) {
        const data = await getKeyWords();
        setKeyWords(data);
        storage.setItem('keyWords', data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return <ListManager keyWords={keyWords} />;
}

function ListManager({ keyWords }: { keyWords: string[] }) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(keyWords);
  const [input, setInput] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = async () => {
    const newKeyWord = input.trim();
    if (newKeyWord && !isProcessing) {
      setIsProcessing(true);
      try {
        const updatedItems = [...items, newKeyWord];

        // Update Supabase
        await updateItem(1, {
          keyWords: updatedItems
        });

        // Update local storage
        storage.setItem('keyWords', updatedItems);

        // Update state (this will trigger re-render)
        setItems(updatedItems);
        setInput('');
        setSnackbarMessage('Item added! ✨');
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error adding item:', error);
        setSnackbarMessage('Failed to add item');
        setSnackbarVisible(true);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const removeItem = async (index: number) => {
    if (isProcessing) return;

    const itemName = items[index];
    setIsProcessing(true);

    try {
      const updatedItems = items.filter((_, i) => i !== index);

      // Update Supabase
      await updateItem(1, {
        keyWords: updatedItems
      });

      // Update local storage
      storage.setItem('keyWords', updatedItems);

      // Update state (this will trigger re-render)
      setItems(updatedItems);
      setSnackbarMessage(`"${itemName}" removed`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error removing item:', error);
      setSnackbarMessage('Failed to remove item');
      setSnackbarVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Provider>
      <View style={ManageKeywordsStyles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={ManageKeywordsStyles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={ManageKeywordsStyles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={ManageKeywordsStyles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <Button onPress={() => router.back()}
                mode="contained"
                style={ManageKeywordsStyles.addButton}
                buttonColor='#ffffff'
                textColor='#000000'
                >back</Button>

              {/* Main Card */}
              <Card style={ManageKeywordsStyles.card} elevation={5}>
                <Card.Content>
                  {/* Input Section */}
                  <View style={ManageKeywordsStyles.inputContainer}>
                    <TextInput
                      mode="outlined"
                      label="Add new item"
                      value={input}
                      onChangeText={setInput}
                      onSubmitEditing={addItem}
                      returnKeyType="done"
                      style={ManageKeywordsStyles.input}
                      outlineColor="#667eea"
                      activeOutlineColor="#764ba2"
                      disabled={isProcessing}
                      right={
                        <TextInput.Icon
                          icon="plus-circle"
                          onPress={addItem}
                          disabled={!input.trim() || isProcessing}
                        />
                      }
                    />
                  </View>

                  <Button
                    mode="contained"
                    onPress={addItem}
                    disabled={!input.trim() || isProcessing}
                    loading={isProcessing}
                    style={ManageKeywordsStyles.addButton}
                    buttonColor="#667eea"
                    icon="plus"
                    contentStyle={ManageKeywordsStyles.addButtonContent}
                  >
                    Add Item
                  </Button>

                  {/* Items Count */}
                  <View style={ManageKeywordsStyles.countContainer}>
                    <Chip icon="format-list-bulleted" style={ManageKeywordsStyles.chip}>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </Chip>
                  </View>

                  {/* List */}
                  <View style={ManageKeywordsStyles.listContainer}>
                    {items.length === 0 ? (
                      <Card style={ManageKeywordsStyles.emptyCard} mode="outlined">
                        <Card.Content style={ManageKeywordsStyles.emptyContent}>
                          <Text variant="bodyLarge" style={ManageKeywordsStyles.emptyText}>
                            No items yet. Add your first item to get started! 🚀
                          </Text>
                        </Card.Content>
                      </Card>
                    ) : (
                      items.map((item, index) => (
                        <Card
                          key={`${item}-${index}`}
                          style={ManageKeywordsStyles.itemCard}
                          mode="elevated"
                          elevation={2}
                        >
                          <Card.Content style={ManageKeywordsStyles.itemContent}>
                            <Text variant="bodyLarge" style={ManageKeywordsStyles.itemText}>{item}</Text>
                            <IconButton
                              icon="delete"
                              iconColor="#e74c3c"
                              size={24}
                              onPress={() => removeItem(index)}
                              disabled={isProcessing}
                              style={ManageKeywordsStyles.deleteButton}
                            />
                          </Card.Content>
                        </Card>
                      ))
                    )}
                  </View>
                </Card.Content>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Snackbar for notifications */}
          <Portal>
            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              duration={2000}
              action={{
                label: 'OK',
                onPress: () => setSnackbarVisible(false),
              }}
            >
              {snackbarMessage}
            </Snackbar>
          </Portal>
        </LinearGradient>
      </View>
    </Provider>
  );
}