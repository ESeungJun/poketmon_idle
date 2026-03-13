#!/bin/sh
# git hooks 설치 스크립트
# 최초 1회 실행: sh scripts/setup-hooks.sh

cp hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
echo "git hooks 설치 완료 (pre-push)"
