#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
PDF 处理 API 脚本
此脚本尝试使用 pdf2zh 处理 PDF 文件，如果 pdf2zh 不可用，则提供基本的错误处理
"""

import os
import sys
import json
import argparse
from datetime import datetime

def main():
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='处理 PDF 文件')
    parser.add_argument('input_file', help='输入 PDF 文件路径')
    parser.add_argument('--output-dir', help='输出目录', default='.')
    parser.add_argument('--lang-out', help='目标语言', default='zh')
    parser.add_argument('--service', help='翻译服务', default='google')
    args = parser.parse_args()
    
    # 检查输入文件是否存在
    if not os.path.exists(args.input_file):
        result = {
            'error': f'输入文件不存在: {args.input_file}'
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1
    
    # 尝试导入 pdf2zh
    try:
        import pdf2zh
        return process_with_pdf2zh(args)
    except ImportError:
        # 如果 pdf2zh 不可用，返回错误信息
        result = {
            'error': 'pdf2zh 模块不可用，请安装: pip install pdf2zh',
            'text': f'[无法使用 PDFMathTranslate 处理 PDF]\n\n文件: {os.path.basename(args.input_file)}\n时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n请确保已安装 Python 和 pdf2zh 包。',
            'pages': 1
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1

def process_with_pdf2zh(args):
    """使用 pdf2zh 处理 PDF 文件"""
    try:
        import pdf2zh
        from pdf2zh.translate import translate_pdf
        
        # 确保输出目录存在
        os.makedirs(args.output_dir, exist_ok=True)
        
        # 生成输出文件路径
        base_name = os.path.splitext(os.path.basename(args.input_file))[0]
        mono_file = os.path.join(args.output_dir, f"{base_name}_{args.lang_out}.pdf")
        dual_file = os.path.join(args.output_dir, f"{base_name}_{args.lang_out}_dual.pdf")
        
        # 调用 pdf2zh 处理 PDF
        result = translate_pdf(
            args.input_file,
            lang_out=args.lang_out,
            service=args.service,
            mono_file=mono_file,
            dual_file=dual_file
        )
        
        # 提取文本内容
        text = result.get('text', '')
        pages = result.get('pages', 1)
        
        # 返回处理结果
        output = {
            'success': True,
            'text': text,
            'pages': pages,
            'mono_file': mono_file,
            'dual_file': dual_file
        }
        print(json.dumps(output, ensure_ascii=False))
        return 0
    except Exception as e:
        # 处理异常
        result = {
            'error': f'处理 PDF 时出错: {str(e)}',
            'text': f'[PDFMathTranslate 处理失败]\n\n文件: {os.path.basename(args.input_file)}\n时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n\n错误: {str(e)}',
            'pages': 1
        }
        print(json.dumps(result, ensure_ascii=False))
        return 1

if __name__ == '__main__':
    sys.exit(main()) 