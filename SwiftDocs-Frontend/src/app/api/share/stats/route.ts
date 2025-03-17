import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('pdf_translator_user_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: '用户未识别' }, { status: 400 });
    }
    
    // 获取点击计数
    const clickCountKey = `pdf_translator_share_clicks_${userId}`;
    const clickCount = Number.parseInt(cookieStore.get(clickCountKey)?.value || '0', 10);
    
    // 获取奖励次数
    const bonusKey = `pdf_translator_share_bonus_${userId}`;
    const bonusCount = Number.parseInt(cookieStore.get(bonusKey)?.value || '0', 10);
    
    return NextResponse.json({
      userId,
      clickCount,
      bonusCount
    });
  } catch (error) {
    console.error('获取分享统计错误:', error);
    return NextResponse.json(
      { error: '获取分享统计时发生错误' },
      { status: 500 }
    );
  }
} 