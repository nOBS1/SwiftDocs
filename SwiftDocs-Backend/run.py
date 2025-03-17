#!/usr/bin/env python
"""
跨平台启动脚本 - 支持 Windows, macOS 和 Linux
"""
import os
import sys
import platform
import subprocess
import argparse
import venv
import shutil
from pathlib import Path

# 项目根目录
ROOT_DIR = Path(__file__).parent.absolute()
VENV_DIR = ROOT_DIR / "venv"
REQUIREMENTS_FILE = ROOT_DIR / "requirements.txt"

def is_venv():
    """检查是否在虚拟环境中运行"""
    return hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)

def create_venv():
    """创建虚拟环境"""
    print("创建虚拟环境...")
    venv.create(VENV_DIR, with_pip=True)
    print(f"虚拟环境已创建在: {VENV_DIR}")

def get_python_executable():
    """获取虚拟环境中的Python可执行文件路径"""
    if platform.system() == "Windows":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"

def get_pip_executable():
    """获取虚拟环境中的pip可执行文件路径"""
    if platform.system() == "Windows":
        return VENV_DIR / "Scripts" / "pip.exe"
    return VENV_DIR / "bin" / "pip"

def install_requirements():
    """安装依赖"""
    pip = get_pip_executable()
    print("安装依赖...")
    subprocess.run([str(pip), "install", "--upgrade", "pip"])
    subprocess.run([str(pip), "install", "-r", str(REQUIREMENTS_FILE)])
    print("依赖安装完成")

def run_server(host="0.0.0.0", port=8000, reload=True):
    """运行服务器"""
    python = get_python_executable()
    print(f"启动服务器在 http://{host}:{port}")
    cmd = [
        str(python), "-m", "uvicorn", "app.main:app", 
        "--host", host, 
        "--port", str(port)
    ]
    if reload:
        cmd.append("--reload")
    subprocess.run(cmd)

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="SwiftDocs 后端启动脚本")
    parser.add_argument("--host", default="0.0.0.0", help="主机地址")
    parser.add_argument("--port", type=int, default=8000, help="端口号")
    parser.add_argument("--no-reload", action="store_true", help="禁用自动重载")
    parser.add_argument("--setup", action="store_true", help="仅设置环境")
    args = parser.parse_args()

    # 检查虚拟环境
    if not VENV_DIR.exists():
        create_venv()
        install_requirements()
    elif not (VENV_DIR / "pyvenv.cfg").exists():
        print("虚拟环境损坏，重新创建...")
        shutil.rmtree(VENV_DIR)
        create_venv()
        install_requirements()

    # 如果不在虚拟环境中运行，则激活虚拟环境并重新运行此脚本
    if not is_venv():
        python = get_python_executable()
        os.execv(str(python), [str(python), __file__] + sys.argv[1:])
        return

    # 仅设置环境
    if args.setup:
        print("环境设置完成")
        return

    # 运行服务器
    run_server(args.host, args.port, not args.no_reload)

if __name__ == "__main__":
    main() 