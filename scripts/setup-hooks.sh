#!/bin/sh
# git hooks 설치 스크립트
# 최초 1회 실행: sh scripts/setup-hooks.sh
# hooks 폴더를 그대로 쓰게 해서, 훅을 고쳐도 다시 복사할 필요가 없다

git config core.hooksPath hooks
chmod +x hooks/pre-push
echo "git hooks 설치 완료 (core.hooksPath = hooks)"
