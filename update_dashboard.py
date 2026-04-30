
import re

with open("Saber11_Matematicas_2026_10Encuentros.html", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for the start of enc-1
print("Found enc-1 at:", text.find("id=\"enc-1\""))
print("Found enc-0 at:", text.find("id=\"enc-0\""))

# Regex to find enc_1 or whatever is the first encounter 
match = re.search(r'<div class="encuentro.*?" id="enc-[0-1]">.*?(?=<div class="q-card">|Pregunta)', text, re.DOTALL)
if match:
    print("MATCH START:", match.start())
    print("MATCH END:", match.end())
    print("Content preview:")
    print(match.group(0)[-200:])


