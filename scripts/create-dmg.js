#!/usr/bin/env node
// fix-app-bundle.js로 수정된 .app에서 배포용 DMG를 생성한다.
// macOS 26에서 Finder drag-and-drop 설치 시 코드서명 검증 크래시가 발생하므로
// DMG 안에 설치 스크립트(.command)를 포함하여 cp -R 방식으로 설치한다.

if (process.platform !== 'darwin') {
  console.log('macOS 전용 DMG 생성 스킵 (현재 플랫폼:', process.platform + ')');
  process.exit(0);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const APP_PATH = path.resolve('release/mac-universal/poketmon-idle.app');
const DMG_NAME = `${pkg.build.productName}-${pkg.version}-universal.dmg`;
const DMG_PATH = path.resolve('release', DMG_NAME);
const TMP_DIR = path.resolve('release/_dmg_tmp');

if (!fs.existsSync(APP_PATH)) {
  console.error('앱 번들을 찾을 수 없습니다:', APP_PATH);
  process.exit(1);
}

// 기존 파일 삭제
if (fs.existsSync(DMG_PATH)) {
  fs.unlinkSync(DMG_PATH);
}

// 임시 디렉토리 생성
if (fs.existsSync(TMP_DIR)) {
  execSync(`rm -rf "${TMP_DIR}"`);
}
fs.mkdirSync(TMP_DIR, { recursive: true });

// 앱 복사
execSync(`cp -R "${APP_PATH}" "${TMP_DIR}/"`);

// 설치 스크립트 생성
const installScript = `#!/bin/bash
# 포켓몬키우기 설치 스크립트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="poketmon-idle.app"
DEST="/Applications/$APP_NAME"

echo ""
echo "🎮 포켓몬키우기를 설치합니다..."
echo ""

# 기존 앱 제거
if [ -d "$DEST" ]; then
  rm -rf "$DEST"
fi

# 앱 복사
cp -R "$SCRIPT_DIR/$APP_NAME" "$DEST"

if [ $? -eq 0 ]; then
  echo "✅ 설치 완료! 앱을 실행합니다."
  echo ""
  # quarantine 플래그 제거
  xattr -cr "$DEST" 2>/dev/null
  open "$DEST"
else
  echo "❌ 설치에 실패했습니다. 권한이 필요할 수 있습니다."
  echo "   다음 명령어로 설치해보세요:"
  echo "   sudo cp -R \\"$SCRIPT_DIR/$APP_NAME\\" /Applications/"
  echo ""
fi

# 터미널 창 자동 닫기 안내
echo ""
echo "이 창을 닫아도 됩니다."
`;

const scriptPath = path.join(TMP_DIR, '설치.command');
fs.writeFileSync(scriptPath, installScript);
execSync(`chmod +x "${scriptPath}"`);

// hdiutil로 DMG 생성
console.log(`DMG 생성 중: ${DMG_NAME}`);
execSync(
  `hdiutil create -volname "${pkg.build.productName}" -srcfolder "${TMP_DIR}" -ov -format UDZO "${DMG_PATH}"`,
  { stdio: 'inherit' }
);

// 임시 디렉토리 정리
execSync(`rm -rf "${TMP_DIR}"`);

console.log(`✓ DMG 생성 완료: ${DMG_PATH}`);
console.log('  사용자는 DMG를 열고 "설치.command"를 더블클릭하면 됩니다.');
