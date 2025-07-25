// 协作导向的地址输入组件

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building, Wifi, Users, Check, AlertCircle } from 'lucide-react';
import { 
  GeoLocation, 
  AddressSuggestion, 
  CoworkingSpaceSuggestion,
  LOCATION_TYPES 
} from '../../types/geolocation.types';
import { GeocodeService } from '../../services/geocode.service';
import { CollaborationValidation } from '../../utils/collaboration-validation';

interface CollaborationAddressInputProps {
  value: string;
  onChange: (address: string, location?: GeoLocation) => void;
  locationType: 'physical' | 'remote' | 'hybrid';
  onLocationTypeChange: (type: 'physical' | 'remote' | 'hybrid') => void;
  placeholder?: string;
  city?: string;
  showCoworkingSpaces?: boolean;
  onLocationSelect?: (location: any) => void;
  disabled?: boolean;
  error?: string;
}

export const CollaborationAddressInput: React.FC<CollaborationAddressInputProps> = ({
  value,
  onChange,
  locationType,
  onLocationTypeChange,
  placeholder = "请输入项目运营地点",
  city,
  showCoworkingSpaces = true,
  onLocationSelect,
  disabled = false,
  error
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [coworkingSpaces, setCoworkingSpaces] = useState<CoworkingSpaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // 位置类型选项
  const locationTypeOptions = [
    {
      value: LOCATION_TYPES.PHYSICAL,
      label: '实体办公',
      icon: Building,
      description: '有固定的办公地点，主要进行线下协作',
      color: 'text-blue-600'
    },
    {
      value: LOCATION_TYPES.REMOTE,
      label: '远程办公',
      icon: Wifi,
      description: '完全远程办公，主要通过线上方式协作',
      color: 'text-green-600'
    },
    {
      value: LOCATION_TYPES.HYBRID,
      label: '混合模式',
      icon: Users,
      description: '结合线上线下，灵活选择协作方式',
      color: 'text-purple-600'
    }
  ];

  // 处理地址输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // 清除之前的防抖定时器
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 如果是远程模式，不需要详细地址搜索
    if (locationType === LOCATION_TYPES.REMOTE) {
      setShowSuggestions(false);
      return;
    }

    // 防抖搜索
    if (inputValue.length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchAddressSuggestions(inputValue);
      }, 300);
    } else {
      setSuggestions([]);
      setCoworkingSpaces([]);
      setShowSuggestions(false);
    }
  };

  // 搜索地址建议
  const searchAddressSuggestions = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await GeocodeService.autocompleteAddress(
        query, 
        city, 
        showCoworkingSpaces && locationType === LOCATION_TYPES.PHYSICAL
      );

      if (!result.error) {
        setSuggestions(result.suggestions);
        setCoworkingSpaces(result.coworkingSpaces || []);
        setShowSuggestions(true);
      } else {
        console.warn('地址搜索失败:', result.error);
        setSuggestions([]);
        setCoworkingSpaces([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('地址搜索异常:', error);
      setSuggestions([]);
      setCoworkingSpaces([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // 选择地址建议
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.address, suggestion.location);
    setSelectedLocation(suggestion.location);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        address: suggestion.address,
        location: suggestion.location,
        type: 'address'
      });
    }
  };

  // 选择共享办公空间
  const handleCoworkingSpaceSelect = (space: CoworkingSpaceSuggestion) => {
    const address = `${space.name} - ${space.address}`;
    onChange(address, space.location);
    setSelectedLocation(space.location);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        address,
        location: space.location,
        type: 'coworking',
        amenities: space.amenities,
        priceRange: space.priceRange,
        rating: space.rating
      });
    }
  };

  // 处理位置类型变化
  const handleLocationTypeChange = (type: 'physical' | 'remote' | 'hybrid') => {
    onLocationTypeChange(type);
    
    // 如果切换到远程模式，清除地址信息
    if (type === LOCATION_TYPES.REMOTE) {
      onChange('');
      setSelectedLocation(null);
      setShowSuggestions(false);
    }
  };

  // 验证当前输入
  useEffect(() => {
    if (selectedLocation) {
      const result = CollaborationValidation.validateGeoLocation(selectedLocation);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [selectedLocation]);

  // 点击外部关闭建议列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* 位置类型选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          项目位置类型 *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locationTypeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.value}
                onClick={() => handleLocationTypeChange(option.value as any)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  locationType === option.value
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-5 h-5 mt-0.5 ${option.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </div>
                  {locationType === option.value && (
                    <Check className="w-4 h-4 text-primary-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 地址输入 */}
      {locationType !== LOCATION_TYPES.REMOTE && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locationType === LOCATION_TYPES.PHYSICAL ? '办公地址' : '主要运营地点'}
            {locationType === LOCATION_TYPES.PHYSICAL ? ' *' : ''}
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={
                locationType === LOCATION_TYPES.PHYSICAL 
                  ? "请输入详细办公地址" 
                  : "请输入主要运营城市"
              }
              disabled={disabled}
              className={`
                block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm
                focus:ring-primary-500 focus:border-primary-500
                ${error ? 'border-red-300' : 'border-gray-300'}
                ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
              `}
            />
            
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
            
            {selectedLocation && validationResult?.isValid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>

          {/* 建议列表 */}
          {showSuggestions && (suggestions.length > 0 || coworkingSpaces.length > 0) && (
            <div 
              ref={suggestionsRef}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              {/* 普通地址建议 */}
              {suggestions.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                    地址建议
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`address-${index}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{suggestion.name}</div>
                          <div className="text-sm text-gray-500">{suggestion.address}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 共享办公空间建议 */}
              {coworkingSpaces.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-blue-50">
                    推荐共享办公空间
                  </div>
                  {coworkingSpaces.map((space, index) => (
                    <div
                      key={`coworking-${index}`}
                      onClick={() => handleCoworkingSpaceSelect(space)}
                      className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-blue-50"
                    >
                      <div className="flex items-start">
                        <Building className="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{space.name}</div>
                          <div className="text-sm text-gray-500">{space.address}</div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-blue-600">{space.priceRange}</span>
                            {space.rating && (
                              <span className="text-xs text-yellow-600">
                                ⭐ {space.rating}
                              </span>
                            )}
                          </div>
                          {space.amenities.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {space.amenities.slice(0, 3).join(', ')}
                              {space.amenities.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 远程模式说明 */}
      {locationType === LOCATION_TYPES.REMOTE && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Wifi className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                远程办公模式
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  您选择了远程办公模式，项目将主要通过线上方式进行协作。
                  您仍可以在个人资料中设置所在城市，以便其他用户了解您的时区和大致位置。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {/* 验证警告 */}
      {validationResult && validationResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
            <div className="ml-2">
              <div className="text-sm text-yellow-800">
                {validationResult.warnings.map((warning: string, index: number) => (
                  <div key={index}>• {warning}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 位置类型说明 */}
      <div className="text-xs text-gray-500">
        {locationType === LOCATION_TYPES.PHYSICAL && (
          <p>💡 实体办公有助于团队凝聚力，适合需要频繁面对面沟通的项目</p>
        )}
        {locationType === LOCATION_TYPES.REMOTE && (
          <p>💡 远程办公可以接触更广泛的人才，适合技术驱动的项目</p>
        )}
        {locationType === LOCATION_TYPES.HYBRID && (
          <p>💡 混合模式兼具灵活性和协作效率，适合大多数现代项目</p>
        )}
      </div>
    </div>
  );
};