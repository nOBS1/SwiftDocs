#!/bin/bash
# SwiftDocs 跨平台启动脚本 (Linux/macOS)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检测操作系统
OS="$(uname -s)"
echo -e "${BLUE}检测到操作系统: $OS${NC}"

# 显示菜单
show_menu() {
    echo -e "${GREEN}===== SwiftDocs 启动选项 =====${NC}"
    echo -e "1) ${YELLOW}启动后端服务${NC}"
    echo -e "2) ${YELLOW}启动前端服务${NC}"
    echo -e "3) ${YELLOW}启动全栈应用 (Docker)${NC}"
    echo -e "4) ${YELLOW}安装依赖${NC}"
    echo -e "5) ${YELLOW}退出${NC}"
    echo -e "${GREEN}===========================${NC}"
}

# 启动后端
start_backend() {
    echo -e "${BLUE}启动后端服务...${NC}"
    cd SwiftDocs-Backend
    python run.py
}

# 启动前端
start_frontend() {
    echo -e "${BLUE}启动前端服务...${NC}"
    cd SwiftDocs-Frontend
    node run.js
}

# 启动Docker
start_docker() {
    echo -e "${BLUE}使用Docker启动全栈应用...${NC}"
    
    # 检查Docker是否安装
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker未安装${NC}"
        echo -e "${YELLOW}请先安装Docker和Docker Compose${NC}"
        return
    fi
    
    # 检查Docker Compose是否安装
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: Docker Compose未安装${NC}"
        echo -e "${YELLOW}请先安装Docker Compose${NC}"
        return
    }
    
    # 启动Docker Compose
    docker-compose up -d
    
    echo -e "${GREEN}应用已启动:${NC}"
    echo -e "前端: ${BLUE}http://localhost:3000${NC}"
    echo -e "后端API: ${BLUE}http://localhost:8000/api/v1${NC}"
    echo -e "API文档: ${BLUE}http://localhost:8000/api/v1/docs${NC}"
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}安装系统依赖...${NC}"
    
    if [[ "$OS" == "Darwin" ]]; then
        # macOS
        echo -e "${YELLOW}检测到macOS系统${NC}"
        
        # 检查Homebrew
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}Homebrew未安装，请先安装Homebrew${NC}"
            echo -e "${YELLOW}/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
            return
        }
        
        # 安装依赖
        echo -e "${BLUE}安装Tesseract OCR...${NC}"
        brew install tesseract
        
        echo -e "${BLUE}安装Redis...${NC}"
        brew install redis
        
        echo -e "${BLUE}启动Redis服务...${NC}"
        brew services start redis
        
    else
        # Linux
        echo -e "${YELLOW}检测到Linux系统${NC}"
        
        # 检查包管理器
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            echo -e "${BLUE}使用apt安装依赖...${NC}"
            sudo apt-get update
            sudo apt-get install -y tesseract-ocr libtesseract-dev tesseract-ocr-eng tesseract-ocr-chi-sim redis-server
            
            echo -e "${BLUE}启动Redis服务...${NC}"
            sudo systemctl start redis-server
            
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            echo -e "${BLUE}使用yum安装依赖...${NC}"
            sudo yum install -y tesseract redis
            
            echo -e "${BLUE}启动Redis服务...${NC}"
            sudo systemctl start redis
            
        else
            echo -e "${RED}未检测到支持的包管理器，请手动安装依赖${NC}"
            return
        fi
    fi
    
    echo -e "${GREEN}系统依赖安装完成${NC}"
}

# 主函数
main() {
    while true; do
        show_menu
        read -p "请选择操作 [1-5]: " choice
        
        case $choice in
            1) start_backend ;;
            2) start_frontend ;;
            3) start_docker ;;
            4) install_dependencies ;;
            5) echo -e "${GREEN}再见!${NC}"; exit 0 ;;
            *) echo -e "${RED}无效选择，请重试${NC}" ;;
        esac
        
        echo
    done
}

# 执行主函数
main 