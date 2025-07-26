import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, MapPin, Users, DollarSign, Target, Settings } from 'lucide-react';
import { ProjectType, ProjectStage, FundingStage, ProjectStatus, ProjectCategory } from '../../types/project.types';
import { ProjectService, CreateProjectData } from '../../services/project.service';
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

interface ProjectFormData {
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

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
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

  const [images, setImages] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // 初始化时进行验证
  useEffect(() => {
    validateCollaborationSettings();
  }, [formData.collaboration_mode, formData.location_type, formData.meeting_preference, 
      formData.max_collaboration_distance, formData.timezone_flexibility, 
      formData.location_visibility, formData.show_exact_address, 
      formData.allow_contact_for_meetup, selectedLocation]);

  const projectTypes = [
    { value: 'startup', label: '创业项目', description: '商业化创业项目' },
    { value: 'tech', label: '技术项目', description: '技术驱动的创新项目' },
    { value: 'social', label: '社会公益', description: '解决社会问题的项目' },
    { value: 'culture', label: '文化创意', description: '文化艺术相关项目' },
    { value: 'education', label: '教育培训', description: '教育相关的创新项目' },
    { value: 'health', label: '医疗健康', description: '健康医疗相关项目' },
    { value: 'environment', label: '环保绿色', description: '环境保护相关项目' },
    { value: 'other', label: '其他', description: '其他类型项目' }
  ];

  const projectCategories = [
    { value: 'technology', label: '技术开发', description: '软件、硬件、AI等技术项目' },
    { value: 'business', label: '商业模式', description: '商业创新、服务模式等' },
    { value: 'design', label: '设计创意', description: 'UI/UX、平面设计、产品设计' },
    { value: 'marketing', label: '市场营销', description: '品牌推广、数字营销等' },
    { value: 'finance', label: '金融科技', description: '金融服务、支付、投资等' },
    { value: 'education', label: '教育培训', description: '在线教育、技能培训等' },
    { value: 'health', label: '医疗健康', description: '医疗服务、健康管理等' },
    { value: 'social', label: '社会公益', description: '公益项目、社会创新等' },
    { value: 'environment', label: '环保绿色', description: '环境保护、可持续发展' },
    { value: 'other', label: '其他', description: '其他类别项目' }
  ];

  const projectStages = [
    { value: 'idea', label: '创意阶段', description: '项目还在构思和验证阶段' },
    { value: 'mvp', label: 'MVP阶段', description: '已有最小可行产品' },
    { value: 'growth', label: '成长阶段', description: '产品已上线，正在扩展' },
    { value: 'expansion', label: '扩张阶段', description: '业务快速发展，寻求扩张' }
  ];

