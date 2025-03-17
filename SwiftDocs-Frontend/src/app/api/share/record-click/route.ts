import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { refId } = await req.json();
    
    if (!refId) {
      return NextResponse.json({ error: '缺少引荐ID' }, { status: 400 });
    }
    
    // 获取当前用户ID，确保不是自己点击自己的链接
    const cookieStore = cookies();
    const currentUserId = cookieStore.get('pdf_translator_user_id')?.value;
    
    if (refId === currentUserId) {
      return NextResponse.json({ error: '不能点击自己的分享链接' }, { status: 400 });
    }
    
    // 记录点击，这里使用简单的 Cookie 存储
    // 在实际应用中，应该使用数据库存储更可靠
    
    // 获取引荐用户的点击计数
    const clickCountKey = `pdf_translator_share_clicks_${refId}`;
    const currentClicks = Number.parseInt(cookieStore.get(clickCountKey)?.value || '0', 10);
    
    // 增加点击计数
    const response = NextResponse.json({ success: true });
    response.cookies.set(clickCountKey, (currentClicks + 1).toString(), { 
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/'
    });
    
    // 增加引荐用户的奖励次数
    const bonusKey = `pdf_translator_share_bonus_${refId}`;
    const currentBonus = Number.parseInt(cookieStore.get(bonusKey)?.value || '0', 10);
    response.cookies.set(bonusKey, (currentBonus + 1).toString(), { 
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('记录分享点击错误:', error);
    return NextResponse.json(
      { error: '记录分享点击时发生错误' },
      { status: 500 }
    );
  }
} 