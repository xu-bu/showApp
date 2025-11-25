import { createTypedStorage } from '@import_me/typed-local-storage';

interface StorageSchema {
  keyWords: string[];
}

const storage = createTypedStorage<StorageSchema>();
export default storage;
