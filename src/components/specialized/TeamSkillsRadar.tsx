import React from 'react';
import { Users, Star, Plus } from 'lucide-react';
import { TeamMember } from '../../types/project.types';

interface TeamSkillsRadarProps {
  team: TeamMember[];
  seekingRoles: string[];
  maxTeamSize: number;
  className?: string;
}

const TeamSkillsRadar: React.FC<TeamSkillsRadarProps> = ({
  team,
  seekingRoles,
  maxTeamSize,
  className = ""
}) => {
  // 统计所有技能
  const skillStats = new Map<string, { count: number; members: string[] }>();
  
  team.forEach(member => {
    member.skills.forEach(skill => {
      if (!skillStats.has(skill)) {
        skillStats.set(skill, { count: 0, members: [] });
      }
      const stat = skillStats.get(skill)!;
      stat.count += 1;
      stat.members.push(member.name);
    });
  });

  // 转换为数组并排序
  const skillsArray = Array.from(skillStats.entries())
    .map(([skill, stat]) => ({
      skill,
      count: stat.count,
      members: stat.members,
      percentage: (stat.count / team.length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // 团队完整度
  const teamCompletion = (team.length / maxTeamSize) * 100;

  // 获取技能覆盖率颜色
  const getSkillColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 获取评分星星
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">团队技能分析</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{team.length}/{maxTeamSize}人</span>
        </div>
      </div>

      {/* 团队完整度 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">团队完整度</span>
          <span className="text-sm text-gray-600">{Math.round(teamCompletion)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              teamCompletion >= 80 ? 'bg-green-500' :
              teamCompletion >= 60 ? 'bg-blue-500' :
              teamCompletion >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${teamCompletion}%` }}
          />
        </div>
      </div>

      {/* 团队成员列表 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">当前团队成员</h4>
        <div className="space-y-3">
          {team.map((member, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                {member.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-gray-900">{member.name}</h5>
                  {member.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(member.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        {member.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                <p className="text-xs text-gray-500 mb-2">{member.background}</p>
                
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-0.5 text-xs bg-white text-gray-600 rounded-full border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 技能覆盖分析 */}
      {skillsArray.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">技能覆盖分析</h4>
          <div className="space-y-2">
            {skillsArray.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-600 truncate">
                  {item.skill}
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${getSkillColor(item.percentage)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-500 text-right">
                  {item.count}人
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 急需招募 */}
      {seekingRoles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-500" />
            急需招募
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {seekingRoles.map((role, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border border-red-200 bg-red-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 团队建议 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {teamCompletion < 50 && (
            <p className="mb-2">💡 建议：团队规模较小，考虑招募更多核心成员</p>
          )}
          {seekingRoles.length > 3 && (
            <p className="mb-2">⚠️ 提醒：招募角色较多，建议优先招募最关键的岗位</p>
          )}
          {skillsArray.length > 0 && skillsArray[0].count === 1 && (
            <p>🔧 建议：关键技能只有一人掌握，存在风险，建议培养备份</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSkillsRadar;