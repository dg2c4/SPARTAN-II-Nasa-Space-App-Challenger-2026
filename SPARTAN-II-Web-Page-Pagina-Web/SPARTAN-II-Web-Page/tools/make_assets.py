#!/usr/bin/env python3
"""Genera las ilustraciones SVG de SPARTANS II (capas del hero, rovers y artes de tarjetas). Uso: python3 tools/make_assets.py"""
import math, random, os
OUT=os.path.join(os.path.dirname(__file__),'..','assets','img'); os.makedirs(OUT,exist_ok=True)
R=random.Random(11)
def save(n,s): open(os.path.join(OUT,n),'w').write(s)
def svg(w,h,body,defs=''): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{defs}</defs>{body}</svg>'
def lg(i,stops,x2=0,y2=1): return f'<linearGradient id="{i}" x1="0" y1="0" x2="{x2}" y2="{y2}">'+''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o,c,a in stops)+'</linearGradient>'
def rg(i,stops,cx=.5,cy=.5,r=.5): return f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">'+''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o,c,a in stops)+'</radialGradient>'
def rock(cx,cy,w,h,fill,rim='#E7A0B5',ro=.5):
    n=R.randint(6,9); pts=[(cx-w/2,cy)]
    for k in range(1,n): t=math.pi*k/n; pts.append((cx-math.cos(t)*w/2*R.uniform(.82,1.05), cy-math.sin(t)*h*R.uniform(.7,1.05)))
    pts.append((cx+w/2,cy)); d='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)+' Z'; top='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts[1:n//2+2])
    return f'<path d="{d}" fill="{fill}"/><path d="{top}" fill="none" stroke="{rim}" stroke-opacity="{ro}" stroke-width="2.2" stroke-linecap="round"/>'
def ridge(y0,amp,step,seed,x0=-60,x1=1660):
    r=random.Random(seed); pts=[]; x=x0
    while x<=x1: pts.append((x,y0-r.uniform(0,amp)*(.5+.5*math.sin(x/230+seed)))); x+=r.randint(*step)
    return pts
def poly(pts,close_y=900): return 'M'+' L'.join(f'{x:.0f},{y:.0f}' for x,y in pts)+f' L{pts[-1][0]},{close_y} L{pts[0][0]},{close_y} Z'

# ---------- HERO: cielo ----------
stars=''.join(f'<circle cx="{R.uniform(0,1600):.0f}" cy="{R.uniform(0,520)**1:.0f}" r="{R.choice([.7,.9,1.2,1.6]):.1f}" fill="#F3EAF0" opacity="{R.uniform(.25,.9):.2f}"/>' for _ in range(160))
sky=f'''<rect width="1600" height="900" fill="url(#g)"/>{stars}
<ellipse cx="1130" cy="650" rx="520" ry="300" fill="url(#sun)"/><circle cx="1130" cy="650" r="34" fill="#F3EAF0" opacity=".95"/>
<g filter="url(#b)" fill="#E7A0B5">{''.join(f'<ellipse cx="{R.uniform(100,1500):.0f}" cy="{R.uniform(430,600):.0f}" rx="{R.uniform(120,320):.0f}" ry="{R.uniform(8,20):.0f}" opacity="{R.uniform(.08,.22):.2f}"/>' for _ in range(9))}</g>
<g><circle cx="360" cy="190" r="22" fill="#cfa7c0"/><circle cx="352" cy="184" r="22" fill="#090914" opacity=".35"/><circle cx="470" cy="260" r="9" fill="#b99ab4"/></g>'''
save('layer-sky.svg',svg(1600,900,sky,lg('g',[(0,'#090914',1),(.3,'#11152D',1),(.5,'#24153F',1),(.68,'#6339A5',1),(.82,'#B84C36',1),(.93,'#E87843',1),(1,'#E7A0B5',1)])+rg('sun',[(0,'#F3EAF0',.85),(.25,'#E87843',.45),(1,'#E87843',0)])+'<filter id="b"><feGaussianBlur stdDeviation="9"/></filter>'))
# ---------- HERO: lejos ----------
olym='M-60,640 C200,630 420,560 600,500 C680,470 720,440 780,436 L800,452 L840,444 C900,452 960,480 1060,520 C1250,590 1420,630 1660,642 L1660,900 L-60,900 Z'
far=f'''<path d="{poly(ridge(640,70,(40,110),3))}" fill="url(#m2)" opacity=".85"/><path d="{olym}" fill="url(#m1)"/>
<path d="M780,436 L800,452 L840,444" fill="none" stroke="#E7A0B5" stroke-opacity=".5" stroke-width="2"/>
<path d="{poly(ridge(690,95,(30,90),8))}" fill="url(#m3)"/><rect y="560" width="1600" height="340" fill="url(#haze)"/>'''
save('layer-far.svg',svg(1600,900,far,lg('m1',[(0,'#7b4a86',1),(1,'#3d2250',1)])+lg('m2',[(0,'#8a5a95',1),(1,'#4a2a62',1)])+lg('m3',[(0,'#4b2a66',1),(1,'#2a1840',1)])+lg('haze',[(0,'#E7A0B5',0),(.6,'#B84C36',.28),(1,'#E87843',.45)])))
# ---------- HERO: medio + estación ----------
def dome(cx,cy,r,lit=True):
    win=''.join(f'<rect x="{cx-r*.5+i*r*.34:.0f}" y="{cy-r*.45:.0f}" width="{r*.16:.0f}" height="{r*.22:.0f}" rx="2" fill="#E87843" opacity=".95"/>' for i in range(3))
    return f'<path d="M{cx-r},{cy} A{r},{r} 0 0 1 {cx+r},{cy} Z" fill="url(#hab)" stroke="#E7A0B5" stroke-opacity=".55" stroke-width="2"/><path d="M{cx-r*.7},{cy} A{r*.7},{r*.7} 0 0 1 {cx+r*.7},{cy}" fill="none" stroke="#F3EAF0" stroke-opacity=".18"/>{win}'
def hab(x,y,w,h):
    ribs=''.join(f'<line x1="{x+i*w/6:.0f}" y1="{y}" x2="{x+i*w/6:.0f}" y2="{y+h}" stroke="#090914" stroke-opacity=".35"/>' for i in range(1,6))
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2:.0f}" fill="url(#hab)" stroke="#E7A0B5" stroke-opacity=".4"/>{ribs}<rect x="{x+w*.18:.0f}" y="{y+h*.3:.0f}" width="{w*.12:.0f}" height="{h*.22:.0f}" rx="2" fill="#E87843" opacity=".9"/>'
panels=''.join(f'<polygon points="{1250+i*62},694 {1290+i*62},694 {1280+i*62},668 {1240+i*62},668" fill="#2a2f6a" stroke="#E7A0B5" stroke-opacity=".5"/><line x1="{1260+i*62}" y1="668" x2="{1270+i*62}" y2="694" stroke="#E7A0B5" stroke-opacity=".3"/>' for i in range(4))
mid=f'''<path d="{poly(ridge(700,50,(40,100),21))}" fill="#2a1840"/><path d="M900,700 L1000,672 L1500,672 L1660,700 L1660,900 L900,900Z" fill="#241438"/>
<path d="M900,700 L1000,672 L1500,672 L1660,700" fill="none" stroke="#E7A0B5" stroke-opacity=".45" stroke-width="2"/>
<g>{hab(1010,640,170,32)}{hab(1345,646,150,26)}{dome(1260,672,62)}<rect x="1180" y="656" width="30" height="10" fill="#3b2a5a"/><rect x="1322" y="660" width="26" height="9" fill="#3b2a5a"/>
<line x1="1420" y1="646" x2="1420" y2="560" stroke="#cfc3d6" stroke-width="3"/><circle cx="1420" cy="556" r="6" fill="#E87843"><animate attributeName="opacity" values="1;.2;1" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="1420" cy="556" r="22" fill="url(#gl)"><animate attributeName="opacity" values=".8;0;.8" dur="2.4s" repeatCount="indefinite"/></circle>
<path d="M1440,610 q22,-26 50,-6 l-8,10 q-18,-12 -34,4z" fill="#cfc3d6" opacity=".85"/>{panels}</g>
<g opacity=".9">{''.join(f'<circle cx="{1000+i*38}" cy="{674}" r="2.2" fill="#E87843"/>' for i in range(0,16,3))}</g>'''
save('layer-mid.svg',svg(1600,900,mid,lg('hab',[(0,'#5c4a86',1),(1,'#2a1d4a',1)])+rg('gl',[(0,'#E87843',.9),(1,'#E87843',0)])))
# ---------- HERO: primer plano ----------
near='<path d="M-60,820 C200,790 500,800 800,810 C1100,820 1400,795 1660,815 L1660,900 L-60,900Z" fill="url(#gr)"/>'
for cx,cy,w,h in [(120,880,340,250),(300,900,260,130),(60,760,120,140),(1480,890,380,260),(1330,905,240,110),(1590,780,150,150),(760,905,180,60),(980,900,140,45)]:
    near+=rock(cx,cy,w,h,'url(#rk)')
near+=''.join(f'<path d="M{R.uniform(0,1600):.0f},{R.uniform(830,890):.0f} q40,-6 90,0" stroke="#E7A0B5" stroke-opacity=".12" fill="none" stroke-width="2"/>' for _ in range(14))
near+=''.join(rock(R.uniform(0,1600),R.uniform(850,900),R.uniform(16,46),R.uniform(8,20),'#120a1f','#E87843',.4) for _ in range(22))
save('layer-near.svg',svg(1600,900,near,lg('gr',[(0,'#2a1840',1),(.4,'#150c26',1),(1,'#090914',1)])+lg('rk',[(0,'#2b1b45',1),(1,'#0b0716',1)])))
# ---------- ROVER ----------
def rover(name,variant):
    wheels=''.join(f'<g><circle cx="{x}" cy="{y}" r="27" fill="#1a1230" stroke="#cfc3d6" stroke-width="3"/><circle cx="{x}" cy="{y}" r="11" fill="#6339A5"/>'+''.join(f'<line x1="{x}" y1="{y}" x2="{x+22*math.cos(a):.0f}" y2="{y+22*math.sin(a):.0f}" stroke="#cfc3d6" stroke-opacity=".6"/>' for a in [i*math.pi/3 for i in range(6)])+'</g>' for x,y in [(70,236),(170,244),(270,236),(380,236),(480,244),(570,236)])
    mast=f'<line x1="170" y1="120" x2="170" y2="44" stroke="#cfc3d6" stroke-width="6"/><rect x="146" y="22" width="52" height="26" rx="6" fill="#2a1d4a" stroke="#F3EAF0" stroke-width="2"/><circle cx="162" cy="35" r="7" fill="#E87843"/><circle cx="182" cy="35" r="7" fill="#E7A0B5"/>'
    arm='<path d="M470,150 L520,170 L560,150" stroke="#cfc3d6" stroke-width="7" fill="none" stroke-linejoin="round"/><rect x="550" y="136" width="30" height="26" rx="5" fill="#6339A5" stroke="#F3EAF0"/>' if variant=='p' else '<path d="M470,146 L508,128 L540,150" stroke="#cfc3d6" stroke-width="7" fill="none" stroke-linejoin="round"/><circle cx="546" cy="154" r="15" fill="#6339A5" stroke="#F3EAF0" stroke-width="2"/>'
    body=f'<path d="M96,150 L130,118 L500,118 L540,150 L540,206 L96,206Z" fill="url(#bd)" stroke="#F3EAF0" stroke-opacity=".5" stroke-width="2"/><rect x="104" y="166" width="428" height="8" fill="#090914" opacity=".4"/><rect x="560" y="156" width="46" height="30" rx="8" fill="#B84C36" stroke="#E7A0B5" stroke-opacity=".6"/><path d="M96,206 L180,244 M270,206 L270,236 M380,206 L430,244 M540,206 L480,244" stroke="#cfc3d6" stroke-width="5"/>'
    ant=f'<path d="M110,118 L90,86" stroke="#cfc3d6" stroke-width="4"/><circle cx="88" cy="82" r="9" fill="#E87843"/>'
    return svg(640,290,f'<ellipse cx="320" cy="276" rx="290" ry="12" fill="#090914" opacity=".55"/>{wheels}{body}{mast}{arm}{ant}<path d="M130,118 L500,118" stroke="#E7A0B5" stroke-width="2" opacity=".7"/>',lg('bd',[(0,'#6a5a96',1),(1,'#2a1d4a',1)]))
save('rover-perseverance.svg',rover('p','p')); save('rover-curiosity.svg',rover('c','c'))

# ---------- ARTES DE TARJETAS (400x420) ----------
def card(n,body,defs,bg1,bg2): save(f'card-{n}.svg',svg(400,420,f'<rect width="400" height="420" fill="url(#bg)"/>'+body,lg('bg',[(0,bg1,1),(1,bg2,1)])+defs))
def contour(cx,cy,k,rot,col0,col1,sc=14):
    s=''
    for i in range(1,k+1):
        r=sc*i; pts=[(cx+r*(1+.16*math.sin(3*t+i*.3+rot)+.09*math.sin(5*t+rot*2))*math.cos(t), cy+r*.78*(1+.16*math.sin(3*t+i*.3+rot)+.09*math.sin(5*t+rot*2))*math.sin(t)) for t in [j*math.tau/56 for j in range(57)]]
        c=f'rgb({int(col0[0]+(col1[0]-col0[0])*i/k)},{int(col0[1]+(col1[1]-col0[1])*i/k)},{int(col0[2]+(col1[2]-col0[2])*i/k)})'
        s+=f'<path d="{"M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts)}" fill="none" stroke="{c}" stroke-width="{1.2 if i%4 else 2.2}" opacity=".9"/>'
    return s
card('terrain',contour(210,230,15,0,(99,57,165),(232,120,67))+contour(110,110,6,2,(231,160,181),(232,120,67),9)+'<path d="M0,420 L0,360 L70,330 L130,350 L210,290 L270,340 L340,310 L400,350 L400,420Z" fill="#090914" opacity=".85"/><circle cx="300" cy="80" r="26" fill="url(#sn)"/>',rg('sn',[(0,'#F3EAF0',.9),(1,'#E87843',0)]),'#11152D','#24153F')
blobs=''.join(f'<ellipse cx="{R.uniform(40,360):.0f}" cy="{R.uniform(40,300):.0f}" rx="{R.uniform(40,110):.0f}" ry="{R.uniform(30,80):.0f}" fill="url(#{R.choice(["h","c","m"])})" transform="rotate({R.randint(0,180)} 200 170)"/>' for _ in range(11))
card('thermal',f'<g filter="url(#bl)">{blobs}</g>'+''.join(f'<line x1="0" y1="{y}" x2="400" y2="{y}" stroke="#F3EAF0" opacity=".07"/>' for y in range(20,420,26))+''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="420" stroke="#F3EAF0" opacity=".07"/>' for x in range(20,400,40))+'<path d="M10,380 '+' '.join(f'L{x},{380-28*math.sin(x/38)-10*math.sin(x/11)+0:.0f}' for x in range(10,391,10))+'" fill="none" stroke="#F3EAF0" stroke-width="2"/><rect x="0" y="150" width="400" height="3" fill="#E7A0B5" opacity=".55"><animate attributeName="y" values="0;417;0" dur="7s" repeatCount="indefinite"/></rect>',
 rg('h',[(0,'#FFB07A',1),(.45,'#E87843',.85),(.8,'#B84C36',.4),(1,'#B84C36',0)])+rg('c',[(0,'#8a5ad0',1),(1,'#24153F',0)])+rg('m',[(0,'#E7A0B5',.95),(1,'#6339A5',0)])+'<filter id="bl"><feGaussianBlur stdDeviation="14"/></filter>','#11152D','#24153F')
ray=''.join(f'<line x1="200" y1="190" x2="{200+300*math.cos(a):.0f}" y2="{190+300*math.sin(a):.0f}" stroke="#E7A0B5" stroke-opacity="{R.uniform(.06,.22):.2f}" stroke-width="{R.uniform(1,3):.1f}"/>' for a in [R.uniform(0,math.tau) for _ in range(34)])
rks=''.join(f'<circle cx="{R.uniform(20,380):.0f}" cy="{R.uniform(30,390):.0f}" r="{R.uniform(1.5,6):.1f}" fill="#2a1840" stroke="#E7A0B5" stroke-opacity=".4"/>' for _ in range(45))
card('geology',ray+rks+'<ellipse cx="200" cy="190" rx="112" ry="100" fill="url(#cr)" stroke="#E7A0B5" stroke-opacity=".7" stroke-width="3"/><ellipse cx="214" cy="204" rx="76" ry="68" fill="#090914" opacity=".55"/><ellipse cx="200" cy="190" rx="112" ry="100" fill="none" stroke="#F3EAF0" stroke-opacity=".2" stroke-width="8"/>'
 +''.join(f'<path d="M{x},{y} l{dx*26},0 M{x},{y} l0,{dy*26}" stroke="#E87843" stroke-width="3" fill="none"/>' for x,y,dx,dy in [(16,16,1,1),(384,16,-1,1),(16,404,1,-1),(384,404,-1,-1)])+'<circle cx="200" cy="190" r="4" fill="#E87843"/>',
 rg('cr',[(0,'#6a3a4a',1),(.7,'#B84C36',1),(1,'#E87843',1)],.4,.4,.7),'#24153F','#3b1a2a')
wave=lambda y:' '.join(f'L{x},{y+8*math.sin(x/37+y)+5*math.sin(x/13):.0f}' for x in range(0,401,10))
layers=[(200,'#B84C36'),(250,'#8a3a4e'),(300,'#5a2a6a'),(350,'#3d2250'),(400,'#1a0f2b')]
card('subsurface','<rect y="150" width="400" height="270" fill="#B84C36"/>'+''.join(f'<path d="M0,{y} {wave(y)} L400,420 L0,420Z" fill="{c}"/>' for y,c in layers)+'<path d="M40,300 C120,270 240,290 360,262 C300,300 150,320 40,300Z" fill="#9fc3ee" opacity=".85"/><path d="M80,298 C150,284 240,290 320,270" stroke="#F3EAF0" stroke-width="2" fill="none" opacity=".7"/>'
 +''.join(f'<path d="M{200-r*.9:.0f},{150+r*.15:.0f} A{r},{r} 0 0 0 {200+r*.9:.0f},{150+r*.15:.0f}" fill="none" stroke="#E7A0B5" stroke-width="2" opacity="{1-r/260:.2f}"/>' for r in range(40,261,55))+'<g transform="translate(200 62)"><rect x="-16" y="-10" width="32" height="20" rx="4" fill="#cfc3d6"/><rect x="-62" y="-5" width="40" height="10" fill="#2a2f6a" stroke="#E7A0B5"/><rect x="22" y="-5" width="40" height="10" fill="#2a2f6a" stroke="#E7A0B5"/><circle cy="14" r="5" fill="#E87843"/></g>','','#24153F','#B84C36')
terr=''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="420" stroke="#6339A5" stroke-opacity=".35"/><line x1="0" y1="{x}" x2="400" y2="{x}" stroke="#6339A5" stroke-opacity=".35"/>' for x in range(0,420,35))
card('route',terr+'<polygon points="120,60 220,40 250,120 160,150" fill="url(#hx)" stroke="#B84C36" stroke-width="2"/><polygon points="230,250 330,230 360,320 260,350" fill="url(#hx)" stroke="#B84C36" stroke-width="2"/>'
 +'<path d="M70,360 C110,250 190,300 200,210 S300,160 330,70" fill="none" stroke="#E87843" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="48;0" dur="2.4s" repeatCount="indefinite"/></path>'
 +''.join(f'<g><circle cx="{x}" cy="{y}" r="17" fill="#090914" stroke="#F3EAF0" stroke-width="3"/><text x="{x}" y="{y+6}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="17" fill="#F3EAF0">{t}</text></g>' for x,y,t in [(70,360,'A'),(330,70,'B')]),
 '<pattern id="hx" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#B84C36" opacity=".28"/><line x1="0" y1="0" x2="0" y2="10" stroke="#E7A0B5" stroke-width="3" opacity=".6"/></pattern>','#11152D','#24153F')
def arc(r,frac,col,cx=200,cy=205):
    a0=math.radians(150); a1=a0+math.radians(240)*frac; x0,y0=cx+r*math.cos(a0),cy+r*math.sin(a0); x1,y1=cx+r*math.cos(a1),cy+r*math.sin(a1); xe,ye=cx+r*math.cos(a0+math.radians(240)),cy+r*math.sin(a0+math.radians(240))
    return f'<path d="M{x0:.0f},{y0:.0f} A{r},{r} 0 1 1 {xe:.0f},{ye:.0f}" fill="none" stroke="#F3EAF0" stroke-opacity=".12" stroke-width="9" stroke-linecap="round"/><path d="M{x0:.0f},{y0:.0f} A{r},{r} 0 {1 if frac>.5 else 0} 1 {x1:.0f},{y1:.0f}" fill="none" stroke="{col}" stroke-width="9" stroke-linecap="round"/>'
card('health',arc(168,.82,'#E7A0B5')+arc(150,.64,'#E87843')+arc(132,.74,'#6339A5')+'<ellipse cx="200" cy="205" rx="78" ry="86" fill="url(#hm)" stroke="#F3EAF0" stroke-opacity=".5" stroke-width="2"/><ellipse cx="200" cy="200" rx="54" ry="52" fill="url(#vz)"/><path d="M158,176 Q190,150 232,170" stroke="#E7A0B5" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/><rect x="172" y="284" width="56" height="18" rx="6" fill="#cfc3d6"/><circle cx="215" cy="226" r="4" fill="#E87843" opacity=".8"/>',
 rg('hm',[(0,'#F3EAF0',1),(.7,'#cfc3d6',1),(1,'#6a5a96',1)],.4,.35,.75)+lg('vz',[(0,'#2a1d4a',1),(1,'#090914',1)]),'#24153F','#11152D')
print('assets ok',len(os.listdir(OUT)))
