// 增强的地理编码服务，支持商业地址验证和共享办公空间推荐

import { 
  GeoLocation, 
  AddressComponents, 
  AddressSuggestion, 
  CoworkingSpaceSuggestion, 
  GeocodeResult 
} from '../types/geolocation.types';

export enum GeocodeErrorType {
  INVALID_ADDRESS = 'invalid_address',
  API_LIMIT_EXCEEDED = 'api_limit_exceeded',
  NETWORK_ERROR = 'network_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  INVALID_COORDINATES = 'invalid_coordinates'
}

export class GeocodeError extends Error {
  constructor(
    public type: GeocodeErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'GeocodeError';
  }
}

export class GeocodeService {
  private static readonly AMAP_GEOCODE_URL = 'https://restapi.amap.com/v3/geocode/geo';
  private static readonly AMAP_REGEOCODE_URL = 'https://restapi.amap.com/v3/geocode/regeo';
  private static readonly AMAP_INPUTTIPS_URL = 'https://restapi.amap.com/v3/assistant/inputtips';
  private static readonly AMAP_PLACE_SEARCH_URL = 'https://restapi.amap.com/v3/place/text';
  
  private static readonly API_KEY = import.meta.env.VITE_AMAP_KEY;
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时缓存
  
  // 缓存存储
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * 地址转坐标（地理编码）
   */
  static async geocodeAddress(address: string): Promise<{
    location: GeoLocation | null;
    formattedAddress: string;
    components: AddressComponents;
    accuracy: string;
    error: any;
  }> {
    try {
      // 检查缓存
      const cacheKey = `geocode_${address}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        key: this.API_KEY,
        address: address,
        output: 'json'
      });

      const response = await fetch(`${this.AMAP_GEOCODE_URL}?${params}`);
      const data = await response.json();

      if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
        throw new GeocodeError(
          GeocodeErrorType.INVALID_ADDRESS,
          '地址解析失败，请检查地址格式',
          data
        );
      }

      const geocode = data.geocodes[0];
      const [longitude, latitude] = geocode.location.split(',').map(Number);

      const result = {
        location: { latitude, longitude },
        formattedAddress: geocode.formatted_address || address,
        components: this.parseAddressComponents(geocode),
        accuracy: this.getAccuracyLevel(geocode.level),
        error: null
      };

      // 缓存结果
      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      if (error instanceof GeocodeError) {
        return {
          location: null,
          formattedAddress: address,
          components: {},
          accuracy: 'low',
          error
        };
      }

      return {
        location: null,
        formattedAddress: address,
        components: {},
        accuracy: 'low',
        error: new GeocodeError(
          GeocodeErrorType.NETWORK_ERROR,
          '网络请求失败，请稍后重试',
          error
        )
      };
    }
  }

  /**
   * 坐标转地址（逆地理编码）
   */
  static async reverseGeocode(location: GeoLocation): Promise<{
    address: string;
    formattedAddress: string;
    components: AddressComponents;
    error: any;
  }> {
    try {
      const cacheKey = `reverse_${location.latitude}_${location.longitude}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        key: this.API_KEY,
        location: `${location.longitude},${location.latitude}`,
        output: 'json',
        radius: '1000',
        extensions: 'all'
      });

      const response = await fetch(`${this.AMAP_REGEOCODE_URL}?${params}`);
      const data = await response.json();

      if (data.status !== '1' || !data.regeocode) {
        throw new GeocodeError(
          GeocodeErrorType.INVALID_COORDINATES,
          '坐标解析失败',
          data
        );
      }

