// 项目编辑页面

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Target, Settings, AlertCircle } from 'lucide-react';
import { ProjectType, ProjectStage, FundingStage, ProjectStatus, ProjectCategory } from '../../types/project.types';
import { ProjectService, UpdateProjectData } from '../../services/project.service';
import { supabase } from '../../config/supabase.config';
import { 
  CollaborationPreference, 
  LocationSettings, 
  ServiceArea,
  GeoLocation,
  DEFAULT_COLLABORATION_PREFERENCE,
  DEFAULT_LOCATION_SETTINGS,
  DEFAULT_SERVICE_AREA
} from '../../types/geolocation.types';
import { CollaborationAddressInput } from '../../components/geolocation/CollaborationAddressInput';
import { LocationVisibilitySettings } from '../../components/geolocation/LocationVisibilitySettings';
import { CollaborationValidation } from '../../utils/collaboration-validation';

interface EditProjectFormData {
  title: string;
  description: string;
  content: string;
  type: ProjectType;
  category: ProjectCategory;
  stage: ProjectStage;
  status: ProjectStatus;
  location: string;
  city: string;
  province: string;
  max_team_size: number;
  seeking_roles: string[];
  funding_stage: FundingStage;
  funding_target: number;
  tags: string[];
  skills: string[];
  demo_url: string;
  website_url: string;
  contact_email: string;
  contact_phone: string;
  social_links: Record<string, string>;
  
  // 协作偏好相关字段
  location_type: 'physical' | 'remote' | 'hybrid';
  collaboration_mode: 'local_only' | 'remote_friendly' | 'location_flexible';
  max_collaboration_distance: number;
  meeting_preference: 'online' | 'offline' | 'both';
  timezone_flexibility: boolean;
  collaboration_description: string;
  location_visibility: 'public' | 'city_only' | 'hidden';
  show_exact_address: boolean;
  allow_contact_for_meetup: boolean;
  service_area_type: 'local' | 'regional' | 'national' | 'global';
  target_regions: string[];
  service_area_description: string;
}

