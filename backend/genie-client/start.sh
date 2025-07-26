#!/bin/bash

# 加载环境变量（按优先级：.env.local > .env）
if [ -f "../../.env" ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
fi
if [ -f "../../.env.local" ]; then
    export $(cat ../../.env.local | grep -v '^#' | xargs)
fi

uv run server.py