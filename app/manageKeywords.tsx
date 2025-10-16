import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, Text, IconButton, Chip, Portal, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function ListManager() {
  // Initialize with some sample data
  const [items, setItems] = useState<string[]>(['Sample item 1', 'Sample item 2']);
  const [input, setInput] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const addItem = () => {
    const newKeyWord = input.trim();

    if (newKeyWord) {
      setItems([...items, newKeyWord]);
      setInput('');
      setSnackbarMessage('Item added! ✨');
      setSnackbarVisible(true);
    }
  };

  const removeItem = (index: number) => {
    const itemName = items[index];
    setItems(items.filter((_, i) => i !== index));
    setSnackbarMessage(`"${itemName}" removed`);
    setSnackbarVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text variant="displaySmall" style={styles.title}>✨ My List</Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Manage your items with style
              </Text>
            </View>

            {/* Main Card */}
            <Card style={styles.card} elevation={5}>
              <Card.Content>
                {/* Input Section */}
                <View style={styles.inputContainer}>
                  <TextInput
                    mode="outlined"
                    label="Add new item"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={addItem}
                    returnKeyType="done"
                    style={styles.input}
                    outlineColor="#667eea"
                    activeOutlineColor="#764ba2"
                    right={
                      <TextInput.Icon
                        icon="plus-circle"
                        onPress={addItem}
                        disabled={!input.trim()}
                      />
                    }
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={addItem}
                  disabled={!input.trim()}
                  style={styles.addButton}
                  buttonColor="#667eea"
                  icon="plus"
                  contentStyle={styles.addButtonContent}
                >
                  Add Item
                </Button>

                {/* Items Count */}
                <View style={styles.countContainer}>
                  <Chip icon="format-list-bulleted" style={styles.chip}>
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Chip>
                </View>

                {/* List */}
                <View style={styles.listContainer}>
                  {items.length === 0 ? (
                    <Card style={styles.emptyCard} mode="outlined">
                      <Card.Content style={styles.emptyContent}>
                        <Text variant="bodyLarge" style={styles.emptyText}>
                          No items yet. Add your first item to get started! 🚀
                        </Text>
                      </Card.Content>
                    </Card>
                  ) : (
                    items.map((item, index) => (
                      <Card
                        key={index}
                        style={styles.itemCard}
                        mode="elevated"
                        elevation={2}
                      >
                        <Card.Content style={styles.itemContent}>
                          <Text variant="bodyLarge" style={styles.itemText}>{item}</Text>
                          <IconButton
                            icon="delete"
                            iconColor="#e74c3c"
                            size={24}
                            onPress={() => removeItem(index)}
                            style={styles.deleteButton}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  addButton: {
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonContent: {
    height: 48,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    gap: 12,
  },
  emptyCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#cccccc',
    backgroundColor: '#fafafa',
  },
  emptyContent: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
  },
  itemCard: {
    borderRadius: 12,
    backgroundColor: '#f8f9ff',
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemText: {
    flex: 1,
    color: '#333333',
    fontWeight: '500',
  },
  deleteButton: {
    margin: 0,
  },
});