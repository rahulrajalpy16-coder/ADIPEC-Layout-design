import numpy as np, sys
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS=None
S=sys.argv[1]; O=sys.argv[2]
def coeffs(dst, src):
    A=[];B=[]
    for (x,y),(X,Y) in zip(dst,src):
        A.append([x,y,1,0,0,0,-X*x,-X*y]); B.append(X)
        A.append([0,0,0,x,y,1,-Y*x,-Y*y]); B.append(Y)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()
def warp(img, quad, w, h):
    dst=[(0,0),(w,0),(w,h),(0,h)]
    return img.transform((w,h), Image.PERSPECTIVE, coeffs(dst,quad), Image.BICUBIC)
def save(im,name,q=86):
    im=im.convert('RGB')
    if name.endswith('.jpg'): im.save(O+'/'+name,quality=q,optimize=True,progressive=True)
    else: im.save(O+'/'+name,optimize=True)
r0=Image.open(S+'/hi/r-000.jpg'); r1=Image.open(S+'/hi/r-001.jpg'); r2=Image.open(S+'/hi/r-002.jpg')
# back screens 250x200
save(warp(r1,[(1561,601),(1905,541),(1910,998),(1561,995)],1000,800),'screen_back_left.jpg')
# right back screen from render-1, patch the person area with nearby ocean
c=r0.crop((1506,569,2005,994)).copy()
patch=c.crop((330,318,420,426)); c.paste(patch,(0,318))
save(c.resize((1000,800),Image.LANCZOS),'screen_back_right.jpg')
# 55in TVs 16:9
save(warp(r0,[(606.5,739.3),(969.2,753.6),(968.6,973.7),(605.5,983.1)],768,432),'tv_sms.jpg')
save(warp(r0,[(2052.4,756.7),(2424.5,742.4),(2425.8,978.2),(2053.3,971.4)],768,432),'tv_amphicos.jpg')
# lightbox 75x150
save(r2.crop((1086,621,1352,1156)).resize((400,800),Image.LANCZOS),'lightbox.jpg')
# logos
def logo(src,name,maxw=1600,pad=0.06):
    im=Image.open(src).convert('RGB'); a=np.array(im).astype(int)
    nonwhite=(a.min(axis=2)<235); ys,xs=np.where(nonwhite)
    im=im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    pw=int(im.width*pad); bg=Image.new('RGB',(im.width+2*pw,im.height+2*pw),'white'); bg.paste(im,(pw,pw)); im=bg
    if im.width>maxw: im=im.resize((maxw,int(im.height*maxw/im.width)),Image.LANCZOS)
    # alpha from whiteness
    a=np.array(im).astype(float); d=255-a.min(axis=2); alpha=np.clip(d*3,0,255)
    rgba=np.dstack([a,alpha]).astype('uint8'); Image.fromarray(rgba,'RGBA').save(O+'/'+name,optimize=True)
    print(name,im.size)
logo(S+'/hi/sms_svg.png','logo_sms.png')
logo(S+'/hi/amph_svg.png','logo_amphicos.png')
logo(S+'/docx/media/image11.png','logo_smt.png')
logo(S+'/docx/media/image7.png','logo_mt.png',1200)
logo(S+'/docx/media/image8.png','logo_navis.png')
f=Image.open(S+'/docx/media/image9.png').convert('RGB'); f=f.resize((f.width*8,f.height*8),Image.LANCZOS).filter(ImageFilter.UnsharpMask(4,120,2)); f.save(S+'/hi/fugro_up.png')
logo(S+'/hi/fugro_up.png','logo_fugro.png')
logo(S+'/docx/media/image10.png','logo_sonardyne.png')
# MT console screen + panel
i1=Image.open(S+'/docx/media/image1.png').convert('RGB')
save(warp(i1,[(819.7,331),(1405,338),(1403,672.8),(855.9,683.6)],1040,650),'mt_screen.jpg')
save(i1.crop((865,727,1573,828)).resize((900,128),Image.LANCZOS),'mt_panel.jpg')
# NAVIS
i3=Image.open(S+'/docx/media/image3.png').convert('RGB')
save(i3.crop((215,172,1200,695)).resize((1040,650),Image.LANCZOS),'navis_screen.jpg')
pn=warp(i3,[(300.7,951.5),(1111,951.5),(1234.8,1242.6),(179.3,1242.6)],900,300)
a=np.array(pn); col=a[150:200,20:60].reshape(-1,3).mean(axis=0).astype('uint8'); a[:,470:]=col
logo_area=a[230:285,140:290].copy(); a[230:285,620:770]=logo_area
save(Image.fromarray(a),'navis_panel.jpg')
# Fugro
i4=Image.open(S+'/docx/media/image4.png').convert('RGB')
save(warp(i4,[(330,205),(680,198),(701,340),(381,380)],600,240),'fugro_rx_front.jpg')
i5=Image.open(S+'/docx/media/image5.png').convert('RGB')
save(i5.crop((22,131,775,655)),'fugro_display.jpg')
# Sonardyne band
i6=Image.open(S+'/docx/media/image6.jpeg').convert('RGB')
save(i6.crop((344,250,639,402)).resize((600,310),Image.LANCZOS),'sonardyne_band.jpg')
