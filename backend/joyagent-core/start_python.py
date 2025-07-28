#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JoyAgent-Core Python版本启动脚本
"""

import os
import sys
from pathlib import Path

# 添加Python源码路径
current_dir = Path(__file__).parent
python_src_dir = current_dir / "src" / "main" / "python"
sys.path.insert(0, str(python_src_dir))

# 设置环境变量
os.environ.setdefault("PYTHONPATH", str(python_src_dir))

if __name__ == "__main__":
    # 导入并运行应用
    from com.jd.genie.GenieApplication import main
    main()