      const regeocode = data.regeocode;
      const result = {
        address: regeocode.formatted_address,
        formattedAddress: regeocode.formatted_address,
        components: this.parseRegeocodeComponents(regeocode.addressComponent),
        error: null
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      if (error instanceof GeocodeError) {
        return {
          address: '',
          formattedAddress: '',
          components: {},
          error
        };
      }

      return {
        address: '',
        formattedAddress: '',
        components: {},
        error: new GeocodeError(
          GeocodeErrorType.NETWORK_ERROR,
          '网络请求失败，请稍后重试',
          error
        )
      };
    }
  }

  /**
   * 地址自动补全（包含共享办公空间推荐）
   */
  static async autocompleteAddress(
    input: string, 
    city?: string, 
    includeCoworkingSpaces: boolean = true
  ): Promise<{
    suggestions: AddressSuggestion[];
    coworkingSpaces?: CoworkingSpaceSuggestion[];
    error: any;
  }> {
    try {
      const params = new URLSearchParams({
        key: this.API_KEY,
        keywords: input,
        output: 'json',
        datatype: 'all'
      });

      if (city) {
        params.append('city', city);
      }

      const response = await fetch(`${this.AMAP_INPUTTIPS_URL}?${params}`);
      const data = await response.json();

      if (data.status !== '1') {
        throw new GeocodeError(
          GeocodeErrorType.SERVICE_UNAVAILABLE,
          '地址搜索服务暂时不可用',
          data
        );
      }

      const suggestions: AddressSuggestion[] = (data.tips || []).map((tip: any) => ({
        id: tip.id,
        name: tip.name,
        district: tip.district,
        address: tip.address,
        location: this.parseLocation(tip.location),
        type: this.getAddressType(tip.typecode)
      }));

      let coworkingSpaces: CoworkingSpaceSuggestion[] = [];
      
      // 如果需要共享办公空间推荐
      if (includeCoworkingSpaces) {
        coworkingSpaces = await this.searchCoworkingSpaces(input, city);
      }

      return {
        suggestions,
        coworkingSpaces,
        error: null
      };

    } catch (error) {
      if (error instanceof GeocodeError) {
        return {
          suggestions: [],
          coworkingSpaces: [],
          error
        };
      }

      return {
        suggestions: [],
        coworkingSpaces: [],
        error: new GeocodeError(
          GeocodeErrorType.NETWORK_ERROR,
          '网络请求失败，请稍后重试',
          error
        )
      };
    }
  }

  /**
   * 批量地理编码
   */
  static async batchGeocode(addresses: string[]): Promise<{
    results: GeocodeResult[];
    error: any;
  }> {
    try {
      const results: GeocodeResult[] = [];
      const batchSize = 10; // 每批处理10个地址

      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        const batchPromises = batch.map(async (address) => {
          const result = await this.geocodeAddress(address);
          return {
            originalAddress: address,
            location: result.location,
            formattedAddress: result.formattedAddress,
            components: result.components,
            confidence: result.accuracy === 'high' ? 0.9 : result.accuracy === 'medium' ? 0.7 : 0.5,
            error: result.error?.message
          };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // 避免API限流，批次间延迟
        if (i + batchSize < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return { results, error: null };

    } catch (error) {
      return {
        results: [],
        error: new GeocodeError(
          GeocodeErrorType.NETWORK_ERROR,
          '批量地理编码失败',
          error
        )
      };
    }
  }

  /**
   * 验证地址是否适合商业活动
   */
  static async validateBusinessAddress(address: string): Promise<{
    isValid: boolean;
    businessFriendly: boolean;
    suggestions?: string[];
    error: any;
  }> {
    try {
      const geocodeResult = await this.geocodeAddress(address);
      
      if (!geocodeResult.location) {
        return {
          isValid: false,
          businessFriendly: false,
          suggestions: ['请输入更详细的地址信息'],
          error: geocodeResult.error
        };
      }

      // 检查是否为商业区域
      const businessFriendly = await this.checkBusinessArea(geocodeResult.location);
      
      const suggestions: string[] = [];
      if (!businessFriendly) {
        suggestions.push('建议选择商业区或创业园区地址');
        suggestions.push('可以考虑共享办公空间');
      }

      return {
        isValid: true,
        businessFriendly,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        error: null
      };

    } catch (error) {
      return {
        isValid: false,
        businessFriendly: false,
        error: new GeocodeError(
          GeocodeErrorType.NETWORK_ERROR,
          '地址验证失败',
          error
        )
      };
    }
  }

  // 私有辅助方法

  private static parseAddressComponents(geocode: any): AddressComponents {
    return {
      country: geocode.country || '中国',
      province: geocode.province,
      city: geocode.city,
      district: geocode.district,
      street: geocode.street,
      streetNumber: geocode.number,
      postalCode: geocode.adcode
    };
  }

  private static parseRegeocodeComponents(component: any): AddressComponents {
    return {
      country: component.country || '中国',
      province: component.province,
      city: component.city,
      district: component.district,
      street: component.township,
      streetNumber: component.streetNumber?.street,
      postalCode: component.adcode
    };
  }

  private static parseLocation(locationStr: string): GeoLocation {
    const [longitude, latitude] = locationStr.split(',').map(Number);
    return { latitude, longitude };
  }

  private static getAccuracyLevel(level: string): 'high' | 'medium' | 'low' {
    // 根据高德地图的level字段判断精度
    if (['门牌号', '门址', '楼栋'].includes(level)) return 'high';
    if (['道路', '街道', '路口'].includes(level)) return 'medium';
    return 'low';
  }

  private static getAddressType(typecode: string): 'poi' | 'address' | 'bus_stop' | 'subway' {
    if (typecode.startsWith('15')) return 'poi';
    if (typecode.startsWith('23')) return 'bus_stop';
    if (typecode.startsWith('24')) return 'subway';
    return 'address';
  }

  private static async searchCoworkingSpaces(
    query: string, 
    city?: string
  ): Promise<CoworkingSpaceSuggestion[]> {
    try {
      const keywords = `${query} 共享办公|联合办公|创业园区|孵化器`;
      const params = new URLSearchParams({
        key: this.API_KEY,
        keywords,
        output: 'json',
        offset: '10',
        page: '1',
        extensions: 'all'
      });

      if (city) {
        params.append('city', city);
      }

      const response = await fetch(`${this.AMAP_PLACE_SEARCH_URL}?${params}`);
      const data = await response.json();

      if (data.status !== '1' || !data.pois) {
        return [];
      }

      return data.pois.map((poi: any) => ({
        id: poi.id,
        name: poi.name,
        address: poi.address,
        location: this.parseLocation(poi.location),
        amenities: this.parseAmenities(poi.biz_ext),
        priceRange: this.estimatePriceRange(poi.biz_ext),
        rating: poi.biz_ext?.rating ? parseFloat(poi.biz_ext.rating) : undefined
      }));

    } catch (error) {
      console.warn('共享办公空间搜索失败:', error);
      return [];
    }
  }

  private static async checkBusinessArea(location: GeoLocation): Promise<boolean> {
    // 简化的商业区域检查逻辑
    // 实际应用中可以调用更详细的POI分析API
    try {
      const reverseResult = await this.reverseGeocode(location);
      const address = reverseResult.formattedAddress.toLowerCase();
      
      const businessKeywords = [
        '商业区', '商务区', 'cbd', '写字楼', '办公楼', 
        '创业园', '科技园', '产业园', '孵化器'
      ];
      
      return businessKeywords.some(keyword => address.includes(keyword));
    } catch (error) {
      return true; // 默认认为是商业友好的
    }
  }

  private static parseAmenities(bizExt: any): string[] {
    // 解析商业扩展信息中的设施
    const amenities: string[] = [];
    if (bizExt?.facilities) {
      amenities.push(...bizExt.facilities.split(';'));
    }
    return amenities;
  }

  private static estimatePriceRange(bizExt: any): string {
    // 根据商业信息估算价格范围
    if (bizExt?.cost) {
      const cost = parseInt(bizExt.cost);
      if (cost < 100) return '经济型';
      if (cost < 300) return '中档';
      return '高档';
    }
    return '价格面议';
  }

  // 缓存管理
  private static getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 清理过期缓存
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}