  const fundingStages = [
    { value: 'pre-seed', label: '种子前期', description: '0-50万' },
    { value: 'seed', label: '种子轮', description: '50-200万' },
    { value: 'angel', label: '天使轮', description: '200-500万' },
    { value: 'series-a', label: 'A轮', description: '500-2000万' },
    { value: 'series-b', label: 'B轮', description: '2000万+' }
  ];

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 实时验证协作偏好设置
    if (['collaboration_mode', 'location_type', 'meeting_preference', 'max_collaboration_distance'].includes(field)) {
      validateCollaborationSettings();
    }
  };

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

  // 处理地址变化
  const handleAddressChange = (address: string, location?: GeoLocation) => {
    handleInputChange('location', address);
    if (location) {
      setSelectedLocation(location);
    }
  };

  // 处理位置类型变化
  const handleLocationTypeChange = (type: 'physical' | 'remote' | 'hybrid') => {
    handleInputChange('location_type', type);
    
    // 根据位置类型调整其他设置
    if (type === 'remote') {
      handleInputChange('collaboration_mode', 'remote_friendly');
      handleInputChange('show_exact_address', false);
    } else if (type === 'physical') {
      handleInputChange('collaboration_mode', 'local_only');
    }
  };

  const addItem = (field: 'seeking_roles' | 'tags' | 'skills', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      handleInputChange(field, [...formData[field], value.trim()]);
    }
  };

  const removeItem = (field: 'seeking_roles' | 'tags' | 'skills', index: number) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    handleInputChange(field, newArray);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 这里应该上传到云存储，现在只是模拟
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 添加认证检查函数
  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // 基础表单验证
    if (!formData.title.trim()) {
      alert('请输入项目名称');
      return;
    }

    if (!formData.description.trim()) {
      alert('请输入项目描述');
      return;
    }

    if (!formData.contact_email.trim()) {
      alert('请输入联系邮箱');
      return;
    }

    // 协作偏好验证
    if (formData.location_type === 'physical' && !formData.location.trim()) {
      alert('实体办公项目需要设置具体地址');
      return;
    }

    if (formData.collaboration_mode === 'local_only' && formData.max_collaboration_distance > 200) {
      alert('本地协作模式下，协作距离不应超过200公里');
      return;
    }

    // 最终验证协作偏好设置
    validateCollaborationSettings();
    if (validationErrors.length > 0) {
      alert('请修正协作偏好设置中的错误后再提交');
      return;
    }

    setIsSubmitting(true);

    try {
      // 首先检查用户认证状态
      const { user, error: authError } = await checkAuth();

      if (authError || !user) {
        alert('请先登录后再创建项目');
        setIsSubmitting(false);
        navigate('/login');
        return;
      }

      // 准备项目数据
      const projectData: CreateProjectData = {
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
        images,
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

      const { project, error } = await ProjectService.createProject(projectData);

      if (error) {
        let errorMessage = '项目发布失败: ';

        if (error.message) {
          errorMessage += error.message;
        } else if (error.code) {
          errorMessage += `错误代码: ${error.code}`;
        } else {
          errorMessage += '未知错误';
        }

        alert(errorMessage);
        setIsSubmitting(false);
        return;
      }

      if (project) {
        // 显示成功消息
        const successMessage = `项目"${project.title}"发布成功！正在跳转到项目列表...`;
        alert(successMessage);

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          navigate('/projects');
        }, 1000);
      } else {
        alert('项目发布可能失败，请检查项目列表');
        setIsSubmitting(false);
      }
    } catch (error) {
      alert('项目发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-500'
            }`}>
            {step}
          </div>
          {step < 5 && (
            <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
              }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
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
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="input"
              placeholder="给你的项目起个响亮的名字"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目描述 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input min-h-[120px]"
              placeholder="简要描述你的项目核心价值和目标"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细内容
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="input min-h-[200px]"
              placeholder="详细描述你的项目，包括解决的问题、目标用户、技术方案、商业模式等"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目类型 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {projectTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleInputChange('type', type.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.type === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目分类 *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectCategories.map((category) => (
                <div
                  key={category.value}
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.category === category.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-sm">{category.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目阶段 *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectStages.map((stage) => (
                <div
                  key={stage.value}
                  onClick={() => handleInputChange('stage', stage.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.stage === stage.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-sm">{stage.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-500" />
          地理位置与协作偏好
        </h3>

        {/* 协作导向的地址输入组件 */}
        <div className="space-y-6">
          <CollaborationAddressInput
            value={formData.location}
            onChange={handleAddressChange}
            locationType={formData.location_type}
            onLocationTypeChange={handleLocationTypeChange}
            city={formData.city}
            showCoworkingSpaces={true}
            onLocationSelect={(location) => {
              if (location.location) {
                setSelectedLocation(location.location);
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
                  onChange={(e) => handleInputChange('collaboration_mode', e.target.value)}
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
                  onChange={(e) => handleInputChange('meeting_preference', e.target.value)}
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
                    onChange={(e) => handleInputChange('max_collaboration_distance', parseInt(e.target.value))}
                    className="input"
                    min="1"
                    max="500"
                    placeholder="50"
                  />
                </div>
              )}

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.timezone_flexibility}
                    onChange={(e) => handleInputChange('timezone_flexibility', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">接受跨时区协作</span>
                </label>
              </div>
            </div>

            {/* 协作描述 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                协作偏好说明 (可选)
              </label>
              <textarea
                value={formData.collaboration_description}
                onChange={(e) => handleInputChange('collaboration_description', e.target.value)}
                className="input min-h-[80px]"
                placeholder="描述您的协作偏好，如工作时间、沟通方式等..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.collaboration_description.length}/500
              </div>
            </div>
          </div>

          {/* 服务区域设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              项目服务区域
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服务范围
                </label>
                <select
                  value={formData.service_area_type}
                  onChange={(e) => handleInputChange('service_area_type', e.target.value)}
                  className="input"
                >
                  <option value="local">本地服务</option>
                  <option value="regional">区域服务</option>
                  <option value="national">全国服务</option>
                  <option value="global">全球服务</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标区域 (可选)
                </label>
                <input
                  type="text"
                  value={formData.target_regions.join(', ')}
                  onChange={(e) => handleInputChange('target_regions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="input"
                  placeholder="如：北京, 上海, 深圳"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                服务区域说明 (可选)
              </label>
              <textarea
                value={formData.service_area_description}
                onChange={(e) => handleInputChange('service_area_description', e.target.value)}
                className="input min-h-[60px]"
                placeholder="描述您的服务区域和覆盖范围..."
                maxLength={300}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary-500" />
          团队信息
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              团队规模上限
            </label>
            <input
              type="number"
              value={formData.max_team_size}
              onChange={(e) => handleInputChange('max_team_size', parseInt(e.target.value))}
              className="input"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招募角色
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="input flex-1"
                placeholder="如：前端开发工程师"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('seeking_roles', newRole);
                    setNewRole('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addItem('seeking_roles', newRole);
                  setNewRole('');
                }}
                className="btn btn-outline"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.seeking_roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeItem('seeking_roles', index)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所需技能
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input flex-1"
                placeholder="如：React, Node.js, Python"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('skills', newSkill);
                    setNewSkill('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addItem('skills', newSkill);
                  setNewSkill('');
                }}
                className="btn btn-outline"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeItem('skills', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary-500" />
          位置可见性与隐私设置
        </h3>

        <LocationVisibilitySettings
          visibility={formData.location_visibility}
          onVisibilityChange={(visibility) => handleInputChange('location_visibility', visibility)}
          showExactAddress={formData.show_exact_address}
          onShowExactAddressChange={(show) => handleInputChange('show_exact_address', show)}
          allowContactForMeetup={formData.allow_contact_for_meetup}
          onAllowContactForMeetupChange={(allow) => handleInputChange('allow_contact_for_meetup', allow)}
          locationType={formData.location_type}
        />

        {/* 协作偏好预览 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm font-medium text-blue-800 mb-3">协作偏好预览</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">位置类型：</span>
              <span className="text-blue-600">
                {formData.location_type === 'physical' ? '实体办公' : 
                 formData.location_type === 'remote' ? '远程办公' : '混合模式'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-700">协作模式：</span>
              <span className="text-blue-600">
                {formData.collaboration_mode === 'local_only' ? '仅限本地' : 
                 formData.collaboration_mode === 'remote_friendly' ? '远程友好' : '位置灵活'}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-700">会议偏好：</span>
              <span className="text-blue-600">
                {formData.meeting_preference === 'online' ? '仅线上' : 
                 formData.meeting_preference === 'offline' ? '仅线下' : '线上线下都可以'}
              </span>
            </div>
            {formData.collaboration_mode !== 'remote_friendly' && (
              <div>
                <span className="font-medium text-blue-700">协作距离：</span>
                <span className="text-blue-600">{formData.max_collaboration_distance}公里</span>
              </div>
            )}
            <div>
              <span className="font-medium text-blue-700">跨时区协作：</span>
              <span className="text-blue-600">{formData.timezone_flexibility ? '接受' : '不接受'}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">位置可见性：</span>
              <span className="text-blue-600">
                {formData.location_visibility === 'public' ? '公开显示' : 
                 formData.location_visibility === 'city_only' ? '仅显示城市' : '完全隐藏'}
              </span>
            </div>
          </div>
          {formData.collaboration_description && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="font-medium text-blue-700">协作说明：</span>
              <p className="text-blue-600 mt-1">{formData.collaboration_description}</p>
            </div>
          )}
        </div>

        {/* 地理位置确认 */}
        {selectedLocation && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm font-medium text-green-800 mb-2">地理位置确认</div>
            <div className="text-sm text-green-700">
              <div>地址：{formData.location}</div>
              <div className="mt-1">
                坐标：{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </div>
              <div className="mt-2 text-xs">
                ✓ 地理位置已确认，将用于项目定位和协作匹配
              </div>
            </div>
          </div>
        )}

        {/* 验证错误和警告 */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm font-medium text-red-800 mb-2">设置错误</div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
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
              {validationWarnings.map((warning, index) => (
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
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-primary-500" />
          融资信息
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              融资阶段
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fundingStages.map((stage) => (
                <div
                  key={stage.value}
                  onClick={() => handleInputChange('funding_stage', stage.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.funding_stage === stage.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-sm">{stage.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                融资金额 (万元)
              </label>
              <input
                type="number"
                value={formData.funding_target}
                onChange={(e) => handleInputChange('funding_target', parseFloat(e.target.value))}
                className="input"
                placeholder="0"
                min="0"
              />
            </div>


          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="input flex-1"
                placeholder="如：人工智能、区块链、移动应用"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('tags', newTag);
                    setNewTag('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addItem('tags', newTag);
                  setNewTag('');
                }}
                className="btn btn-outline"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeItem('tags', index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-primary-500" />
          媒体资源与联系方式
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目图片
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击上传项目图片</p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image: string, index: number) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`项目图片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                演示地址
              </label>
              <input
                type="url"
                value={formData.demo_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('demo_url', e.target.value)}
                className="input"
                placeholder="https://demo.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目官网
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website_url', e.target.value)}
                className="input"
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub 地址
            </label>
            <input
              type="url"
              value={formData.social_links.github || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('social_links', { ...formData.social_links, github: e.target.value })}
              className="input"
              placeholder="https://github.com/username/project"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系邮箱 *
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contact_email', e.target.value)}
                className="input"
                placeholder="contact@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contact_phone', e.target.value)}
                className="input"
                placeholder="13800138000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 头部 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回项目列表
          </button>
          <h1 className="text-2xl font-bold text-gray-900">发布新项目</h1>
        </div>

        {/* 步骤指示器 */}
        {renderStepIndicator()}

        {/* 表单内容 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* 导航按钮 */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一步
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={validationErrors.length > 0}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || validationErrors.length > 0}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '发布中...' : '发布项目'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;