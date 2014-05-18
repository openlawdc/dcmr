import glob
from unidecode import unidecode
from sh import catdoc

for f in glob.glob('dcregs/*/*/*.doc'):
    e = catdoc(f)
    s = unicode(e.stdout, 'utf-8', errors='ignore')
    cd = unidecode(s)
    open(f.replace('dcregs/*', 'text/').replace('.doc', '.txt'), 'w+').write(cd)
