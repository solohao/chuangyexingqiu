#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日期工具类
对应原Java文件: com.jd.genie.agent.util.DateUtil
"""

from datetime import datetime, timezone


class DateUtil:
    """日期工具类"""
    
    @staticmethod
    def current_date_info() -> str:
        """获取当前日期信息"""
        now = datetime.now(timezone.utc)
        
        # 格式化为中文日期信息
        date_info = f"""当前时间信息：
- 日期：{now.strftime('%Y年%m月%d日')}
- 时间：{now.strftime('%H:%M:%S')}
- 星期：{DateUtil._get_weekday_chinese(now.weekday())}
- 时区：UTC
- 时间戳：{int(now.timestamp())}"""
        
        return date_info
    
    @staticmethod
    def _get_weekday_chinese(weekday: int) -> str:
        """获取中文星期"""
        weekdays = {
            0: "星期一",
            1: "星期二", 
            2: "星期三",
            3: "星期四",
            4: "星期五",
            5: "星期六",
            6: "星期日"
        }
        return weekdays.get(weekday, "未知")
    
    @staticmethod
    def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
        """格式化日期时间"""
        return dt.strftime(format_str)
    
    @staticmethod
    def get_current_timestamp() -> int:
        """获取当前时间戳"""
        return int(datetime.now().timestamp())
    
    @staticmethod
    def get_current_date_string() -> str:
        """获取当前日期字符串"""
        return datetime.now().strftime("%Y-%m-%d")
    
    @staticmethod
    def get_current_time_string() -> str:
        """获取当前时间字符串"""
        return datetime.now().strftime("%H:%M:%S")