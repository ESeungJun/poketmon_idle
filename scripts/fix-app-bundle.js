#!/usr/bin/env node
// electron-builder가 바이너리를 수정해서 크래시가 발생하므로
// node_modules의 원본 Electron.app 전체를 기반으로 앱 번들을 재구성한다.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const APP = path.resolve('release/mac-arm64/poketmon-idle.app');
const NODE_ELECTRON = path.resolve('node_modules/electron/dist/Electron.app');
const ENTITLEMENTS = path.resolve('entitlements.plist');

// electron-builder가 생성한 app.asar 저장
const asarSrc = path.join(APP, 'Contents/Resources/app.asar');
const asarTmp = path.resolve('release/mac-arm64/_app.asar.tmp');
fs.copyFileSync(asarSrc, asarTmp);

// 기존 앱 번들 제거 후 원본 Electron.app 복사
execSync(`rm -rf "${APP}"`);
execSync(`cp -R "${NODE_ELECTRON}" "${APP}"`);

// 메인 실행파일 이름 변경
fs.renameSync(
  path.join(APP, 'Contents/MacOS/Electron'),
  path.join(APP, 'Contents/MacOS/poketmon-idle')
);

// 헬퍼 앱 이름 변경
for (const suffix of ['', ' (GPU)', ' (Renderer)', ' (Plugin)']) {
  const oldDir = path.join(APP, `Contents/Frameworks/Electron Helper${suffix}.app`);
  const newDir = path.join(APP, `Contents/Frameworks/포켓몬키우기 Helper${suffix}.app`);
  if (fs.existsSync(oldDir)) {
    fs.renameSync(oldDir, newDir);
    fs.renameSync(
      path.join(newDir, `Contents/MacOS/Electron Helper${suffix}`),
      path.join(newDir, `Contents/MacOS/포켓몬키우기 Helper${suffix}`)
    );
  }
}

// app.asar 복원
fs.copyFileSync(asarTmp, path.join(APP, 'Contents/Resources/app.asar'));
fs.unlinkSync(asarTmp);

// Info.plist 설정
const plistPath = path.join(APP, 'Contents/Info.plist');
const asarHash = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(APP, 'Contents/Resources/app.asar')))
  .digest('hex');

const set = (key, val) =>
  execSync(`/usr/libexec/PlistBuddy -c "Set :${key} ${val}" "${plistPath}"`);
const add = (key, type, val) =>
  execSync(`/usr/libexec/PlistBuddy -c "Add :${key} ${type} ${val}" "${plistPath}"`);

set('CFBundleIdentifier', 'com.poketmonidle.app');
set('CFBundleName', '포켓몬키우기');
set('CFBundleDisplayName', '포켓몬키우기');
set('CFBundleExecutable', 'poketmon-idle');
set('CFBundleVersion', '1.0.0');
set('CFBundleShortVersionString', '1.0.0');

// ElectronAsarIntegrity 설정
try {
  execSync(`/usr/libexec/PlistBuddy -c "Delete :ElectronAsarIntegrity" "${plistPath}" 2>/dev/null || true`);
} catch {}
execSync(`/usr/libexec/PlistBuddy -c "Add :ElectronAsarIntegrity dict" "${plistPath}"`);
execSync(`/usr/libexec/PlistBuddy -c "Add :ElectronAsarIntegrity:'Resources/app.asar' dict" "${plistPath}"`);
execSync(`/usr/libexec/PlistBuddy -c "Add :ElectronAsarIntegrity:'Resources/app.asar':algorithm string SHA256" "${plistPath}"`);
execSync(`/usr/libexec/PlistBuddy -c "Add :ElectronAsarIntegrity:'Resources/app.asar':hash string ${asarHash}" "${plistPath}"`);

// 서명 (--deep 사용 시 SIGBUS 발생하므로 주요 컴포넌트 개별 서명)
execSync(`xattr -cr "${APP}"`);
execSync(`codesign --force --sign - "${path.join(APP, 'Contents/Frameworks/Electron Framework.framework')}"`);
for (const suffix of ['', ' (GPU)', ' (Renderer)', ' (Plugin)']) {
  const helperApp = path.join(APP, `Contents/Frameworks/포켓몬키우기 Helper${suffix}.app`);
  if (fs.existsSync(helperApp)) {
    execSync(`codesign --force --sign - --entitlements "${ENTITLEMENTS}" "${helperApp}"`);
  }
}
execSync(`codesign --force --sign - --entitlements "${ENTITLEMENTS}" "${APP}"`);

console.log('✓ 앱 번들 수정 완료');
