#!/usr/bin/env python3
"""
픽셀아트 이미지를 20x20 JS 그리드 코드로 변환
사용법: python3 convert.py <파일명.png> <포켓몬이름>
"""
import sys
from PIL import Image
import json
from collections import Counter

def get_pixel_size(img):
    """이미지에서 하나의 도트 픽셀 크기 자동 감지"""
    w, h = img.size
    arr = img.load()
    # 첫 번째 행에서 색상이 바뀌는 간격으로 픽셀 크기 추정
    sizes = []
    for axis in range(2):
        prev_color = None
        run = 1
        runs = []
        dim = w if axis == 0 else h
        for i in range(1, dim):
            if axis == 0:
                color = arr[i, h // 2][:3]
            else:
                color = arr[w // 2, i][:3]
            if color == prev_color:
                run += 1
            else:
                if prev_color is not None and run > 2:
                    runs.append(run)
                run = 1
            prev_color = color
        if runs:
            sizes.append(round(sum(runs) / len(runs)))
    return max(1, round(sum(sizes) / len(sizes))) if sizes else 55

def color_distance(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

def quantize_colors(color_list, threshold=30):
    """비슷한 색상끼리 묶어 팔레트 생성"""
    palette = []
    for c in color_list:
        for p in palette:
            if color_distance(c, p) < threshold:
                break
        else:
            palette.append(c)
    return palette

def nearest_color(c, palette):
    return min(palette, key=lambda p: color_distance(c, p))

def rgb_to_hex(r, g, b):
    return f'#{r:02X}{g:02X}{b:02X}'

def convert(filepath, pokemon_name, grid_size=20):
    img = Image.open(filepath).convert('RGBA')
    w, h = img.size
    arr = img.load()

    # 픽셀 크기 감지
    dot = max(1, min(w, h) // grid_size)
    print(f"이미지 크기: {w}x{h}, 도트 크기: ~{dot}px")

    # 실제 그리드 크기 계산
    actual_cols = w // dot
    actual_rows = h // dot
    print(f"감지된 그리드: {actual_cols}x{actual_rows}")

    # 각 셀의 대표 색상 추출
    cells = []
    for row in range(actual_rows):
        row_cells = []
        for col in range(actual_cols):
            # 셀 중앙 픽셀 샘플링
            x = col * dot + dot // 2
            y = row * dot + dot // 2
            if x < w and y < h:
                px = arr[x, y]
                if len(px) == 4 and px[3] < 50:  # 투명
                    row_cells.append(None)
                else:
                    row_cells.append(px[:3])
            else:
                row_cells.append(None)
        cells.append(row_cells)

    white = (255, 255, 255)

    # 바깥 배경 flood-fill로 마킹 (4방향)
    bg_mask = [[False] * actual_cols for _ in range(actual_rows)]
    queue = []
    for r in range(actual_rows):
        for c in [0, actual_cols - 1]:
            if cells[r][c] is not None and color_distance(cells[r][c], white) < 40:
                queue.append((r, c))
    for c in range(actual_cols):
        for r in [0, actual_rows - 1]:
            if cells[r][c] is not None and color_distance(cells[r][c], white) < 40:
                queue.append((r, c))
    visited = set()
    while queue:
        r, c = queue.pop()
        if (r, c) in visited:
            continue
        visited.add((r, c))
        if r < 0 or r >= actual_rows or c < 0 or c >= actual_cols:
            continue
        px = cells[r][c]
        if px is None or color_distance(px, white) < 40:
            bg_mask[r][c] = True
            for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                queue.append((r+dr, c+dc))

    # 사용된 색상 수집 (배경 제외)
    all_colors = [cells[r][c] for r in range(actual_rows) for c in range(actual_cols)
                  if cells[r][c] is not None and not bg_mask[r][c]]
    color_counts = Counter(all_colors)

    # 흰색 포함한 전체 팔레트 생성 (내부 흰색 보존)
    unique_colors = [c for c, _ in sorted(color_counts.items(), key=lambda x: -x[1])]
    palette = quantize_colors(unique_colors, threshold=35)
    print(f"팔레트 색상 수: {len(palette)}")

    # 색상에 이름 부여
    color_names = {}
    color_name_list = [
        'outline', 'body', 'bodyL', 'bodyD', 'belly',
        'shadow', 'accent', 'highlight', 'detail1', 'detail2',
        'detail3', 'detail4', 'detail5', 'detail6', 'detail7',
        'detail8', 'detail9', 'detail10',
    ]
    sorted_palette = sorted(palette, key=lambda c: sum(c))
    for i, c in enumerate(sorted_palette):
        name = color_name_list[i] if i < len(color_name_list) else f'c{i}'
        color_names[c] = name

    # 원본 크기 그대로 사용 (패딩 없음)
    grid = []
    for row in range(actual_rows):
        grid_row = []
        for col in range(actual_cols):
            c = cells[row][col]
            if c is not None and not bg_mask[row][col]:
                nearest = nearest_color(c, sorted_palette)
                grid_row.append(color_names[nearest])
            else:
                grid_row.append(None)
        grid.append(grid_row)

    # JS 출력
    js_colors = "export const COLORS = {\n"
    for c, name in color_names.items():
        js_colors += f"  {name}: '{rgb_to_hex(*c)}',\n"
    js_colors += "}\n"

    js_grid = f"// grid: {actual_cols}×{actual_rows}\nexport const BASE_BODY = [\n"
    for r, row in enumerate(grid):
        items = []
        for cell in row:
            if cell is None:
                items.append("_")
            else:
                items.append(f"'{cell}'")
        js_grid += f"/* row {r:2d} */ [{', '.join(items)}],\n"
    js_grid += "]\n"

    output = f"""// {pokemon_name} — pixel art (auto-converted from {actual_cols}×{actual_rows})
const _ = null

{js_colors}
{js_grid}"""

    out_file = filepath.replace('.png', '-anims.js')
    with open(out_file, 'w') as f:
        f.write(output)
    print(f"저장 완료: {out_file}")
    print("\n=== COLORS ===")
    for c, name in color_names.items():
        print(f"  {name}: {rgb_to_hex(*c)}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("사용법: python3 convert.py <파일.png> <이름>")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
