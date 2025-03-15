#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PDF 处理 API 脚本
此脚本使用 BabelDOC 的 babeldoc.high_level.async_translate 函数处理 PDF 文件
"""

import os
import sys
import json
import argparse
import asyncio
import logging
from datetime import datetime
from pathlib import Path
import traceback

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('babeldoc-api')

def main():
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='处理 PDF 文件')
    parser.add_argument('input_file', help='输入 PDF 文件路径')
    parser.add_argument('--output-dir', help='输出目录', default='.')
    parser.add_argument('--lang-out', help='目标语言', default='zh-CN')
    parser.add_argument('--service', help='翻译服务', default='openai')
    parser.add_argument('--api-key', help='API 密钥', default='')
    parser.add_argument('--preserve-format', action='store_true', help='优先保留原始格式')
    args = parser.parse_args()
    
    # 检查输入文件是否存在
    if not os.path.exists(args.input_file):
        result = {
            'error': f'输入文件不存在: {args.input_file}'
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1
    
    # 尝试导入 babeldoc
    try:
        import babeldoc.high_level
        logger.info(f"成功导入 babeldoc 模块，版本: {getattr(babeldoc, '__version__', '未知')}")
        return asyncio.run(process_with_babeldoc(args))
    except ImportError as e:
        # 如果 babeldoc 不可用，返回错误信息
        error_msg = f"导入 babeldoc 模块失败: {str(e)}"
        logger.error(error_msg)
        result = {
            'error': 'babeldoc 模块不可用，请安装: pip install babeldoc',
            'text': f'''[无法使用 BabelDOC 处理 PDF]

文件: {os.path.basename(args.input_file)}
时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

请确保已安装 Python 3.8+ 和 babeldoc 包。

推荐安装方法:
1. 安装 uv 工具:
   pip install uv

2. 使用 uv 安装 BabelDOC:
   uv tool install --python 3.12 BabelDOC

或者从 GitHub 安装:
   pip install git+https://github.com/funstory-ai/BabelDOC.git

错误详情: {error_msg}''',
            'pages': 1
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1

async def process_with_babeldoc(args):
    """使用 babeldoc 处理 PDF 文件"""
    try:
        import babeldoc.high_level
        
        logger.info(f"开始处理 PDF 文件: {args.input_file}")
        logger.info(f"输出目录: {args.output_dir}")
        logger.info(f"目标语言: {args.lang_out}")
        logger.info(f"翻译服务: {args.service}")
        logger.info(f"保留格式: {args.preserve_format}")
        
        # 初始化 BabelDOC
        logger.info("初始化 BabelDOC...")
        babeldoc.high_level.init()
        
        # 确保输出目录存在
        os.makedirs(args.output_dir, exist_ok=True)
        
        # 准备翻译配置
        logger.info("配置翻译参数...")
        config = babeldoc.high_level.TranslationConfig(
            lang_in="auto",
            lang_out=args.lang_out,
            openai=(args.service == 'openai'),
            bing=(args.service == 'bing'),
            output=args.output_dir,
            watermark_output_mode="no_watermark",  # 移除水印
            debug=True,  # 启用调试模式以获取更多日志
        )
        
        # 如果选择保留格式，添加相关参数
        if args.preserve_format:
            logger.info("启用格式保留选项...")
            config.split_short_lines = False  # 不分割短行，保持原始行结构
            config.short_line_split_factor = 0.8  # 短行分割因子
            config.skip_clean = True  # 跳过清理步骤，保留更多原始格式
            config.dual_translate_first = False  # 先翻译单语言文档
            config.disable_rich_text_translate = False  # 启用富文本翻译
            config.use_alternating_pages_dual = True  # 使用交替页面的双语模式，更好地对比原文和译文
            config.min_text_length = 3  # 最小文本长度，小于此长度的文本不会被翻译
        
        # 如果使用 OpenAI，设置相关参数
        if args.service == 'openai':
            # 从环境变量或参数中获取 API 密钥
            api_key = args.api_key or os.environ.get('OPENAI_API_KEY', '')
            if not api_key:
                error_msg = "未设置 OpenAI API 密钥"
                logger.error(error_msg)
                result = {
                    'error': error_msg,
                    'text': f'[BabelDOC 处理失败]\n\n文件: {os.path.basename(args.input_file)}\n时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n错误: 未设置 OpenAI API 密钥，请在环境变量中设置 OPENAI_API_KEY 或通过 --api-key 参数提供。',
                    'pages': 1
                }
                print(json.dumps(result, ensure_ascii=False))
                return 1
                
            logger.info("设置 OpenAI API 参数...")
            config.openai_api_key = api_key
            config.openai_model = "gpt-4o-mini"  # 可以根据需要调整模型
            config.openai_base_url = "https://api.openai.com/v1"  # 默认 API 端点
        
        # 使用 BabelDOC 的高级 API 进行翻译
        logger.info(f"开始翻译 PDF: {args.input_file}")
        try:
            result = await babeldoc.high_level.async_translate(
                args.input_file,
                config=config
            )
            logger.info("翻译完成，处理结果...")
        except Exception as e:
            error_msg = f"调用 async_translate 失败: {str(e)}\n{traceback.format_exc()}"
            logger.error(error_msg)
            result = {
                'success': False,
                'error': f'BabelDOC 翻译失败: {str(e)}',
                'text': f'[BabelDOC 处理失败]\n\n文件: {os.path.basename(args.input_file)}\n时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n错误: {str(e)}\n\n{error_msg}',
                'pages': 1
            }
            print(json.dumps(result, ensure_ascii=False))
            return 1
        
        # 获取翻译结果
        mono_pdf_path = result.get('mono_pdf_path')
        dual_pdf_path = result.get('dual_pdf_path')
        text_path = result.get('text_path')
        
        logger.info(f"单语言 PDF 路径: {mono_pdf_path}")
        logger.info(f"双语言 PDF 路径: {dual_pdf_path}")
        logger.info(f"文本文件路径: {text_path}")
        
        # 读取提取的文本
        original_text = ""
        translated_text = ""
        
        if text_path and Path(text_path).exists():
            logger.info(f"读取文本文件: {text_path}")
            try:
                with open(text_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # 尝试分割原文和译文
                    if '\n\n===== 翻译 =====\n\n' in content:
                        parts = content.split('\n\n===== 翻译 =====\n\n')
                        if len(parts) >= 2:
                            original_text = parts[0].strip()
                            translated_text = parts[1].strip()
                    elif '\n\n翻译：\n\n' in content:
                        parts = content.split('\n\n翻译：\n\n')
                        if len(parts) >= 2:
                            original_text = parts[0].strip()
                            translated_text = parts[1].strip()
                    else:
                        # 如果无法分割，使用整个内容作为原文
                        logger.warning("无法分割原文和译文，使用整个内容作为原文")
                        original_text = content
            except Exception as e:
                logger.error(f"读取文本文件失败: {str(e)}")
        else:
            logger.warning(f"文本文件不存在: {text_path}")
        
        # 返回处理结果
        output = {
            'success': True,
            'originalText': original_text,
            'translatedText': translated_text,
            'monoPdfPath': str(mono_pdf_path) if mono_pdf_path else None,
            'dualPdfPath': str(dual_pdf_path) if dual_pdf_path else None,
            'textPath': str(text_path) if text_path else None
        }
        logger.info("处理完成，返回结果")
        print(json.dumps(output, ensure_ascii=False))
        return 0
    except Exception as e:
        # 处理异常
        error_msg = traceback.format_exc()
        logger.error(f"处理 PDF 时出错: {str(e)}\n{error_msg}")
        result = {
            'success': False,
            'error': f'处理 PDF 时出错: {str(e)}',
            'text': f'[BabelDOC 处理失败]\n\n文件: {os.path.basename(args.input_file)}\n时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n错误: {str(e)}\n\n{error_msg}',
            'pages': 1
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1

if __name__ == '__main__':
    sys.exit(main()) 