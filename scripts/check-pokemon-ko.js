#!/usr/bin/env node
// PostToolUse 훅: pokemon.js / items.js 편집 후 기술명이 공식 한국어인지 검사
// 승인 목록에 없는 새 이름만 stderr에 경고 출력

const fs = require('fs')
const path = require('path')

let raw = ''
process.stdin.on('data', d => (raw += d))
process.stdin.on('end', () => {
  let data
  try { data = JSON.parse(raw || '{}') } catch { process.exit(0) }

  const filePath = (data.tool_input?.file_path || '').replace(/\\/g, '/')
  const isPokemonJs = filePath.endsWith('src/data/pokemon.js')
  const isItemsJs   = filePath.endsWith('src/components/Shop/items.js')
  if (!isPokemonJs && !isItemsJs) process.exit(0)

  const content = fs.readFileSync(filePath.replace(/\//g, path.sep), 'utf8')

  // 기술명 추출 패턴
  const moveNames = new Set()
  if (isPokemonJs) {
    // baseMoves 안의 { name: '...' } 엔트리만 (type 필드가 함께 있음)
    for (const m of content.matchAll(/\{\s*name:\s*'([^']+)',\s*type:/g)) {
      moveNames.add(m[1])
    }
  }
  if (isItemsJs) {
    for (const m of content.matchAll(/moveName:\s*'([^']+)'/g)) {
      moveNames.add(m[1])
    }
  }

  const approvedPath = path.join(__dirname, '../.claude/approved-pokemon-names.json')
  const approved = new Set(JSON.parse(fs.readFileSync(approvedPath, 'utf8')))

  const unknown = [...moveNames].filter(n => !approved.has(n))
  if (unknown.length > 0) {
    process.stderr.write(
      `\n[포켓몬 이름 검증] 승인 목록에 없는 기술명 발견:\n` +
      unknown.map(n => `  - ${n}`).join('\n') +
      `\nPokeAPI로 공식 한국어명인지 확인하세요.\n` +
      `확인 후 .claude/approved-pokemon-names.json 에 추가하면 다음부터 경고가 뜨지 않습니다.\n\n`
    )
  }
})
