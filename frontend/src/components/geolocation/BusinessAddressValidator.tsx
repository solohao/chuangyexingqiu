// 商业地址验证组件

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Building, MapPin, Lightbulb } from 'lucide-react';
import { GeocodeService } from '../../services/geocode.service';

interface BusinessAddressValidatorProps {
  address: string;
  onValidationResult?: (result: {
    isValid: boolean;
    businessFriendly: boolean;
    suggestions?: string[];
  }) => void;
  showSuggestions?: boolean;
  className?: string;
}

export const BusinessAddressValidator: React.FC<BusinessAddressValidatorProps> = ({
  address,
  onValidationResult,
  showSuggestions = true,
  className = ''
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    businessFriendly: boolean;
    suggestions?: string[];
    loading: boolean;
    error?: string;
  }>({
    isValid: false,
    businessFriendly: false,
    loading: false
  });

  // 验证地址
  const validateAddress = async (addressToValidate: string) => {
    if (!addressToValidate.trim()) {
      setValidationResult({
        isValid: false,
        businessFriendly: false,
        loading: false
      });
      return;
    }

    setValidationResult(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const result = await GeocodeService.validateBusinessAddress(addressToValidate);
      
      const newResult = {
        isValid: result.isValid,
        businessFriendly: result.businessFriendly,
        suggestions: result.suggestions,
        loading: false,
        error: result.error ? result.error.message : undefined
      };

      setValidationResult(newResult);
      
      if (onValidationResult) {
        onValidationResult({
          isValid: result.isValid,
          businessFriendly: result.businessFriendly,
          suggestions: result.suggestions
        });
      }

    } catch (error) {
      const errorResult = {
        isValid: false,
        businessFriendly: false,
        loading: false,
        error: '地址验证失败，请稍后重试'
      };
      
      setValidationResult(errorResult);
      
      if (onValidationResult) {
        onValidationResult({
          isValid: false,
          businessFriendly: false,
          suggestions: ['地址验证失败，请检查网络连接']
        });
      }
    }
  };

  // 防抖验证
  useEffect(() => {
    const timer = setTimeout(() => {
      if (address) {
        validateAddress(address);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address]);

  // 如果没有地址，不显示任何内容
  if (!address.trim()) {
    return null;
  }

  const { isValid, businessFriendly, suggestions, loading, error } = validationResult;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 验证状态指示器 */}
      <div className="flex items-center space-x-2">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span className="text-sm text-gray-600">正在验证地址...</span>
          </>
        ) : error ? (
          <>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
          </>
        ) : isValid ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">地址验证成功</span>
            {businessFriendly ? (
              <div className="flex items-center text-sm text-blue-600">
                <Building className="w-4 h-4 mr-1" />
                <span>商业友好地址</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-yellow-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>一般地址</span>
              </div>
            )}
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-600">地址可能不准确</span>
          </>
        )}
      </div>

      {/* 商业友好性说明 */}
      {!loading && isValid && (
        <div className={`p-3 rounded-md border ${
          businessFriendly 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start space-x-2">
            {businessFriendly ? (
              <Building className="w-4 h-4 text-blue-500 mt-0.5" />
            ) : (
              <MapPin className="w-4 h-4 text-yellow-500 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                businessFriendly ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {businessFriendly ? '商业友好地址' : '一般地址'}
              </div>
              <div className={`text-xs mt-1 ${
                businessFriendly ? 'text-blue-700' : 'text-yellow-700'
              }`}>
                {businessFriendly 
                  ? '该地址位于商业区域，适合开展商业活动和团队协作'
                  : '该地址可能不在主要商业区域，但仍可用于项目运营'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 建议和提示 */}
      {!loading && showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-800">建议</div>
              <ul className="text-xs text-amber-700 mt-1 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 地址类型说明 */}
      {!loading && isValid && (
        <div className="text-xs text-gray-500 space-y-1">
          <div className="font-medium">地址类型说明：</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Building className="w-3 h-3 text-blue-500" />
              <span>商业友好：写字楼、商务区、创业园区等</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-yellow-500" />
              <span>一般地址：住宅区、混合用途区域等</span>
            </div>
          </div>
        </div>
      )}

      {/* 共享办公空间推荐 */}
      {!loading && isValid && !businessFriendly && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <Building className="w-4 h-4 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-purple-800">
                考虑共享办公空间
              </div>
              <div className="text-xs text-purple-700 mt-1">
                如果需要更专业的办公环境，可以考虑附近的共享办公空间或联合办公区域。
                这些地方通常提供更好的商业氛围和网络资源。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};