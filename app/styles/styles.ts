import {StyleSheet} from 'react-native';

export const ManageKeywordsStyles = StyleSheet.create({
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