#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
聊天会话服务
负责会话的存储和检索
"""

import json
import os
import time
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger


class ChatSessionService:
    """聊天会话服务类"""
    
    def __init__(self):
        """初始化会话服务"""
        # 会话存储目录
        self.storage_dir = os.path.join(os.path.dirname(__file__), "../../../../../data/sessions")
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # 内存中的会话缓存
        self.sessions_cache: Dict[str, Dict[str, Any]] = {}
        
        # 加载所有会话到内存
        self._load_all_sessions()
    
    def _load_all_sessions(self):
        """加载所有会话到内存"""
        try:
            if not os.path.exists(self.storage_dir):
                return
                
            for filename in os.listdir(self.storage_dir):
                if filename.endswith(".json"):
                    session_id = filename[:-5]  # 移除 .json 后缀
                    try:
                        with open(os.path.join(self.storage_dir, filename), 'r', encoding='utf-8') as f:
                            session_data = json.load(f)
                            self.sessions_cache[session_id] = session_data
                    except Exception as e:
                        logger.error(f"加载会话文件失败: {filename}, {e}")
        except Exception as e:
            logger.error(f"加载会话失败: {e}")
    
    def _save_session_to_file(self, session_id: str, session_data: Dict[str, Any]):
        """将会话保存到文件"""
        try:
            filepath = os.path.join(self.storage_dir, f"{session_id}.json")
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存会话到文件失败: {session_id}, {e}")
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """获取所有会话"""
        return list(self.sessions_cache.values())
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """获取指定会话"""
        return self.sessions_cache.get(session_id)
    
    def create_session(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """创建新会话"""
        # 生成会话ID
        session_id = f"session_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        # 创建欢迎消息
        welcome_message = {
            "messageId": f"welcome_{int(time.time())}",
            "role": "assistant",
            "content": "您好！我是创业助手，可以协调多个专业智能体为您服务。请问需要什么帮助？",
            "timestamp": datetime.now().isoformat()
        }
        
        # 创建会话数据
        session_data = {
            "id": session_id,
            "messages": [welcome_message],
            "lastUpdated": datetime.now().isoformat(),
            **metadata
        }
        
        # 保存到内存和文件
        self.sessions_cache[session_id] = session_data
        self._save_session_to_file(session_id, session_data)
        
        return session_data
    
    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        if session_id not in self.sessions_cache:
            return False
            
        # 从内存中删除
        del self.sessions_cache[session_id]
        
        # 从文件中删除
        filepath = os.path.join(self.storage_dir, f"{session_id}.json")
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.error(f"删除会话文件失败: {session_id}, {e}")
                
        return True
    
    def clear_all_sessions(self):
        """清空所有会话"""
        # 清空内存
        self.sessions_cache.clear()
        
        # 清空文件
        try:
            for filename in os.listdir(self.storage_dir):
                if filename.endswith(".json"):
                    os.remove(os.path.join(self.storage_dir, filename))
        except Exception as e:
            logger.error(f"清空会话文件失败: {e}")
    
    def get_session_messages(self, session_id: str) -> Optional[List[Dict[str, Any]]]:
        """获取会话消息"""
        session = self.get_session(session_id)
        if not session:
            return None
        return session.get("messages", [])
    
    def save_session_messages(self, session_id: str, messages: List[Dict[str, Any]], metadata: Dict[str, Any]) -> bool:
        """保存会话消息"""
        # 检查会话是否存在
        session = self.sessions_cache.get(session_id)
        
        if session:
            # 更新现有会话
            session["messages"] = messages
            session["lastUpdated"] = datetime.now().isoformat()
            
            # 更新元数据
            if metadata:
                for key, value in metadata.items():
                    if key != "messages" and key != "id":
                        session[key] = value
        else:
            # 创建新会话
            session = {
                "id": session_id,
                "messages": messages,
                "lastUpdated": datetime.now().isoformat(),
                **metadata
            }
            self.sessions_cache[session_id] = session
        
        # 保存到文件
        self._save_session_to_file(session_id, session)
        
        return True
    
    def sync_session(self, session_id: str, session_data: Dict[str, Any]) -> bool:
        """同步会话"""
        # 检查会话是否已存在
        if session_id in self.sessions_cache:
            logger.info(f"会话已存在，跳过同步: {session_id}")
            return True
            
        # 保存新会话
        self.sessions_cache[session_id] = session_data
        self._save_session_to_file(session_id, session_data)
        
        return True


# 创建单例实例
chat_session_service = ChatSessionService() 