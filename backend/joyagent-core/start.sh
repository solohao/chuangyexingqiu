#!/bin/bash

# 加载环境变量（按优先级：.env.local > .env）
if [ -f "../../.env" ]; then
    set -a
    source ../../.env
    set +a
fi
if [ -f "../../.env.local" ]; then
    set -a
    source ../../.env.local
    set +a
fi

# 开始启动后端程序
BASEDIR="./target/genie-backend"
CLASSPATH="$BASEDIR/conf/:$BASEDIR/lib/*"
MAIN_MODULE="com.jd.genie.GenieApplication"
LOGFILE="./genie-backend_startup.log"

echo "starting $APP_NAME :)"
java -classpath "$CLASSPATH" -Dbasedir="$BASEDIR" -Dfile.encoding="UTF-8" ${MAIN_MODULE} > $LOGFILE 2>&1 &
