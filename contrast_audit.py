from pathlib import Path

def channel(value):
    value /= 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4

def luminance(hex_color):
    rgb = [int(hex_color[i:i+2], 16) for i in (1, 3, 5)]
    r, g, b = [channel(value) for value in rgb]
    return 0.2126*r + 0.7152*g + 0.0722*b

def ratio(foreground, background):
    a, b = luminance(foreground), luminance(background)
    return (max(a,b) + 0.05) / (min(a,b) + 0.05)

pairs = [
    ("#0b5d4d", "#ffffff", "green text/icon on white"),
    ("#8d2638", "#ffffff", "dark red text/icon on white"),
    ("#33423f", "#ffffff", "charcoal chart/text on white"),
    ("#66736f", "#ffffff", "gray chart/text on white"),
    ("#0b5d4d", "#f5f1e8", "green on sand background"),
]
lines = ["# Palette contrast audit", "", "Text-bearing combinations are checked against WCAG AA normal-text target 4.5:1.", "Gold (#c9ab72) is used only as a non-text accent/series color; text on gold is not used.", ""]
for fg, bg, label in pairs:
    value = ratio(fg, bg)
    result = "PASS" if value >= 4.5 else "REVIEW"
    lines.append(f"- {label}: {fg} on {bg} = {value:.2f}:1 [{result}]")
Path('/home/ubuntu/employee-status-dashboard/contrast-audit.md').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
