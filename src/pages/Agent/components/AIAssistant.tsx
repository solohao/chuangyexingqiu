import React, { useState } from 'react';
import {
    Bot,
    Send,
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

interface Suggestion {
    id: string;
    type: 'tip' | 'warning' | 'success' | 'insight';
    title: string;
    content: string;
}

interface AIAssistantProps {
    projectId?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ projectId: _ }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'ai',
            content: '你好！我是你的创业AI助手。我可以帮你分析项目进度、提供建议、回答问题。有什么我可以帮助你的吗？',
            timestamp: new Date(Date.now() - 5 * 60 * 1000)
        }
    ]);

    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // 智能建议
    const suggestions: Suggestion[] = [
        {
            id: '1',
            type: 'tip',
            title: '进度提醒',
            content: '你的项目进度略微落后，建议重新评估任务优先级'
        },
        {
            id: '2',
            type: 'insight',
            title: '团队效率',
            content: '团队本周完成任务数量比上周提升了20%'
        },
        {
            id: '3',
            type: 'warning',
            title: '预算警告',
            content: '当前预算使用率64%，建议控制支出'
        }
    ];

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // 模拟AI回复
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: getAIResponse(inputMessage),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const getAIResponse = (_userInput: string): string => {
        const responses = [
            '根据你的项目数据分析，我建议你可以考虑优化团队协作流程。',
            '从进度来看，项目整体健康度良好，但需要关注即将到期的任务。',
            '我注意到你的团队效率在提升，这是个好兆头！继续保持。',
            '基于类似项目的经验，建议你在下个阶段重点关注用户反馈收集。'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const getSuggestionIcon = (type: Suggestion['type']) => {
        switch (type) {
            case 'tip': return <Lightbulb className="w-4 h-4 text-blue-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'insight': return <TrendingUp className="w-4 h-4 text-purple-500" />;
        }
    };

    const getSuggestionBg = (type: Suggestion['type']) => {
        switch (type) {
            case 'tip': return 'bg-blue-50 border-blue-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'success': return 'bg-green-50 border-green-200';
            case 'insight': return 'bg-purple-50 border-purple-200';
        }
    };

    return (
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* 头部 */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                    <Bot className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900">AI助手</span>
                </div>
            </div>

            {/* 智能建议区域 */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-3">智能建议</h4>
                <div className="space-y-2">
                    {suggestions.map(suggestion => (
                        <div
                            key={suggestion.id}
                            className={`p-3 rounded-lg border ${getSuggestionBg(suggestion.type)}`}
                        >
                            <div className="flex items-start">
                                {getSuggestionIcon(suggestion.type)}
                                <div className="ml-2 flex-1">
                                    <p className="text-xs font-medium text-gray-800">{suggestion.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{suggestion.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 聊天区域 */}
            <div className="flex-1 flex flex-col">
                {/* 消息列表 */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map(message => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${message.type === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-800'
                                }`}>
                                {message.type === 'ai' && (
                                    <div className="flex items-center mb-1">
                                        <Bot className="w-3 h-3 mr-1" />
                                        <span className="text-xs text-gray-500">AI助手</span>
                                    </div>
                                )}
                                <p>{message.content}</p>
                                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 p-3 rounded-lg">
                                <div className="flex items-center space-x-1">
                                    <Bot className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">AI助手正在输入...</span>
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="询问AI助手..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 快捷问题 */}
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">快捷问题：</p>
                        <div className="flex flex-wrap gap-1">
                            {['项目进度如何？', '团队效率分析', '预算使用情况'].map(question => (
                                <button
                                    key={question}
                                    onClick={() => setInputMessage(question)}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;