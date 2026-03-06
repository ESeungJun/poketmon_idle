#!/usr/bin/env node
// electron-builder가 바이너리를 수정해서 크래시가 발생하므로
// node_modules의 원본 Electron.app 전체를 기반으로 앱 번들을 재구성한다.

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const APP = path.resolve('release/mac-universal/poketmon-idle.app');
const NODE_ELECTRON = path.resolve('node_modules/electron/dist/Electron.app');
const ENTITLEMENTS = path.resolve('entitlements.plist');

// electron-builder가 생성한 app.asar 저장
const asarSrc = path.join(APP, 'Contents/Resources/app.asar');
const asarTmp = path.resolve('release/mac-universal/_app.asar.tmp');
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

// macOS 26에서 앱 번들 내부 경로의 바이너리는 직접 서명이 안 됨.
// /tmp에 복사 후 서명하고 다시 이동하는 방식으로 우회.
function signBinary(binaryPath) {
  const tmp = path.join(os.tmpdir(), `sign_tmp_${Date.now()}_${path.basename(binaryPath)}`);
  fs.copyFileSync(binaryPath, tmp);
  execSync(`xattr -cr "${tmp}"`);
  spawnSync('codesign', ['--remove-signature', tmp], { stdio: 'ignore' });
  execSync(`codesign --force --sign - "${tmp}"`);
  fs.copyFileSync(tmp, binaryPath);
  fs.unlinkSync(tmp);
}

execSync(`xattr -cr "${APP}"`);

// chrome_crashpad_handler 서명
const crashpadHandler = path.join(APP, 'Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler');
if (fs.existsSync(crashpadHandler)) {
  signBinary(crashpadHandler);
}

// Electron Framework 서명
execSync(`codesign --force --sign - "${path.join(APP, 'Contents/Frameworks/Electron Framework.framework')}"`);

// 나머지 프레임워크 서명 (Mantle, ReactiveObjC, Squirrel 등)
for (const fw of ['Mantle.framework', 'ReactiveObjC.framework', 'Squirrel.framework']) {
  const fwPath = path.join(APP, 'Contents/Frameworks', fw);
  if (fs.existsSync(fwPath)) {
    execSync(`codesign --force --sign - "${fwPath}"`);
  }
}

// 헬퍼 앱 서명
for (const suffix of ['', ' (GPU)', ' (Renderer)', ' (Plugin)']) {
  const helperApp = path.join(APP, `Contents/Frameworks/포켓몬키우기 Helper${suffix}.app`);
  if (fs.existsSync(helperApp)) {
    const helperBinary = path.join(helperApp, `Contents/MacOS/포켓몬키우기 Helper${suffix}`);
    if (fs.existsSync(helperBinary)) {
      signBinary(helperBinary);
    }
    execSync(`codesign --force --sign - --entitlements "${ENTITLEMENTS}" "${helperApp}"`);
  }
}

// 메인 실행파일 서명
signBinary(path.join(APP, 'Contents/MacOS/poketmon-idle'));

// 메인 앱 서명
execSync(`codesign --force --sign - --entitlements "${ENTITLEMENTS}" "${APP}"`);

console.log('✓ 앱 번들 수정 완료');
