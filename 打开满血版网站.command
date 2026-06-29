#!/bin/zsh

PROJECT_DIR="/Users/shishi/Desktop/学习/诺奖物理"
START_PAGE="prototype/index.html"
BASE_PORT=8787

cd "$PROJECT_DIR" || {
  echo "找不到项目目录：$PROJECT_DIR"
  read -r "?按回车退出..."
  exit 1
}

port="$BASE_PORT"
while true; do
  if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    if curl -fsS "http://localhost:$port/$START_PAGE" >/dev/null 2>&1; then
      break
    fi
    port=$((port + 1))
    continue
  fi
  echo "正在启动诺奖物理互动展厅服务器：localhost:$port"
  python3 -m http.server "$port" >/tmp/nobel-physics-gallery-"$port".log 2>&1 &
  server_pid=$!
  sleep 1
  if curl -fsS "http://localhost:$port/$START_PAGE" >/dev/null 2>&1; then
    break
  fi
  echo "服务器启动失败，正在尝试下一个端口..."
  kill "$server_pid" >/dev/null 2>&1
  port=$((port + 1))
done

version="$(date +%s)"
url="http://localhost:$port/$START_PAGE?v=$version"
echo ""
echo "已打开满血版网站：$url"
echo "请保持这个窗口开着；关闭窗口后，本地网站服务也会停止。"
echo ""
if [[ -d "/Applications/Google Chrome.app" ]]; then
  open -a "Google Chrome" "$url"
else
  open "$url"
fi

if [[ -n "${server_pid:-}" ]]; then
  wait "$server_pid"
else
  echo "检测到已有可用服务器正在运行。"
  read -r "?按回车关闭这个窗口..."
fi
