import re

with open(r'app/solutions/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

stops = []
for i in range(0, 100, 2):
    a = i / 100
    stops.append(f'  "rgba(28,28,28,{a:.2f}) {i}%",')
stops_str = '\n'.join(stops)

new_bottom_gradient = f'''        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "200px",
            background: [
              "linear-gradient(to bottom,",
{stops_str}
              "rgba(28,28,28,1.00) 100%)",
            ].join("\\n              "),
          }}
        />'''

old_block_pattern = r'        <div\s+className="absolute inset-0"\s+style=\{\{\s+background: "linear-gradient\(to bottom, rgba\(28,28,28,0\.00\) 0%,.*?100%\)"\s+\}\}\s+/>'

match = re.search(old_block_pattern, content, re.DOTALL)
if match:
    old_block = match.group(0)
    top_gradient = '''        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(28,28,28,1) 0%, rgba(28,28,28,1) 10%, transparent 32%)",
          }}
        />'''
    content = content.replace(old_block, top_gradient + '\n' + new_bottom_gradient)
    with open(r'app/solutions/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done')
elif 'absolute bottom-0 left-0 right-0' in content:
    print('Already fixed')
else:
    print('Unexpected state')
