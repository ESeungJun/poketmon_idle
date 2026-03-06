// 외곽에 접한 'body' 픽셀 → 'outline' 으로 교체
const fs = require('fs')
const vm = require('vm')
const path = require('path')

const FILES = [
  '../src/components/Pet/3-anims.js',
  '../src/components/Pet/6-anims.js',
  '../src/components/Pet/9-anims.js',
]

function loadBody(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  let code = raw.replace(/export const /g, 'const ').replace(/const _ = null\s*\n/, '')
  const __out = {}
  vm.runInNewContext(`const _ = null;\n${code}\n__out.BASE_BODY = BASE_BODY`, { __out })
  return __out.BASE_BODY
}

function isNull(body, r, c) {
  if (r < 0 || r >= body.length) return true
  if (c < 0 || c >= (body[r]?.length ?? 0)) return true
  return body[r][c] === null
}

function fix(filePath) {
  const abs = path.resolve(__dirname, filePath)
  let src = fs.readFileSync(abs, 'utf-8')
  const body = loadBody(abs)
  let count = 0

  for (let r = 0; r < body.length; r++) {
    for (let c = 0; c < (body[r]?.length ?? 0); c++) {
      if (body[r][c] !== 'body') continue
      const adj = [[-1,0],[1,0],[0,-1],[0,1]]
      const onEdge = adj.some(([dr,dc]) => isNull(body, r+dr, c+dc))
      if (!onEdge) continue

      // row 주석 기준으로 해당 셀만 교체
      // "/* row  r */" 또는 "/* row r */" 패턴으로 해당 행 찾기
      const rowPat = new RegExp(`(\/\* row\s+${r}\s+\*\/[^\n]*)`, 'g')
      src = src.replace(rowPat, (line) => {
        // 해당 컬럼 위치의 'body' 토큰 교체 (c번째 cell)
        let ci = 0
        return line.replace(/'body'|_/g, (tok) => {
          const result = (ci === c && tok === "'body'") ? "'outline'" : tok
          if (tok !== ',') ci++  // 콤마는 카운트 안 함
          return result
        })
      })
      count++
    }
  }
  fs.writeFileSync(abs, src, 'utf-8')
  console.log(`${path.basename(abs)}: ${count}개 픽셀 교체`)
}

FILES.forEach(fix)
