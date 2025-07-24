import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, X, Search, Edit2 } from 'lucide-react';
import { ProjectFilters } from '../../types/project.types';

interface SavedSearch {
  id: string;
  name: string;
  filters: ProjectFilters;
  createdAt: string;
}

interface SavedSearchesProps {
  currentFilters: ProjectFilters;
  onApplyFilters: (filters: ProjectFilters) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  currentFilters,
  onApplyFilters
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 从localStorage加载保存的搜索
  useEffect(() => {
    const saved = localStorage.getItem('saved_searches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved searches:', e);
      }
    }
  }, []);

  // 保存到localStorage
  const saveToStorage = (searches: SavedSearch[]) => {
    localStorage.setItem('saved_searches', JSON.stringify(searches));
    setSavedSearches(searches);
  };

  // 检查当前筛选条件是否为空
  const isFiltersEmpty = (filters: ProjectFilters) => {
    return !filters.search &&
           filters.type === 'all' &&
           filters.stage === 'all' &&
           filters.fundingStage === 'all' &&
           !filters.location &&
           filters.teamSize.min === 1 &&
           filters.teamSize.max === 50 &&
           filters.skills.length === 0 &&
           filters.tags.length === 0;
  };

  // 生成搜索条件的描述
  const getFiltersDescription = (filters: ProjectFilters) => {
    const parts = [];
    
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.type !== 'all') parts.push(filters.type);
    if (filters.stage !== 'all') parts.push(filters.stage);
    if (filters.fundingStage !== 'all') parts.push(filters.fundingStage);
    if (filters.location) parts.push(filters.location);
    if (filters.skills.length > 0) parts.push(`技能: ${filters.skills.join(', ')}`);
    
    return parts.length > 0 ? parts.join(' • ') : '默认筛选';
  };

  // 保存当前搜索
  const handleSaveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date().toISOString()
    };

    const updatedSearches = [newSearch, ...savedSearches].slice(0, 10); // 最多保存10个
    saveToStorage(updatedSearches);
    
    setSearchName('');
    setShowSaveModal(false);
  };

  // 删除保存的搜索
  const handleDeleteSearch = (id: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== id);
    saveToStorage(updatedSearches);
  };

  // 重命名搜索
  const handleRenameSearch = (id: string, newName: string) => {
    const updatedSearches = savedSearches.map(s => 
      s.id === id ? { ...s, name: newName } : s
    );
    saveToStorage(updatedSearches);
    setEditingId(null);
  };

  // 应用保存的搜索
  const handleApplySearch = (search: SavedSearch) => {
    onApplyFilters(search.filters);
  };

  if (savedSearches.length === 0 && isFiltersEmpty(currentFilters)) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">保存的搜索</span>
        </div>
        
        {!isFiltersEmpty(currentFilters) && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
          >
            <Plus className="w-3 h-3" />
            保存当前搜索
          </button>
        )}
      </div>

      {/* 保存的搜索列表 */}
      {savedSearches.length > 0 && (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
            >
              <Search className="w-3 h-3 text-gray-400 flex-shrink-0" />
              
              {editingId === search.id ? (
                <input
                  type="text"
                  defaultValue={search.name}
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                  autoFocus
                  onBlur={(e) => handleRenameSearch(search.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRenameSearch(search.id, e.currentTarget.value);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleApplySearch(search)}
                    className="text-left w-full"
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {search.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {getFiltersDescription(search.filters)}
                    </div>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setEditingId(search.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="重命名"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="删除"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 保存搜索模态框 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">保存搜索条件</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索名称
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="输入搜索名称..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前筛选条件
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {getFiltersDescription(currentFilters)}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSearchName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearches;