# 激活虚拟环境
$env:VIRTUAL_ENV = Split-Path $MyInvocation.MyCommand.Path -Parent
$env:VIRTUAL_ENV = Split-Path $env:VIRTUAL_ENV -Parent

if (-not $env:VIRTUAL_ENV_DISABLE_PROMPT) {
    # 自定义 Python 虚拟环境的命令提示符
    $env:PROMPT = "(SwiftDocs) " + $env:PROMPT
}

# 将虚拟环境的 Scripts 目录添加到 PATH
$env:PATH = "$env:VIRTUAL_ENV\Scripts;$env:PATH" 