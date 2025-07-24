import React, { useState, useEffect } from 'react'
import MapComponent from '@/components/specialized/MapComponent'
import useMap from '@/hooks/useMap'
import { PROJECT_TYPE_COLORS } from '@/config/amap.config'

// 模拟项目数据
const mockProjects = [
  {
    id: '1',
    title: '智能家居科技',
    type: 'tech',
    description: '开发智能家居系统，提供便捷的家庭自动化解决方案。',
    position: [116.403694, 39.914935], // 北京天安门
    founder: '张三',
    foundedAt: '2023-01-15',
  },
  {
    id: '2',
    title: '环保回收站',
    type: 'environment',
    description: '城市垃圾分类回收系统，提高资源利用率。',
    position: [116.313794, 39.997743], // 北京海淀区
    founder: '李四',
    foundedAt: '2023-03-22',
  },
  {
    id: '3',
    title: '在线教育平台',
    type: 'education',
    description: '提供高质量的在线课程和教育资源。',
    position: [116.458962, 39.914041], // 北京朝阳区
    founder: '王五',
    foundedAt: '2023-02-10',
  },
  {
    id: '4',
    title: '社区医疗服务',
    type: 'health',
    description: '为社区提供便捷的医疗咨询和服务。',
    position: [116.364826, 39.855284], // 北京丰台区
    founder: '赵六',
    foundedAt: '2023-04-05',
  },
]

const MapView: React.FC = () => {
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const { addMarkers, clearMarkers, locateMarker } = useMap({ map: mapInstance })
  const [filterType, setFilterType] = useState<string>('all')

  // 处理地图加载完成
  const handleMapLoaded = (map: any) => {
    setMapInstance(map)
  }

  // 加载项目标记
  useEffect(() => {
    if (mapInstance) {
      clearMarkers()
      
      // 根据筛选条件过滤项目
      const filteredProjects = filterType === 'all' 
        ? mockProjects 
        : mockProjects.filter(project => project.type === filterType)
      
      // 转换为标记数据
      const markerData = filteredProjects.map(project => ({
        id: project.id,
        position: project.position as [number, number],
        title: project.title,
        type: project.type,
        extData: project,
      }))
      
      // 添加标记
      addMarkers(markerData)
    }
  }, [mapInstance, filterType, addMarkers, clearMarkers])

  // 处理项目点击
  const handleProjectClick = (project: any) => {
    setSelectedProject(project)
    locateMarker(project.id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">创业项目地图</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧筛选和项目列表 */}
        <div className="w-full md:w-1/3">
          <div className="card mb-4">
            <h2 className="text-xl font-semibold mb-4">项目筛选</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${filterType === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setFilterType('all')}
              >
                全部
              </button>
              {Object.entries(PROJECT_TYPE_COLORS).map(([type, color]) => (
                <button 
                  key={type}
                  className={`px-3 py-1 rounded-full text-sm ${filterType === type ? 'text-white' : 'bg-gray-200'}`}
                  style={{ backgroundColor: filterType === type ? color : undefined }}
                  onClick={() => setFilterType(type)}
                >
                  {getProjectTypeName(type)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">项目列表</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(filterType === 'all' ? mockProjects : mockProjects.filter(p => p.type === filterType)).map(project => (
                <div 
                  key={project.id} 
                  className={`p-3 rounded-lg cursor-pointer border-l-4 hover:bg-gray-50 ${selectedProject?.id === project.id ? 'bg-gray-50' : ''}`}
                  style={{ borderLeftColor: PROJECT_TYPE_COLORS[project.type as keyof typeof PROJECT_TYPE_COLORS] }}
                  onClick={() => handleProjectClick(project)}
                >
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-600">{getProjectTypeName(project.type)}</p>
                  <p className="text-sm text-gray-500 mt-1">创始人: {project.founder}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 右侧地图 */}
        <div className="w-full md:w-2/3">
          <MapComponent 
            onMapLoaded={handleMapLoaded}
            className="rounded-lg overflow-hidden shadow-lg"
            style={{ height: '600px' }}
          />
        </div>
      </div>
      
      {/* 选中项目详情 */}
      {selectedProject && (
        <div className="mt-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-2">{selectedProject.title}</h2>
            <div className="flex items-center mb-4">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: PROJECT_TYPE_COLORS[selectedProject.type as keyof typeof PROJECT_TYPE_COLORS] }}
              ></span>
              <span className="text-gray-600">{getProjectTypeName(selectedProject.type)}</span>
            </div>
            <p className="mb-4">{selectedProject.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">创始人:</span> {selectedProject.founder}
              </div>
              <div>
                <span className="text-gray-500">成立时间:</span> {selectedProject.foundedAt}
              </div>
            </div>
            <div className="mt-4">
              <button className="btn btn-primary">查看详情</button>
              <button className="btn ml-2 border border-gray-300 hover:bg-gray-100">联系创始人</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 获取项目类型名称
function getProjectTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    tech: '科技项目',
    social: '社会企业',
    culture: '文化创意',
    finance: '金融科技',
    education: '教育科技',
    health: '健康医疗',
    environment: '环保项目',
    other: '其他类型',
  }
  
  return typeNames[type] || type
}

export default MapView
