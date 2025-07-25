// 协作偏好数据验证工具

import {
  CollaborationPreference,
  LocationSettings,
  ServiceArea,
  GeoLocation,
  COLLABORATION_MODES,
  LOCATION_TYPES,
  MEETING_PREFERENCES,
  LOCATION_VISIBILITY
} from '../types/geolocation.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class CollaborationValidation {
  
  /**
   * 验证协作偏好数据
   */
  static validateCollaborationPreference(preference: Partial<CollaborationPreference>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证协作模式
    if (preference.mode && !Object.values(COLLABORATION_MODES).includes(preference.mode as any)) {
      errors.push(`无效的协作模式: ${preference.mode}`);
    }

    // 验证最大协作距离
    if (preference.maxDistance !== undefined) {
      if (typeof preference.maxDistance !== 'number' || preference.maxDistance < 0) {
        errors.push('最大协作距离必须是非负数');
      } else if (preference.maxDistance > 1000) {
        warnings.push('最大协作距离超过1000公里，可能不太实际');
      } else if (preference.maxDistance < 1 && preference.mode === COLLABORATION_MODES.LOCAL_ONLY) {
        warnings.push('本地协作模式下距离设置过小，可能难以找到合作伙伴');
      }
    }

    // 验证会议偏好
    if (preference.meetingPreference && !Object.values(MEETING_PREFERENCES).includes(preference.meetingPreference as any)) {
      errors.push(`无效的会议偏好: ${preference.meetingPreference}`);
    }

    // 验证时区灵活性
    if (preference.timeZoneFlexibility !== undefined && typeof preference.timeZoneFlexibility !== 'boolean') {
      errors.push('时区灵活性必须是布尔值');
    }

    // 验证描述长度
    if (preference.description && preference.description.length > 500) {
      errors.push('协作偏好描述不能超过500字符');
    }

    // 逻辑一致性检查
    if (preference.mode === COLLABORATION_MODES.REMOTE_FRIENDLY && 
        preference.meetingPreference === MEETING_PREFERENCES.OFFLINE) {
      warnings.push('远程协作模式下选择仅线下会议可能存在矛盾');
    }

    if (preference.mode === COLLABORATION_MODES.LOCAL_ONLY && 
        preference.timeZoneFlexibility === false && 
        preference.maxDistance && preference.maxDistance > 100) {
      warnings.push('本地协作模式下不接受跨时区但距离设置较大，可能存在矛盾');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证位置设置
   */
  static validateLocationSettings(settings: Partial<LocationSettings>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证位置类型
    if (settings.type && !Object.values(LOCATION_TYPES).includes(settings.type as any)) {
      errors.push(`无效的位置类型: ${settings.type}`);
    }

    // 验证可见性设置
    if (settings.visibility && !Object.values(LOCATION_VISIBILITY).includes(settings.visibility as any)) {
      errors.push(`无效的位置可见性: ${settings.visibility}`);
    }

    // 验证布尔值字段
    if (settings.showExactAddress !== undefined && typeof settings.showExactAddress !== 'boolean') {
      errors.push('显示详细地址设置必须是布尔值');
    }

    if (settings.allowContactForMeetup !== undefined && typeof settings.allowContactForMeetup !== 'boolean') {
      errors.push('允许联系见面设置必须是布尔值');
    }

    // 逻辑一致性检查
    if (settings.type === LOCATION_TYPES.REMOTE && settings.showExactAddress === true) {
      warnings.push('远程项目显示详细地址可能没有必要');
    }

    if (settings.visibility === LOCATION_VISIBILITY.HIDDEN && settings.allowContactForMeetup === true) {
      warnings.push('隐藏位置但允许联系见面可能存在矛盾');
    }

    if (settings.type === LOCATION_TYPES.PHYSICAL && settings.visibility === LOCATION_VISIBILITY.HIDDEN) {
      warnings.push('实体办公项目隐藏位置可能影响协作效果');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证服务区域设置
   */
  static validateServiceArea(serviceArea: Partial<ServiceArea>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证服务区域类型
    const validTypes = ['local', 'regional', 'national', 'global'];
    if (serviceArea.type && !validTypes.includes(serviceArea.type)) {
      errors.push(`无效的服务区域类型: ${serviceArea.type}`);
    }

    // 验证目标区域
    if (serviceArea.targetRegions) {
      if (!Array.isArray(serviceArea.targetRegions)) {
        errors.push('目标区域必须是数组');
      } else {
        // 检查数组元素
        const invalidRegions = serviceArea.targetRegions.filter(region => 
          typeof region !== 'string' || region.trim().length === 0
        );
        if (invalidRegions.length > 0) {
          errors.push('目标区域包含无效的地区名称');
        }

        // 检查重复
        const uniqueRegions = new Set(serviceArea.targetRegions);
        if (uniqueRegions.size !== serviceArea.targetRegions.length) {
          warnings.push('目标区域包含重复项');
        }

        // 检查数量合理性
        if (serviceArea.targetRegions.length > 20) {
          warnings.push('目标区域过多，可能影响专注度');
        }
      }
    }

    // 验证描述长度
    if (serviceArea.description && serviceArea.description.length > 300) {
      errors.push('服务区域描述不能超过300字符');
    }

    // 逻辑一致性检查
    if (serviceArea.type === 'local' && serviceArea.targetRegions && serviceArea.targetRegions.length > 3) {
      warnings.push('本地服务类型设置过多目标区域可能不合理');
    }

    if (serviceArea.type === 'global' && serviceArea.targetRegions && serviceArea.targetRegions.length > 0) {
      warnings.push('全球服务类型通常不需要指定具体目标区域');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证地理位置坐标
   */
  static validateGeoLocation(location: Partial<GeoLocation>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证纬度
    if (location.latitude !== undefined) {
      if (typeof location.latitude !== 'number') {
        errors.push('纬度必须是数字');
      } else if (location.latitude < -90 || location.latitude > 90) {
        errors.push('纬度必须在-90到90之间');
      }
    }

    // 验证经度
    if (location.longitude !== undefined) {
      if (typeof location.longitude !== 'number') {
        errors.push('经度必须是数字');
      } else if (location.longitude < -180 || location.longitude > 180) {
        errors.push('经度必须在-180到180之间');
      }
    }

    // 验证精度
    if (location.accuracy !== undefined) {
      if (typeof location.accuracy !== 'number' || location.accuracy < 0) {
        errors.push('位置精度必须是非负数');
      } else if (location.accuracy > 10000) {
        warnings.push('位置精度值过大，可能不准确');
      }
    }

    // 检查坐标是否在中国境内（可选的业务逻辑）
    if (location.latitude !== undefined && location.longitude !== undefined) {
      const isInChina = this.isLocationInChina(location.latitude, location.longitude);
      if (!isInChina) {
        warnings.push('坐标位置不在中国境内，请确认是否正确');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 综合验证项目协作设置
   */
  static validateProjectCollaborationSettings(data: {
    collaborationPreference?: Partial<CollaborationPreference>;
    locationSettings?: Partial<LocationSettings>;
    serviceArea?: Partial<ServiceArea>;
    location?: Partial<GeoLocation>;
  }): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // 分别验证各个部分
    if (data.collaborationPreference) {
      const prefResult = this.validateCollaborationPreference(data.collaborationPreference);
      allErrors.push(...prefResult.errors);
      allWarnings.push(...prefResult.warnings);
    }

    if (data.locationSettings) {
      const settingsResult = this.validateLocationSettings(data.locationSettings);
      allErrors.push(...settingsResult.errors);
      allWarnings.push(...settingsResult.warnings);
    }

    if (data.serviceArea) {
      const areaResult = this.validateServiceArea(data.serviceArea);
      allErrors.push(...areaResult.errors);
      allWarnings.push(...areaResult.warnings);
    }

    if (data.location) {
      const locationResult = this.validateGeoLocation(data.location);
      allErrors.push(...locationResult.errors);
      allWarnings.push(...locationResult.warnings);
    }

    // 跨模块一致性检查
    if (data.collaborationPreference && data.locationSettings) {
      if (data.collaborationPreference.mode === COLLABORATION_MODES.REMOTE_FRIENDLY && 
          data.locationSettings.type === LOCATION_TYPES.PHYSICAL &&
          data.locationSettings.showExactAddress === true) {
        allWarnings.push('远程协作项目显示详细物理地址可能不必要');
      }

      if (data.collaborationPreference.mode === COLLABORATION_MODES.LOCAL_ONLY &&
          data.locationSettings.type === LOCATION_TYPES.REMOTE) {
        allErrors.push('本地协作模式与远程位置类型冲突');
      }
    }

    if (data.serviceArea && data.collaborationPreference) {
      if (data.serviceArea.type === 'local' && 
          data.collaborationPreference.mode === COLLABORATION_MODES.REMOTE_FRIENDLY) {
        allWarnings.push('本地服务区域与远程协作模式可能存在矛盾');
      }

      if (data.serviceArea.type === 'global' && 
          data.collaborationPreference.mode === COLLABORATION_MODES.LOCAL_ONLY) {
        allWarnings.push('全球服务区域与仅本地协作模式存在矛盾');
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * 生成协作设置建议
   */
  static generateCollaborationSuggestions(data: {
    collaborationPreference?: Partial<CollaborationPreference>;
    locationSettings?: Partial<LocationSettings>;
    serviceArea?: Partial<ServiceArea>;
    projectType?: string;
    projectStage?: string;
  }): string[] {
    const suggestions: string[] = [];

    // 基于项目类型的建议
    if (data.projectType === 'startup') {
      suggestions.push('创业项目建议选择"位置灵活"模式以扩大合作伙伴范围');
    } else if (data.projectType === 'tech') {
      suggestions.push('技术项目通常适合远程协作，可以考虑"远程友好"模式');
    }

    // 基于项目阶段的建议
    if (data.projectStage === 'idea') {
      suggestions.push('创意阶段建议优先本地协作，便于频繁沟通和快速迭代');
    } else if (data.projectStage === 'growth') {
      suggestions.push('成长阶段可以考虑扩大协作范围，接受远程合作伙伴');
    }

    // 基于当前设置的优化建议
    if (data.collaborationPreference?.mode === COLLABORATION_MODES.LOCAL_ONLY &&
        data.collaborationPreference?.maxDistance && data.collaborationPreference.maxDistance < 10) {
      suggestions.push('本地协作距离设置较小，建议适当增加以获得更多合作机会');
    }

    if (data.locationSettings?.visibility === LOCATION_VISIBILITY.HIDDEN) {
      suggestions.push('隐藏位置可能减少被发现的机会，建议至少显示城市信息');
    }

    if (data.serviceArea?.type === 'global' && !data.collaborationPreference?.timeZoneFlexibility) {
      suggestions.push('全球服务项目建议开启时区灵活性以适应国际合作');
    }

    return suggestions;
  }

  // 私有辅助方法

  /**
   * 简单检查坐标是否在中国境内
   */
  private static isLocationInChina(latitude: number, longitude: number): boolean {
    // 中国大陆的大致边界
    const chinaBounds = {
      north: 53.5,
      south: 18.2,
      east: 134.8,
      west: 73.5
    };

    return latitude >= chinaBounds.south && 
           latitude <= chinaBounds.north && 
           longitude >= chinaBounds.west && 
           longitude <= chinaBounds.east;
  }
}