export interface  KeyWordsDoc {
  id: number;
  created_at: string;
  keyWords: string[];
};

export interface Database {
  public: {
    Tables: {
      showApp: {
        Row: KeyWordsDoc;
        Update: Partial<KeyWordsDoc>;
      };
    };
  };
}