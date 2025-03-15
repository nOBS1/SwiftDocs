#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
BabelDOC API 测试脚本
此脚本用于测试 BabelDOC 的 API 是否能够正常工作
"""

import os
import sys
import asyncio
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('babeldoc-test')

async def test_babeldoc():
    """测试 BabelDOC 的 API"""
    try:
        # 尝试导入 babeldoc
        import babeldoc.high_level
        logger.info(f"成功导入 babeldoc 模块，版本: {getattr(babeldoc, '__version__', '未知')}")
        
        # 初始化 BabelDOC
        logger.info("初始化 BabelDOC...")
        babeldoc.high_level.init()
        logger.info("BabelDOC 初始化成功")
        
        # 检查 API 密钥
        api_key = os.environ.get('OPENAI_API_KEY', '')
        if not api_key:
            logger.warning("未设置 OPENAI_API_KEY 环境变量，某些功能可能无法正常工作")
        else:
            logger.info("已设置 OPENAI_API_KEY 环境变量")
        
        # 打印可用的配置选项
        logger.info("BabelDOC 配置选项:")
        config = babeldoc.high_level.TranslationConfig(
            lang_in="auto",
            lang_out="zh-CN",
            openai=True,
            output="./output",
            watermark_output_mode="no_watermark"
        )
        
        # 打印配置信息
        for key, value in vars(config).items():
            if key != 'openai_api_key':  # 不打印 API 密钥
                logger.info(f"  {key}: {value}")
        
        logger.info("BabelDOC API 测试成功")
        return True
    except ImportError as e:
        logger.error(f"导入 babeldoc 模块失败: {e}")
        logger.error("请确保已安装 babeldoc 包: pip install babeldoc")
        return False
    except Exception as e:
        logger.error(f"测试 BabelDOC API 时出错: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == '__main__':
    success = asyncio.run(test_babeldoc())
    sys.exit(0 if success else 1) 