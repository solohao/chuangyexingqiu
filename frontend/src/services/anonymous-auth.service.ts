import { supabase } from '../config/supabase.config';
import { AuthError } from '@supabase/supabase-js';
import { AuthResponse } from '../types/auth.types';

export class AnonymousAuthService {
    /**
     * 创建匿名用户会话
     * @param nickname 临时昵称
     * @returns 匿名用户会话
     */
    static async createAnonymousSession(nickname?: string): Promise<AuthResponse> {
        try {
            console.log('创建匿名用户会话:', { nickname });

            // 生成随机昵称
            const randomNickname = nickname || `游客${Math.floor(Math.random() * 10000)}`;

            // 创建匿名用户
            const { data, error } = await supabase.auth.signInAnonymously({
                options: {
                    data: {
                        nickname: randomNickname,
                        is_anonymous: true,
                        registration_type: 'anonymous',
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) {
                console.error('创建匿名用户失败:', error);
                return {
                    user: null,
                    session: null,
                    error,
                };
            }

            // 为匿名用户创建临时档案
            if (data?.user) {
                await AnonymousAuthService.createAnonymousProfile(data.user.id, randomNickname);
            }

            return {
                user: data?.user || null,
                session: data?.session || null,
                error: null,
            };

        } catch (error) {
            console.error('创建匿名用户异常:', error);
            return {
                user: null,
                session: null,
                error: error as AuthError,
            };
        }
    }

    /**
     * 将匿名用户转换为正式用户
     * @param username 用户名
     * @param password 密码
     * @returns 转换结果
     */
    static async convertAnonymousToUser(username: string, password: string): Promise<AuthResponse> {
        try {
            console.log('转换匿名用户为正式用户:', { username });

            // 获取当前匿名用户
            const { data: currentUser } = await supabase.auth.getUser();
            if (!currentUser?.user?.is_anonymous) {
                throw new Error('当前用户不是匿名用户');
            }

            // 生成邮箱
            const timestamp = Date.now();
            const email = `${username}_${timestamp}@hackathon.local`;

            // 更新用户信息，转换为正式用户
            const { data, error } = await supabase.auth.updateUser({
                email,
                password,
                data: {
                    username,
                    full_name: username,
                    is_anonymous: false,
                    registration_type: 'converted_from_anonymous',
                    original_username: username
                }
            });

            if (error) {
                console.error('转换匿名用户失败:', error);
                return {
                    user: null,
                    session: null,
                    error,
                };
            }

            // 更新档案信息
            if (data?.user) {
                await AnonymousAuthService.updateProfileAfterConversion(data.user.id, username, email);
            }

            // updateUser 不返回 session，需要获取当前 session
            const { data: sessionData } = await supabase.auth.getSession();

            return {
                user: data?.user || null,
                session: sessionData?.session || null,
                error: null,
            };

        } catch (error) {
            console.error('转换匿名用户异常:', error);
            return {
                user: null,
                session: null,
                error: error as AuthError,
            };
        }
    }

    /**
     * 创建匿名用户档案
     * @param userId 用户ID
     * @param nickname 昵称
     */
    private static async createAnonymousProfile(userId: string, nickname: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    username: nickname,
                    full_name: nickname,
                    email: `${nickname}@anonymous.local`,
                    points: 0,
                    level: 1,
                    status: 'anonymous',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('创建匿名用户档案失败:', error);
            } else {
                console.log('匿名用户档案创建成功');
            }
        } catch (error) {
            console.error('创建匿名用户档案异常:', error);
        }
    }

    /**
     * 转换后更新档案信息
     * @param userId 用户ID
     * @param username 用户名
     * @param email 邮箱
     */
    private static async updateProfileAfterConversion(userId: string, username: string, email: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username,
                    full_name: username,
                    email,
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                console.error('更新转换后档案失败:', error);
            } else {
                console.log('转换后档案更新成功');
            }
        } catch (error) {
            console.error('更新转换后档案异常:', error);
        }
    }

    /**
     * 检查当前用户是否为匿名用户
     * @returns 是否为匿名用户
     */
    static async isAnonymousUser(): Promise<boolean> {
        try {
            const { data } = await supabase.auth.getUser();
            return data?.user?.user_metadata?.is_anonymous === true;
        } catch (error) {
            console.error('检查匿名用户状态失败:', error);
            return false;
        }
    }

    /**
     * 获取匿名用户昵称
     * @returns 昵称
     */
    static async getAnonymousNickname(): Promise<string | null> {
        try {
            const { data } = await supabase.auth.getUser();
            return data?.user?.user_metadata?.nickname || null;
        } catch (error) {
            console.error('获取匿名用户昵称失败:', error);
            return null;
        }
    }
}