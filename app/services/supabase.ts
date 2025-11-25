import { createClient } from '@supabase/supabase-js';
import { KeyWordsDoc } from '../types/db';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Read
export const getItems = async () => {
  const { data, error } = await supabase.from('showApp').select('*');
  if (error) throw error;
  return data as KeyWordsDoc[];
};

export async function getKeyWords(){
    const keywordDocs = await getItems();
    return keywordDocs[0].keyWords;
}

// Update
export const updateItem = async (id: string | number, updates: Record<string, any>) => {
  const { data, error } = await supabase.from('showApp').update(updates).eq('id', id);
  if (error) throw error;
  return data as KeyWordsDoc[] | null;
};
