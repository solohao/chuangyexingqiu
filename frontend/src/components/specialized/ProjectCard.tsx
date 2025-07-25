import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, MapPin, Calendar } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  type: string;
  founder: string;
  location: string;
  position: [number, number];
  seeking: string;
  image: string;
  // 可以添加更多属性
  description?: string;
  createdAt?: string;
}

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const { id, title, founder, location, seeking, image, description, createdAt, type } = project;

  // 项目类型对应的颜色
  const typeColors: Record<string, string> = {
    tech: 'bg-blue-100 text-blue-800',
    social: 'bg-green-100 text-green-800',
    environment: 'bg-emerald-100 text-emerald-800',
    education: 'bg-purple-100 text-purple-800',
    health: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const typeColor = typeColors[type] || typeColors.default;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-1/3">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-2/3 p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}>
              {type === 'tech' ? '科技' : 
               type === 'social' ? '社会企业' : 
               type === 'environment' ? '环保' : 
               type === 'education' ? '教育' : 
               type === 'health' ? '健康' : type}
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex flex-col space-y-1 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span>{founder}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
              <span>寻找: {seeking}</span>
            </div>
            {createdAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{createdAt}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex justify-end">
            <Link 
              to={`/project/${id}`} 
              className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              查看详情
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
