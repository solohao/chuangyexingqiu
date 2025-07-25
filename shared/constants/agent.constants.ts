/**
 * 智能体相关常量定义
 */

export const AGENT_NAMES = {
  BUSINESS_CANVAS: 'business_canvas_agent',
  SWOT_ANALYSIS: 'swot_analysis_agent',
  POLICY_MATCHING: 'policy_matching_agent',
  INCUBATOR: 'incubator_agent',
} as const;

export const BUSINESS_CANVAS_ELEMENTS = {
  CUSTOMER_SEGMENTS: 'customer_segments',
  VALUE_PROPOSITIONS: 'value_propositions',
  CHANNELS: 'channels',
  CUSTOMER_RELATIONSHIPS: 'customer_relationships',
  REVENUE_STREAMS: 'revenue_streams',
  KEY_RESOURCES: 'key_resources',
  KEY_ACTIVITIES: 'key_activities',
  KEY_PARTNERSHIPS: 'key_partnerships',
  COST_STRUCTURE: 'cost_structure',
} as const;

export const SWOT_CATEGORIES = {
  STRENGTHS: 'strengths',
  WEAKNESSES: 'weaknesses',
  OPPORTUNITIES: 'opportunities',
  THREATS: 'threats',
} as const;

export const POLICY_TYPES = {
  FUNDING: 'funding',
  TAX_INCENTIVE: 'tax_incentive',
  INCUBATION: 'incubation',
  TALENT: 'talent',
  TECHNOLOGY: 'technology',
} as const;