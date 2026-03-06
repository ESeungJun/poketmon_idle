---
name: add-pokemon-sprite
description: 새 포켓몬 픽셀아트 추가 전체 과정을 안내한다. PNG 변환부터 anims 파일 합치기, PetCanvas/PokemonStats 등록, 진화 단계 설정, 미리보기 확인까지 순서대로 진행한다.
---

# 새 포켓몬 픽셀아트 추가 스킬

사용자가 추가할 포켓몬의 **도감번호(dexNum)** 와 **진화 단계(stage1/2/3)** 를 먼저 확인한다.
모르면 물어본다.

---

## 1단계: PNG 준비 확인

아래 두 파일이 존재하는지 확인한다:
- `pixel-art-source/normal/{dexNum}.png`
- `pixel-art-source/sleep/{dexNum}.png`

파일이 없으면 사용자에게 준비를 요청하고 중단한다.

---

## 2단계: convert.py로 변환

```bash
cd pixel-art-source
python convert.py normal/{dexNum}.png normal/{dexNum}-anims.js
python convert.py sleep/{dexNum}.png sleep/{dexNum}-anims.js
```

**stage3 포켓몬은 32열 고정 필요:**
```bash
python convert.py normal/{dexNum}.png normal/{dexNum}-anims.js 20 31
python convert.py sleep/{dexNum}.png sleep/{dexNum}-anims.js 20 31
```

변환 결과 파일(`normal/{dexNum}-anims.js`, `sleep/{dexNum}-anims.js`)을 읽어
행/열 수와 COLORS 팔레트를 확인한다.

---

## 3단계: anims 파일 합치기

`src/components/Pet/{dexNum}-anims.js` 를 새로 만든다:

```js
// {포켓몬 이름}({dexNum}) — pixel art
const _ = null

// normal에서 가져옴
export const COLORS = { ... }
export const BASE_BODY = [ ... ]

// sleep에서 가져옴
export const SLEEP_COLORS = { ... }
export const SLEEP_BODY = [ ... ]
```

**필수 검증:**
- `COLORS.outline` 이 `'#191919'` 인지 확인. 다르면 수정.
- `SLEEP_COLORS.outline` 도 동일하게 확인.

---

## 4단계: 외곽 outline 검증

스프라이트 가장자리(null과 맞닿는 픽셀)가 `'body'`로 되어 있으면 `'outline'`으로 교체한다.

확인 방법: 미리보기 서버(5단계)로 먼저 확인하고 수정하거나,
`BASE_BODY`의 첫 행·마지막 행·각 행의 첫/마지막 non-null 픽셀을 직접 검토.

---

## 5단계: PetCanvas.jsx + PokemonStats.jsx 등록

**두 파일 모두** 업데이트해야 한다. 하나라도 빠지면 스탯창 이미지가 안 나온다.

`src/components/Pet/PetCanvas.jsx`:
```js
import * as pokemon{DexNum}Data from './{dexNum}-anims'

const PIXEL_ART = {
  // 기존 항목들...
  {speciesId}: pokemon{DexNum}Data,
}
```

`src/components/Panel/PokemonStats.jsx`:
```js
import * as pokemon{DexNum}Data from '../Pet/{dexNum}-anims'

const PIXEL_ART = {
  // 기존 항목들...
  {speciesId}: pokemon{DexNum}Data,
}
```

---

## 6단계: 진화 단계 등록 (stage2/3만)

stage1이면 이 단계 건너뜀.

**`src/components/Pet/PetCanvas.jsx`:**
```js
const STAGE2 = new Set([..., '{speciesId}'])  // stage2면
const STAGE3 = new Set([..., '{speciesId}'])  // stage3면
```

**`electron/main.js`:**
```js
const STAGE2_SPECIES = new Set([..., '{speciesId}'])
const STAGE3_SPECIES = new Set([..., '{speciesId}'])
```

---

## 7단계: 미리보기 서버로 확인

서버가 실행 중이 아니면 시작한다:
```bash
cd pixel-art-source && node generate-preview.js
# → http://localhost:3131
```

사용자에게 브라우저에서 해당 포켓몬을 선택해 Normal/Sleep 모드 모두 확인하도록 안내한다.
외곽 outline 누락이나 색상 오류 발견 시 3~4단계로 돌아가 수정한다.

---

## 8단계: pokemon.js 데이터 등록 확인

`src/data/pokemon.js`에 해당 포켓몬 항목이 있는지 확인한다.
없으면 기존 포켓몬 항목을 참고해 추가하고, `/verify-pokemon-ko` 스킬로 기술명 검증한다.

---

## 9단계: 빌드 확인

```bash
npm run build
```

빌드 성공 여부를 보고한다.
