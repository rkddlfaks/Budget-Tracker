from PIL import Image, ImageDraw

def round_corners(im, rad):
    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
    alpha = Image.new('L', im.size, 255)
    w, h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)
    return im

try:
    img = Image.open('public/logo.png').convert("RGBA")
    # Using radius = 1/5 of the width for a nice rounded square
    rad = int(img.size[0] / 5)
    rounded_img = round_corners(img, rad)
    rounded_img.save('public/logo.png', 'PNG')
    print("Successfully rounded corners.")
except Exception as e:
    print(f"Error: {e}")
