#!/bin/sh
# 새 feature 브랜치 생성
# 사용법: sh scripts/new-feature.sh 기능명

if [ -z "$1" ]; then
  echo "사용법: sh scripts/new-feature.sh 기능명"
  echo "예시:   sh scripts/new-feature.sh battle-system"
  exit 1
fi

git checkout dev
git pull origin dev
git checkout -b "feature/$1"
echo ""
echo "  브랜치 'feature/$1' 생성 완료"
echo "  작업 후: git push origin feature/$1"
echo "  그 다음 GitHub에서 dev로 PR 생성"
