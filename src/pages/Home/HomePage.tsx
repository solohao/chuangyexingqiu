import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from '../../components/specialized/MapComponent';
// import FilterPanel from '../../components/common/FilterPanel';
import ViewToggleFilterPanel from '../../components/common/ViewToggleFilterPanel';
import ProjectCard from '../../components/specialized/ProjectCard';
import Header from '../../components/layout/Header';
import { Briefcase, User, MapPin, Bot, Users, Wrench, Code } from 'lucide-react';

const mockProjects = [
  { id: '1', title: '智能家居控制APP', type: 'tech', founder: '张三', location: '北京朝阳', position: [116.407526, 39.90403] as [number, number], seeking: '后端开发', image: '/images/projects/smart-home.jpg', description: '一款智能家居控制APP，可以远程控制家中的各种智能设备，包括灯光、温度、安防等系统。', createdAt: '2023-05-15'},
  { id: '2', title: '环保回收站', type: 'environment', founder: '李四', location: '上海浦东', position: [121.5, 31.23] as [number, number], seeking: '市场营销', image: '/images/projects/recycling.jpg', description: '通过智能分类和回收系统，提高城市垃圾回收效率，减少环境污染。', createdAt: '2023-06-20'},
  { id: '3', title: '在线教育平台', type: 'education', founder: '王五', location: '广州天河', position: [113.3, 23.1] as [number, number], seeking: '产品经理', image: '/images/projects/education.jpg', description: '专注于K12在线教育，提供个性化学习体验和智能学习辅导系统。', createdAt: '2023-04-10'},
  { id: '4', title: '共享充电宝', type: 'tech', founder: '赵六', location: '深圳南山', position: [114.05, 22.55] as [number, number], seeking: '硬件工程师', image: '/images/projects/charger.jpg', description: '通过共享经济模式，解决用户外出充电需求，覆盖商场、餐厅等公共场所。', createdAt: '2023-07-05'},
  { id: '5', title: '健康饮食配送', type: 'health', founder: '钱七', location: '成都武侯', position: [104.06, 30.67] as [number, number], seeking: '营养师', image: '/images/projects/food.jpg', description: '根据用户健康需求，提供定制化的健康餐饮配送服务，包括减脂、增肌等不同方案。', createdAt: '2023-03-28'},
];

const hotProjects = mockProjects.slice(0, 3);

const HomePage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  // const [stats] = useState({ totalProjects: 1234, onlineUsers: 156, weeklyNew: 45 });
  const [filters, setFilters] = useState({ projectType: '', teamSize: '', fundingStage: '' });
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');

  const handleMarkerClick = (project: any) => setSelectedProject(project);
  const handleFilterChange = (filterType: string, value: string) => setFilters(prev => ({ ...prev, [filterType]: value }));
  const handleRefresh = () => console.log('刷新地图数据');
  const handleLocateMe = () => console.log('定位到我的位置');
  const handleViewModeChange = (mode: 'map' | 'grid') => setViewMode(mode);

  // 根据筛选条件过滤项目
  const filteredProjects = mockProjects.filter(project => {
    if (filters.projectType && project.type !== filters.projectType) return false;
    // 可以添加更多筛选条件
    return true;
  });

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
                  <h3 className="font-semibold text-gray-800">技能市场</h3>
                </div>
                <p className="text-sm text-gray-600">发布技能，寻找专业人才</p>
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
              {hotProjects.map((project) => (
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
                      <span>{project.location}</span>
                    </div>
                  </a>
                </li>
              ))}
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
                hoveredProjectId={hoveredProjectId}
              />
            </div>
            
            {/* 列表视图 */}
            <div className={`grid-view ${viewMode === 'grid' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
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
                <img src={selectedProject.image} alt={selectedProject.title} className="w-20 h-20 rounded-lg object-cover"/>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900">{selectedProject.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <User className="w-4 h-4 mr-2" /> <span>{selectedProject.founder}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Briefcase className="w-4 h-4 mr-2" /> <span>寻找: {selectedProject.seeking}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Link to={`/project/${selectedProject.id}`} className="btn btn-primary flex-1">
                  查看详情
                </Link>
                <button className="btn btn-secondary flex-1 ml-2">
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
