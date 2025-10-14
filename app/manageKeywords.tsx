import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function ListManager() {
  let keyWords = JSON.parse(localStorage.getItem('keyWords')!);
  const [items, setItems] = useState<string[]>(keyWords);
  const [input, setInput] = useState<string>('');
  const [isPageReady, setIsPageReady] = useState<boolean>(false);

  // Page enter animation
  useEffect(() => {
    setIsPageReady(true);
  }, []);

  // Page leave animation setup
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsPageReady(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const addItem = () => {
    const newKeyWord = input.trim()

    if (newKeyWord) {
      keyWords.push(newKeyWord)
      localStorage.setItem('keyWords', JSON.stringify(keyWords));
      setItems([...items, newKeyWord]);
      setInput('');
    }
  };

  const removeItem = (newKeyWord: string) => {
    keyWords=keyWords.filter(item => item !== newKeyWord)
    setItems(items.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 transition-opacity duration-700 ${isPageReady ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 transform transition-all duration-1000 delay-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My List</h1>
          <p className="text-gray-600">Add and remove items seamlessly</p>
        </div>

        {/* Card Container */}
        <div
          className={`bg-white rounded-lg shadow-2xl p-8 transform transition-all duration-1000 delay-200 ${isPageReady ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
        >
          {/* Input Section */}
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new item..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={addItem}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg active:scale-95"
            >
              <Plus size={20} />
              Add
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No items yet. Add one to get started!</p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform ${isPageReady
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                    }`}
                  style={{
                    transitionDelay: isPageReady ? `${200 + idx * 50}ms` : '0ms'
                  }}
                >
                  <span className="text-gray-800 font-medium">{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>{items.length} item{items.length !== 1 ? 's' : ''} in your list</p>
          </div>
        </div>
      </div>
    </div>
  );
}