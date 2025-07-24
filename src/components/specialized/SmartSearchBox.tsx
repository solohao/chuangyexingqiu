import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import { mockProjects } from '../../data/mockProjects';

interface SearchSuggestion {
  type: 'project' | 'skill' | 'tag' | 'location' | 'founder';
  value: string;
  label: string;
  count?: number;
}

interface SmartSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SmartSearchBox: React.FC<SmartSearchBoxProps> = ({
  value,
  onChange,
  placeholder = "搜索项目、技能、标签...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hotSearches] = useState<string[]>([
    'AI算法', 'React开发', '智能家居', '在线教育', '区块链', 
    '移动应用', '数据分析', 'UI设计', '创业团队', '种子轮'
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 从localStorage加载搜索历史
  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // 生成搜索建议
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const query = value.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // 项目名称建议
    mockProjects.forEach(project => {
      if (project.title.toLowerCase().includes(query)) {
        newSuggestions.push({
          type: 'project',
          value: project.title,
          label: project.title
        });
      }
    });

    // 技能建议
    const allSkills = new Set<string>();
    mockProjects.forEach(project => {
      project.skills.forEach(skill => allSkills.add(skill));
      project.seekingRoles.forEach(role => allSkills.add(role));
    });

    Array.from(allSkills).forEach(skill => {
      if (skill.toLowerCase().includes(query)) {
        const count = mockProjects.filter(p => 
          p.skills.includes(skill) || p.seekingRoles.includes(skill)
        ).length;
        newSuggestions.push({
          type: 'skill',
          value: skill,
          label: skill,
          count
        });
      }
    });

    // 标签建议
    const allTags = new Set<string>();
    mockProjects.forEach(project => {
      project.tags.forEach(tag => allTags.add(tag));
    });

    Array.from(allTags).forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        const count = mockProjects.filter(p => p.tags.includes(tag)).length;
        newSuggestions.push({
          type: 'tag',
          value: tag,
          label: tag,
          count
        });
      }
    });

    // 地理位置建议
    const allLocations = new Set<string>();
    mockProjects.forEach(project => {
      allLocations.add(project.location);
    });

    Array.from(allLocations).forEach(location => {
      if (location.toLowerCase().includes(query)) {
        const count = mockProjects.filter(p => p.location === location).length;
        newSuggestions.push({
          type: 'location',
          value: location,
          label: location,
          count
        });
      }
    });

    // 创始人建议
    mockProjects.forEach(project => {
      if (project.founder.toLowerCase().includes(query)) {
        newSuggestions.push({
          type: 'founder',
          value: project.founder,
          label: `创始人: ${project.founder}`
        });
      }
    });

    // 限制建议数量并去重
    const uniqueSuggestions = newSuggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.value === suggestion.value && s.type === suggestion.type)
      )
      .slice(0, 8);

    setSuggestions(uniqueSuggestions);
  }, [value]);

  // 处理搜索
  const handleSearch = (searchValue: string) => {
    if (searchValue.trim()) {
      // 添加到搜索历史
      const newHistory = [searchValue, ...searchHistory.filter(h => h !== searchValue)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    }
    
    onChange(searchValue);
    setIsOpen(false);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 清除搜索历史
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  // 删除单个历史记录
  const removeHistoryItem = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'project': return '📱';
      case 'skill': return '🛠️';
      case 'tag': return '🏷️';
      case 'location': return '📍';
      case 'founder': return '👤';
      default: return '🔍';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
        />
        {value && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 搜索建议下拉框 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* 搜索建议 */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1">搜索建议</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => handleSearch(suggestion.value)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                >
                  <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                  <span className="flex-1 text-left">{suggestion.label}</span>
                  {suggestion.count && (
                    <span className="text-xs text-gray-400">{suggestion.count}个项目</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 搜索历史 */}
          {!value && searchHistory.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="text-xs font-medium text-gray-500">搜索历史</div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  清除
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded group"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => handleSearch(item)}
                    className="flex-1 text-left text-sm text-gray-700"
                  >
                    {item}
                  </button>
                  <button
                    onClick={() => removeHistoryItem(item)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 热门搜索 */}
          {!value && suggestions.length === 0 && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-medium text-gray-500 px-2 py-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                热门搜索
              </div>
              <div className="flex flex-wrap gap-1 px-2">
                {hotSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item)}
                    className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {value && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              没有找到相关建议
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearchBox;