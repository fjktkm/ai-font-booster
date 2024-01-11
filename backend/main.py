from fastapi import FastAPI, UploadFile, File, Response
from fontTools.ttLib import TTFont
import random
import shutil
import tempfile
import os

app = FastAPI()


def merge_fonts(font1_path, font2_path, output_path):
    # フォントを読み込む
    font1 = TTFont(font1_path, fontNumber=0)  # インデックス0を使用
    font2 = TTFont(font2_path, fontNumber=0)  # インデックス0を使用

    # 新しいフォントを作成
    merged_font = TTFont(font1_path, fontNumber=0)

    # グリフのリストを取得
    glyphs1 = set(font1.getGlyphOrder())
    glyphs2 = set(font2.getGlyphOrder())

    # 共通のグリフをランダムに選択し、font2 にのみ存在するグリフを追加
    # TrueType フォントの場合のみに対応
    for glyph in glyphs2:
        if glyph in glyphs1:
            # 共通のグリフの場合、ランダムに選択
            chosen_font = random.choice([font1, font2])
            merged_font["glyf"][glyph] = chosen_font["glyf"][glyph]
        else:
            # font2 にのみ存在するグリフの場合、追加
            merged_font["glyf"][glyph] = font2["glyf"][glyph]

    # フォントを一時的なファイルに保存し、そのパスを返す
    output_path = "merged_font.ttf"
    merged_font.save(output_path)
    return output_path


@app.post("/merge-fonts/")
async def create_upload_files(
    font1: UploadFile = File(...), font2: UploadFile = File(...)
):
    with tempfile.NamedTemporaryFile(
        delete=False
    ) as temp_file1, tempfile.NamedTemporaryFile(delete=False) as temp_file2:
        # アップロードされたフォントファイルを一時ファイルに保存
        shutil.copyfileobj(font1.file, temp_file1)
        shutil.copyfileobj(font2.file, temp_file2)

        # ファイルパスを取得
        temp_file1_path = temp_file1.name
        temp_file2_path = temp_file2.name

    # フォントをマージし、一時ディレクトリに保存
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ttf") as merged_font_file:
        merged_font_path = merge_fonts(
            temp_file1_path, temp_file2_path, merged_font_file.name
        )

    # 一時ファイルを削除
    os.remove(temp_file1_path)
    os.remove(temp_file2_path)

    # マージされたフォントファイルの内容を読み込んで返す
    with open(merged_font_path, "rb") as file:
        merged_font_data = file.read()
    os.remove(merged_font_path)  # マージされたフォントファイルを削除

    # ファイルのダウンロードを提供
    return Response(
        content=merged_font_data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=merged_font.ttf"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, port=50113)
