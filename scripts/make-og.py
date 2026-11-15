
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
PAD = 72
MAXW = W - PAD * 2

paper = (246, 242, 233)
ink = (26, 24, 21)
muted = (92, 87, 78)
accent = (31, 75, 63)
line = (217, 210, 195)

SERIF_BOLD = "/usr/share/fonts/google-noto/NotoSerif-Bold.ttf"
SANS = "/usr/share/fonts/google-noto/NotoSans-Regular.ttf"
SANS_BOLD = "/usr/share/fonts/google-noto/NotoSans-Bold.ttf"
if not os.path.exists(SANS):
    SANS = "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Regular.ttf"
    SANS_BOLD = "/usr/share/fonts/liberation-sans-fonts/LiberationSans-Bold.ttf"

BARIS = ["Latihan soal dengan timer,", "lengkap dengan pembahasan."]

# Ukuran judul dipilih otomatis: yang terbesar tetapi masih di dalam margin.
probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
ukuran = 96
while ukuran > 40:
    font = ImageFont.truetype(SERIF_BOLD, ukuran)
    # 24px ruang aman supaya ujung baris tidak menempel bingkai.
    if max(probe.textlength(t, font=font) for t in BARIS) <= MAXW - 100:
        break
    ukuran -= 2

f_head = ImageFont.truetype(SERIF_BOLD, ukuran)
f_label = ImageFont.truetype(SANS_BOLD, 28)
f_sub = ImageFont.truetype(SANS, 34)
f_brand = ImageFont.truetype(SERIF_BOLD, 44)
f_url = ImageFont.truetype(SANS, 28)
f_mark = ImageFont.truetype(SERIF_BOLD, 34)

img = Image.new("RGB", (W, H), paper)
d = ImageDraw.Draw(img)


def track(text):
    # jarak antar huruf tipis saja: terlalu lebar membuat baris ini kabur di pratinjau kecil
    return "\u2009".join(list(text))


d.text((PAD, 78), track("TRYOUT UTBK SNBT · UJIAN SEKOLAH SMA"), font=f_label, fill=accent)

y = 138
for baris in BARIS:
    d.text((PAD, y), baris, font=f_head, fill=ink)
    y += int(ukuran * 1.18)

d.text((PAD, y + 62), "198 soal lengkap dengan kunci dan pembahasan", font=f_sub, fill=muted)
d.text((PAD, y + 112), "7 subtes UTBK SNBT dan 10 mapel sekolah", font=f_sub, fill=muted)

d.line([(PAD, 476), (W - PAD, 476)], fill=line, width=2)

d.rounded_rectangle([PAD, 506, PAD + 56, 506 + 56], radius=10, fill=accent)
tw = d.textlength("T", font=f_mark)
d.text((PAD + (56 - tw) / 2, 512), "T", font=f_mark, fill=paper)
d.text((PAD + 84, 514), "TryOutku", font=f_brand, fill=ink)

url = "tryoutku.pages.dev"
d.text((W - PAD - d.textlength(url, font=f_url), 532), url, font=f_url, fill=muted)

d.rectangle([24, 24, W - 24, H - 24], outline=line, width=2)

os.makedirs("public", exist_ok=True)
img.save("public/og.png", optimize=True)

small = img.resize((300, 158), Image.Resampling.LANCZOS)
small.save("/home/rezal/.hermes/cache/scratch/og-thumb.png")

icon = Image.new("RGB", (180, 180), accent)
di = ImageDraw.Draw(icon)
fm = ImageFont.truetype(SERIF_BOLD, 118)
w = di.textlength("T", font=fm)
di.text(((180 - w) / 2, 24), "T", font=fm, fill=paper)
icon.save("public/apple-touch-icon.png", optimize=True)
icon.resize((32, 32), Image.Resampling.LANCZOS).save("public/favicon.ico", sizes=[(32, 32)])

print("ukuran judul:", ukuran, "px")
print("lebar baris terpanjang:", round(max(probe.textlength(t, font=f_head) for t in BARIS)), "dari maksimum", MAXW)
print("og.png", os.path.getsize("public/og.png"), "bytes")