const EditProject: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [locationChanged, setLocationChanged] = useState(false);

  const [formData, setFormData] = useState<EditProjectFormData>({
    title: '',
    description: '',
    content: '',
    type: 'startup',
    category: 'technology',
    stage: 'idea',
    status: 'active',
    location: '',
    city: '',
    province: '',
    max_team_size: 5,
    seeking_roles: [],
    funding_stage: 'pre-seed',
    funding_target: 0,
    tags: [],
    skills: [],
    demo_url: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    social_links: {},
    
    // 协作偏好默认值
    location_type: DEFAULT_LOCATION_SETTINGS.type,
    collaboration_mode: DEFAULT_COLLABORATION_PREFERENCE.mode,
    max_collaboration_distance: DEFAULT_COLLABORATION_PREFERENCE.maxDistance || 50,
    meeting_preference: DEFAULT_COLLABORATION_PREFERENCE.meetingPreference,
    timezone_flexibility: DEFAULT_COLLABORATION_PREFERENCE.timeZoneFlexibility,
    collaboration_description: '',
    location_visibility: DEFAULT_LOCATION_SETTINGS.visibility,
    show_exact_address: DEFAULT_LOCATION_SETTINGS.showExactAddress,
    allow_contact_for_meetup: DEFAULT_LOCATION_SETTINGS.allowContactForMeetup,
    service_area_type: DEFAULT_SERVICE_AREA.type,
    target_regions: [],
    service_area_description: ''
  });

  // 加载项目数据
  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      try {
        const { project, error } = await ProjectService.getProject(id);
        
        if (error || !project) {
          alert('项目不存在或加载失败');
          navigate('/projects');
          return;
        }

        // 检查用户权限
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || project.founder_id !== user.id) {
          alert('您没有权限编辑此项目');
          navigate(`/project/${id}`);
          return;
        }

        setProject(project);
        
        // 填充表单数据
        setFormData({
          title: project.title || '',
          description: project.description || '',
          content: project.content || '',
          type: (project.type as ProjectType) || 'startup',
          category: (project.category as ProjectCategory) || 'technology',
          stage: (project.stage as ProjectStage) || 'idea',
          status: (project.status as ProjectStatus) || 'active',
          location: project.location || '',
          city: project.city || '',
          province: project.province || '',
          max_team_size: project.max_team_size || 5,
          seeking_roles: project.seeking_roles || [],
          funding_stage: (project.funding_stage as FundingStage) || 'pre-seed',
          funding_target: project.funding_target || 0,
          tags: project.tags || [],
          skills: project.skills || [],
          demo_url: project.demo_url || '',
          website_url: project.website_url || '',
          contact_email: project.contact_email || '',
          contact_phone: project.contact_phone || '',
          social_links: (project.social_links as Record<string, string>) || {},
          
          // 协作偏好数据（从扩展字段获取或使用默认值）
          location_type: (project as any).location_type || DEFAULT_LOCATION_SETTINGS.type,
          collaboration_mode: (project as any).collaboration_mode || DEFAULT_COLLABORATION_PREFERENCE.mode,
          max_collaboration_distance: (project as any).max_collaboration_distance || DEFAULT_COLLABORATION_PREFERENCE.maxDistance || 50,
          meeting_preference: (project as any).meeting_preference || DEFAULT_COLLABORATION_PREFERENCE.meetingPreference,
          timezone_flexibility: (project as any).timezone_flexibility ?? DEFAULT_COLLABORATION_PREFERENCE.timeZoneFlexibility,
          collaboration_description: (project as any).collaboration_description || '',
          location_visibility: (project as any).location_visibility || DEFAULT_LOCATION_SETTINGS.visibility,
          show_exact_address: (project as any).show_exact_address ?? DEFAULT_LOCATION_SETTINGS.showExactAddress,
          allow_contact_for_meetup: (project as any).allow_contact_for_meetup ?? DEFAULT_LOCATION_SETTINGS.allowContactForMeetup,
          service_area_type: (project as any).service_area_type || DEFAULT_SERVICE_AREA.type,
          target_regions: (project as any).target_regions || [],
          service_area_description: (project as any).service_area_description || ''
        });

        // 设置当前位置
        if (project.latitude && project.longitude) {
          setSelectedLocation({
            latitude: project.latitude,
            longitude: project.longitude
          });
        }

      } catch (error) {
        console.error('加载项目失败:', error);
        alert('项目加载失败');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  // 验证协作偏好设置
  const validateCollaborationSettings = () => {
    const collaborationPreference: CollaborationPreference = {
      mode: formData.collaboration_mode,
      maxDistance: formData.max_collaboration_distance,
      meetingPreference: formData.meeting_preference,
      timeZoneFlexibility: formData.timezone_flexibility,
      description: formData.collaboration_description
    };

    const locationSettings: LocationSettings = {
      type: formData.location_type,
      visibility: formData.location_visibility,
      showExactAddress: formData.show_exact_address,
      allowContactForMeetup: formData.allow_contact_for_meetup
    };

    const serviceArea: ServiceArea = {
      type: formData.service_area_type,
      targetRegions: formData.target_regions,
      description: formData.service_area_description
    };

    const validationResult = CollaborationValidation.validateProjectCollaborationSettings({
      collaborationPreference,
      locationSettings,
      serviceArea,
      location: selectedLocation || undefined
    });

    setValidationErrors(validationResult.errors);
    setValidationWarnings(validationResult.warnings);
  };

  // 处理表单字段变化
  const handleInputChange = (field: keyof EditProjectFormData, value: any) => {
    setFormData((prev: EditProjectFormData) => ({ ...prev, [field]: value }));
    
    // 实时验证协作偏好设置
    if (['collaboration_mode', 'location_type', 'meeting_preference', 'max_collaboration_distance'].includes(field)) {
      setTimeout(validateCollaborationSettings, 100);
    }
  };

  // 处理地址变化
  const handleAddressChange = (address: string, location?: GeoLocation) => {
    handleInputChange('location', address);
    if (location) {
      setSelectedLocation(location);
      setLocationChanged(true);
    }
  };

  // 处理位置类型变化
  const handleLocationTypeChange = (type: 'physical' | 'remote' | 'hybrid') => {
    handleInputChange('location_type', type);
    setLocationChanged(true);
    
    // 根据位置类型调整其他设置
    if (type === 'remote') {
      handleInputChange('collaboration_mode', 'remote_friendly');
      handleInputChange('show_exact_address', false);
    } else if (type === 'physical') {
      handleInputChange('collaboration_mode', 'local_only');
    }
  };

  // 清除位置信息
  const clearLocation = () => {
    handleInputChange('location', '');
    handleInputChange('city', '');
    handleInputChange('province', '');
    setSelectedLocation(null);
    setLocationChanged(true);
  };

  // 保存项目
  const handleSave = async () => {
    if (saving) return;

    // 基础验证
    if (!formData.title.trim()) {
      alert('请输入项目名称');
      return;
    }

    if (!formData.description.trim()) {
      alert('请输入项目描述');
      return;
    }

    // 协作偏好验证
    validateCollaborationSettings();
    if (validationErrors.length > 0) {
      alert('请修正协作偏好设置中的错误后再保存');
      return;
    }

    setSaving(true);

    try {
      const updateData: UpdateProjectData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        type: formData.type,
        category: formData.category,
        stage: formData.stage,
        location: formData.location,
        city: formData.city,
        province: formData.province,
        max_team_size: formData.max_team_size,
        seeking_roles: formData.seeking_roles,
        skills: formData.skills,
        tags: formData.tags,
        funding_stage: formData.funding_stage,
        funding_target: formData.funding_target,
        demo_url: formData.demo_url || undefined,
        website_url: formData.website_url || undefined,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || undefined,
        social_links: formData.social_links,
        
        // 协作偏好相关数据
        location_type: formData.location_type,
        collaboration_mode: formData.collaboration_mode,
        max_collaboration_distance: formData.max_collaboration_distance,
        meeting_preference: formData.meeting_preference,
        timezone_flexibility: formData.timezone_flexibility,
        collaboration_description: formData.collaboration_description,
        location_visibility: formData.location_visibility,
        show_exact_address: formData.show_exact_address,
        allow_contact_for_meetup: formData.allow_contact_for_meetup,
        service_area_type: formData.service_area_type,
        target_regions: formData.target_regions,
        service_area_description: formData.service_area_description
      };

      const { error } = await ProjectService.updateProject(id!, updateData);

      if (error) {
        alert('项目更新失败: ' + (error.message || '未知错误'));
        return;
      }

      alert('项目更新成功！');
      navigate(`/project/${id}`);

    } catch (error) {
      console.error('项目更新异常:', error);
      alert('项目更新失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 初始化时进行验证
  useEffect(() => {
    if (!loading) {
      validateCollaborationSettings();
    }
  }, [formData.collaboration_mode, formData.location_type, formData.meeting_preference, 
      formData.max_collaboration_distance, formData.timezone_flexibility, 
      formData.location_visibility, formData.show_exact_address, 
      formData.allow_contact_for_meetup, selectedLocation, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <div className="text-gray-600">加载项目信息中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              返回项目详情
            </button>
            <h1 className="text-2xl font-bold text-gray-900">编辑项目</h1>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={clearLocation}
              className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
            >
              清除位置
            </button>
            <button
              onClick={handleSave}
              disabled={saving || validationErrors.length > 0}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </div>

        {/* 位置变更提示 */}
        {locationChanged && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-800">位置信息已修改</div>
                <div className="text-sm text-blue-700 mt-1">
                  位置变更可能会影响项目的协作匹配结果。保存后，系统将重新进行地理编码和匹配分析。
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* 基本信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary-500" />
              基本信息
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  className="input"
                  placeholder="项目名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  className="input min-h-[120px]"
                  placeholder="项目描述"
                />
              </div>
            </div>
          </div>

          {/* 地理位置与协作偏好 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-500" />
              地理位置与协作偏好
            </h3>

            <div className="space-y-6">
              <CollaborationAddressInput
                value={formData.location}
                onChange={handleAddressChange}
                locationType={formData.location_type}
                onLocationTypeChange={handleLocationTypeChange}
                city={formData.city}
                showCoworkingSpaces={true}
                onLocationSelect={(location: any) => {
                  if (location.location) {
                    setSelectedLocation(location.location);
                    setLocationChanged(true);
                  }
                }}
              />

              {/* 协作模式设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  协作偏好设置
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      协作模式
                    </label>
                    <select
                      value={formData.collaboration_mode}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('collaboration_mode', e.target.value)}
                      className="input"
                    >
                      <option value="local_only">仅限本地协作</option>
                      <option value="remote_friendly">远程友好</option>
                      <option value="location_flexible">位置灵活</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会议偏好
                    </label>
                    <select
                      value={formData.meeting_preference}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('meeting_preference', e.target.value)}
                      className="input"
                    >
                      <option value="both">线上线下都可以</option>
                      <option value="online">仅线上会议</option>
                      <option value="offline">仅线下会议</option>
                    </select>
                  </div>

                  {formData.collaboration_mode !== 'remote_friendly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大协作距离 (公里)
                      </label>
                      <input
                        type="number"
                        value={formData.max_collaboration_distance}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('max_collaboration_distance', parseInt(e.target.value))}
                        className="input"
                        min="1"
                        max="500"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.timezone_flexibility}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('timezone_flexibility', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">接受跨时区协作</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 位置可见性设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary-500" />
              位置可见性设置
            </h3>

            <LocationVisibilitySettings
              visibility={formData.location_visibility}
              onVisibilityChange={(visibility: any) => handleInputChange('location_visibility', visibility)}
              showExactAddress={formData.show_exact_address}
              onShowExactAddressChange={(show: boolean) => handleInputChange('show_exact_address', show)}
              allowContactForMeetup={formData.allow_contact_for_meetup}
              onAllowContactForMeetupChange={(allow: boolean) => handleInputChange('allow_contact_for_meetup', allow)}
              locationType={formData.location_type}
            />
          </div>

          {/* 地理位置确认 */}
          {selectedLocation && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm font-medium text-green-800 mb-2">当前地理位置</div>
              <div className="text-sm text-green-700">
                <div>地址：{formData.location}</div>
                <div className="mt-1">
                  坐标：{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </div>
                {locationChanged && (
                  <div className="mt-2 text-xs">
                    ⚠️ 位置信息已修改，保存后将重新进行地理编码
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 验证错误和警告 */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm font-medium text-red-800 mb-2">设置错误</div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="text-sm font-medium text-yellow-800 mb-2">设置建议</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validationWarnings.map((warning: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProject;