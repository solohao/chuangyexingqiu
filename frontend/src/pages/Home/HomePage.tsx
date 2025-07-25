import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../../components/specialized/MapComponent';
import ViewToggleFilterPanel from '../../components/common/ViewToggleFilterPanel';
import ProjectCard from '../../components/specialized/ProjectCard';
import Header from '../../components/layout/Header';
import { ProjectService, ProjectFilters } from '../../services/project.service';
import { ProjectWithLocation, GeoLocation, GeoBounds } from '../../types/geolocation.types';
import { Briefcase, User, MapPin, Bot, Users, Wrench, Code } from 'lucide-react';

// 将数据库项目转换为ProjectWithLocation格式
const convertToProjectWithLocation = (project: any): ProjectWithLocation => {
  // 确保基本字段存在
  if (!project || !project.id) {
    console.warn('Invalid project data:', project);
    return null as any;
  }

  return {
    ...project,
    // 确保基本字段有默认值
    title: project.title || '未命名项目',
    description: project.description || '',
    type: project.type || 'other',
    category: project.category || 'other',
    stage: project.stage || 'idea',
    status: project.status || 'active',
    founder_name: project.founder_name || '未知创始人',
    created_at: project.created_at || new Date().toISOString(),
    updated_at: project.updated_at || new Date().toISOString(),
    
    geolocation: project.latitude && project.longitude ? {
      id: `geo_${project.id}`,
      projectId: project.id,
      location: {
        latitude: Number(project.latitude),
        longitude: Number(project.longitude)
      },
      address: project.location || '',
      formattedAddress: project.location || '',
      components: {
        country: project.country || '中国',
        province: project.province || '',
        city: project.city || '',
        district: '',
        street: '',
        streetNumber: '',
        postalCode: ''
      },
      locationSettings: {
        type: project.location_type || 'hybrid',
        visibility: project.location_visibility || 'city_only',
        showExactAddress: project.show_exact_address ?? false,
        allowContactForMeetup: project.allow_contact_for_meetup ?? true
      },
      collaborationPreference: {
        mode: project.collaboration_mode || 'location_flexible',
        maxDistance: project.max_collaboration_distance || 50,
        meetingPreference: project.meeting_preference || 'both',
        timeZoneFlexibility: project.timezone_flexibility ?? true,
        description: project.collaboration_description || ''
      },
      serviceArea: {
        type: project.service_area_type || 'regional',
        targetRegions: Array.isArray(project.target_regions) ? project.target_regions : [],
        description: project.service_area_description || ''
      },
      accuracy: 'medium',
      source: 'user_input',
      lastVerified: project.updated_at || project.created_at || new Date().toISOString(),
      createdAt: project.created_at || new Date().toISOString(),
      updatedAt: project.updated_at || new Date().toISOString()
    } : undefined
  };
};

const HomePage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectWithLocation | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectWithLocation[]>([]);
  const [hotProjects, setHotProjects] = useState<ProjectWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);

  const [filters, setFilters] = useState({ projectType: '', teamSize: '', fundingStage: '' });
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  // 加载项目数据
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const projectFilters: ProjectFilters = {
          is_published: true,
          ...(filters.projectType && filters.projectType !== 'all' ? { type: filters.projectType } : {}),
          ...(filters.fundingStage && filters.fundingStage !== 'all' ? { funding_stage: filters.fundingStage } : {})
        };

        const { projects: rawProjects, error } = await ProjectService.getProjects(
          projectFilters,
          { field: 'created_at', ascending: false },
          1,
          100 // 加载更多项目用于地图显示
        );

        if (error) {
          console.error('加载项目失败:', error);
          setProjects([]); // 设置空数组避免undefined错误
          return;
        }

        if (!Array.isArray(rawProjects)) {
          console.error('项目数据格式错误:', rawProjects);
          setProjects([]);
          return;
        }

        // 转换为ProjectWithLocation格式，过滤掉无效项目
        const projectsWithLocation = rawProjects
          .map(convertToProjectWithLocation)
          .filter(project => project && project.id); // 过滤掉转换失败的项目
        setProjects(projectsWithLocation);
        
        // 设置热门项目（取前3个有位置信息的项目）
        const projectsWithGeo = projectsWithLocation.filter(p => p.geolocation?.location);
        setHotProjects(projectsWithGeo.slice(0, 3));

      } catch (error) {
        console.error('加载项目异常:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [filters.projectType, filters.fundingStage]);

  // 获取用户位置（仅在用户交互后）
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('获取用户位置失败:', error);
        }
      );
    }
  };

  const handleMarkerClick = (project: ProjectWithLocation) => setSelectedProject(project);
  const handleFilterChange = (filterType: string, value: string) => setFilters(prev => ({ ...prev, [filterType]: value }));
  const handleRefresh = () => {
    // 重新加载项目数据
    setFilters(prev => ({ ...prev }));
  };
  const handleLocateMe = () => {
    requestUserLocation();
  };
  const handleViewModeChange = (mode: 'map' | 'grid') => setViewMode(mode);
  const handleMapBoundsChange = (bounds: GeoBounds) => {
    // Handle map bounds change if needed in the future
    // console.log('Map bounds changed:', bounds);
  };

  // 根据筛选条件过滤项目
  const filteredProjects = projects.filter((project: ProjectWithLocation) => {
    if (filters.projectType && filters.projectType !== 'all' && project.type !== filters.projectType) return false;
    if (filters.fundingStage && filters.fundingStage !== 'all' && project.funding_stage !== filters.fundingStage) return false;
    return true;
  });

  // 错误边界处理
  if (!projects) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-2">页面加载出错</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header /> {/* Assuming Header is imported and used in App.tsx or a layout component */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Link to="/projects" className="no-underline">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Briefcase className="w-5 h-5 mr-3 text-primary-600" />
                  <h3 className="font-semibold text-gray-800">创业项目</h3>
                </div>
                <p className="text-sm text-gray-600">发现优质创业项目，寻找合作伙伴</p>
              </div>
            </Link>
            
            <Link to="/agent" className="no-underline">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Bot className="w-5 h-5 mr-3 text-primary-600" />
                  <h3 className="font-semibold text-gray-800">创业Agent</h3>
                </div>
                <p className="text-sm text-gray-600">智能助手帮您解决创业问题</p>
              </div>
            </Link>
            
            <Link to="/maker-community" className="no-underline">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 mr-3 text-primary-600" />
                  <h3 className="font-semibold text-gray-800">创客之家</h3>
                </div>
                <p className="text-sm text-gray-600">连接创业者，分享经验，共同成长</p>
              </div>
            </Link>
            
            <Link to="/skills-market" className="no-underline">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Wrench className="w-5 h-5 mr-3 text-primary-600" />
                  <h3 className="font-semibold text-gray-800">大师工坊</h3>
                </div>
                <p className="text-sm text-gray-600">汇聚大师级人才，展示专业技能</p>
              </div>
            </Link>
            
            <Link to="/dev-center" className="no-underline">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center mb-3">
                  <Code className="w-5 h-5 mr-3 text-primary-600" />
                  <h3 className="font-semibold text-gray-800">开发中心</h3>
                </div>
                <p className="text-sm text-gray-600">发布功能需求，跟踪开发进度</p>
              </div>
            </Link>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">热门项目</h3>
            <ul className="space-y-1">
              {loading ? (
                <li className="p-2 text-sm text-gray-500">加载中...</li>
              ) : hotProjects.length > 0 ? (
                hotProjects.map((project: ProjectWithLocation) => (
                  <li 
                    key={project.id}
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    onClick={() => setSelectedProject(project)}
                    className="rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
                  >
                    <a className="block p-2">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-3 text-primary-600 flex-shrink-0" />
                        <p className="font-semibold text-sm text-gray-900 truncate">{project.title}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1.5 ml-7">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        <span>{project.city || project.location || '位置未知'}</span>
                      </div>
                    </a>
                  </li>
                ))
              ) : (
                <li className="p-2 text-sm text-gray-500">暂无热门项目</li>
              )}
            </ul>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-grow relative overflow-hidden">
          {/* 新的视图切换和筛选面板 */}
          <ViewToggleFilterPanel
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
            onLocateMe={handleLocateMe}
          />
          
          {/* 内容区域容器 - 确保一致的宽度和高度 */}
          <div className="view-container">
            {/* 地图视图 */}
            <div className={`map-view ${viewMode === 'map' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <MapComponent 
                projects={filteredProjects}
                onMarkerClick={handleMarkerClick}
                onMapBoundsChange={handleMapBoundsChange}
                hoveredProjectId={hoveredProjectId}
                clustering={true}
                highlightCompatibleProjects={true}
                userLocation={userLocation}
                loading={loading}
              />
            </div>
            
            {/* 列表视图 */}
            <div className={`grid-view ${viewMode === 'grid' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                      加载项目中...
                    </div>
                  ) : filteredProjects.length > 0 ? (
                    filteredProjects.map((project: ProjectWithLocation) => (
                      <ProjectCard 
                        key={project.id} 
                        project={{
                          id: project.id,
                          title: project.title,
                          type: project.type,
                          founder: project.founder_name || '未知创始人',
                          location: project.city || project.location || '位置未知',
                          position: project.latitude && project.longitude ? 
                            [project.longitude, project.latitude] as [number, number] : 
                            [116.397428, 39.90923] as [number, number],
                          seeking: (Array.isArray(project.seeking_roles) && project.seeking_roles.length > 0) ? project.seeking_roles[0] : '寻找合作伙伴',
                          image: project.cover_image_url || project.logo_url || '/images/projects/default.jpg',
                          description: project.description,
                          createdAt: project.created_at
                        }} 
                        onClick={() => setSelectedProject(project)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      没有找到符合条件的项目
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 地图视图下的项目详情弹窗 */}
          {viewMode === 'map' && selectedProject && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-sm transition-all duration-300 z-10">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900">{selectedProject.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <User className="w-4 h-4 mr-2" /> 
                    <span>{selectedProject.founder_name || '未知创始人'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-2" /> 
                    <span>{selectedProject.city || selectedProject.location || '位置未知'}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                    {selectedProject.description}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Link to={`/project/${selectedProject.id}`} className="btn btn-primary flex-1">
                  查看详情
                </Link>
                <button 
                  className="btn btn-secondary flex-1 ml-2"
                  onClick={() => {
                    // 这里可以添加联系创始人的逻辑
                    alert('联系功能开发中...');
                  }}
                >
                  联系创始人
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default HomePage;
