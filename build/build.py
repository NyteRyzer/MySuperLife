# Bundles index.html + css + js into single-file builds.
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
css = (root / 'css/style.css').read_text()
css = css.replace(':root {', ':root {\n  color-scheme: dark;', 1)
html = (root / 'index.html').read_text()
body = re.search(r'<body>(.*?)<script', html, re.S).group(1).strip()
js = '\n'.join((root / f'js/{n}.js').read_text() for n in ['data', 'game', 'super', 'events', 'actions', 'activities', 'shop', 'battle', 'city', 'life2', 'meta', 'immersion', 'quests', 'ui'])
fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;700;900&display=swap">'
inner = f"{fonts}\n<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n"
# Artifact build (host supplies the html/head/body skeleton)
(root / 'build/artifact.html').write_text('<title>MySuperLife</title>\n' + inner)
# Standalone build: one file, open in any browser
standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  f'<title>MySuperLife</title>\n{fonts}\n<style>\n{css}\n</style>\n</head>\n<body>\n{body}\n'
  f'<script>\n{js}\n</script>\n</body>\n</html>\n')
(root / 'MySuperLife.html').write_text(standalone)
