import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  popularTags?: string[];
  placeholder?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  popularTags = [],
  placeholder = '添加标签...',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      onChange([...selectedTags, newTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg">
        <AnimatePresence>
          {selectedTags.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 bg-primary-100 text-primary-700 text-sm font-medium px-2 py-1 rounded"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length > 0 ? '' : placeholder}
          className="flex-grow bg-transparent focus:outline-none text-sm p-1"
        />
      </div>
      {popularTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {popularTags
            .filter((tag) => !selectedTags.includes(tag))
            .map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="flex items-center text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
