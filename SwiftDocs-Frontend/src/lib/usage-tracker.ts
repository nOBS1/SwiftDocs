import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_EXPIRY = 7; // Cookie 有效期（天）

// 获取或创建用户标识
export function getUserId(): string {
  let userId = Cookies.get('pdf_translator_user_id');
  
  if (!userId) {
    userId = uuidv4();
    Cookies.set('pdf_translator_user_id', userId, { expires: 365 }); // 一年有效期
  }
  
  return userId;
}

// 获取今日使用次数
export function getTodayUsage(): number {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `pdf_translator_usage_${today}`;
  
  return Number.parseInt(Cookies.get(usageKey) || '0', 10);
}

// 记录使用次数
export function recordUsage(): void {
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `pdf_translator_usage_${today}`;
  
  const currentUsage = getTodayUsage();
  Cookies.set(usageKey, (currentUsage + 1).toString(), { expires: COOKIE_EXPIRY });
}

// 检查是否超出限制
export function checkUsageLimit(baseLimit: number = 5): { allowed: boolean; remaining: number } {
  const bonusUsage = getShareBonus();
  const totalLimit = baseLimit + bonusUsage;
  const currentUsage = getTodayUsage();
  
  return {
    allowed: currentUsage < totalLimit,
    remaining: Math.max(0, totalLimit - currentUsage)
  };
}

// 获取分享奖励次数
export function getShareBonus(): number {
  return Number.parseInt(Cookies.get('pdf_translator_share_bonus') || '0', 10);
}

// 增加分享奖励次数
export function addShareBonus(count: number = 1): void {
  const currentBonus = getShareBonus();
  Cookies.set('pdf_translator_share_bonus', (currentBonus + count).toString(), { expires: 30 }); // 30天有效期
}