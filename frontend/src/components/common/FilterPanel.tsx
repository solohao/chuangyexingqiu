import React from 'react';
import { MapPin, Users, DollarSign, RefreshCw, Layers } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    projectType: string;
    teamSize: string;
    fundingStage: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onRefresh: () => void;
  onLocateMe: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  onLocateMe,
}) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <button
          onClick={onLocateMe}
          className="btn btn-secondary text-sm flex items-center"
        >
          <MapPin className="w-4 h-4 mr-1.5" />
          我的位置
        </button>

        <div className="h-6 border-l border-gray-300/80 mx-1"></div>

        <FilterSelect
          icon={Layers}
          value={filters.projectType}
          onChange={(e) => onFilterChange('projectType', e.target.value)}
          options={[
            { value: "", label: "项目类型" },
            { value: "tech", label: "科技" },
            { value: "social", label: "社会企业" },
            { value: "culture", label: "文化创意" },
          ]}
        />
        
        <FilterSelect
          icon={Users}
          value={filters.teamSize}
          onChange={(e) => onFilterChange('teamSize', e.target.value)}
          options={[
            { value: "", label: "团队规模" },
            { value: "1-5人", label: "1-5人" },
            { value: "5-10人", label: "5-10人" },
          ]}
        />

        <FilterSelect
          icon={DollarSign}
          value={filters.fundingStage}
          onChange={(e) => onFilterChange('fundingStage', e.target.value)}
          options={[
            { value: "", label: "融资阶段" },
            { value: "种子轮", label: "种子轮" },
            { value: "天使轮", label: "天使轮" },
          ]}
        />
        
        <div className="h-6 border-l border-gray-300/80 mx-1"></div>

        <button
          onClick={onRefresh}
          className="btn btn-ghost p-2 text-gray-600 hover:text-primary-600"
          aria-label="刷新"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface FilterSelectProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({ icon: Icon, value, onChange, options }) => {
  const selectClasses = "pl-8 pr-4 py-1.5 text-sm bg-transparent border-transparent rounded-lg focus:outline-none focus:ring-0 appearance-none";

  return (
    <div className="relative flex items-center group">
      <Icon className="w-4 h-4 absolute left-2.5 text-gray-500 pointer-events-none transition-colors group-hover:text-gray-800" />
      <select className={selectClasses} value={value} onChange={onChange}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )
}

export default FilterPanel;
