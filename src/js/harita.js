/**
 * Created by ali.kilic on 25.01.2016.
 */
var pi = Math.PI;
var R =6371;
function newElipsoid (name,a,b,c,bf,e2,ei2,n,alfa,beta,gama,teta,epsulon,beta2,gama2,teta2,epsulon2){
    this.name = name;
    this.a=a;
    this.b=b;
    this.c=c;
    this.bf=bf;
    this.e2=e2;
    this.ei2=ei2;
    this.n=n;
    this.alfa=alfa;
    this.beta=beta;
    this.gama=gama;
    this.teta=teta;
    this.epsulon=epsulon;
    this.beta2=beta2;
    this.gama2=gama2;
    this.teta2=teta2;
    this.epsulon2=epsulon2;
    return {name:name,a:a,b:b,c:c,bf:bf,e2:e2,ei2:ei2,n:n,alfa:alfa,beta:beta,gama:gama,teta:teta,epsulon:epsulon,beta2:beta2,gama2:gama2,teta2:teta2,epsulon2:epsulon2};
}
var elipsoids = [];
elipsoids[0] = new newElipsoid("GRS80",6378137,6356752.314,6399593.626,298.257222101,0.0066943800,0.0067394968,0.0016792204,6367449.145771,16038.508742,16.832613,0.021984,0.000031,0.002518826597,0.000003700949,0.000000007448,0.000000000017);
elipsoids[1] = new newElipsoid("ED50",6378388,6356911.946,6399936.608,297,0.00672267,0.00676817,0.00168634,6367654.500058,16107.034679,16.976211,0.022266,0.000032,0.002529506915,0.000003732401,0.000000007543,0.000000000017);
elipsoids[2] = new newElipsoid("BESSEL",6377397.155,6356078.963,6398786.849,299.1528,0.00667437,0.00671922,0.00167418,6366742.519778,15988.639219,16.729955,0.021785,0.000031,0.002511273350,0.000003678786,0.000000007381,0.000000000017);
var coordType = ["cografi","kartezyen","gauss"];
function t(enlem){return Math.tan(enlem);}
function n2(enlem,ei2){return ((Math.pow(Math.cos(enlem),2))*(ei2));}
function v(n2){return Math.sqrt(1+n2);}
function N(c,v){return (c/v);}
function M(c,v){return c/(Math.pow(v,3));}
function Gdeger(elipsoidid,enlemRad){
    var alfa = elipsoids[elipsoidid].alfa;
    var beta = elipsoids[elipsoidid].beta;
    var gama = elipsoids[elipsoidid].gama;
    var teta = elipsoids[elipsoidid].teta;
    var epsulon = elipsoids[elipsoidid].epsulon;
    var gd = (alfa*enlemRad)-(beta*Math.sin(2*enlemRad))+(gama*Math.sin(4*enlemRad))-(teta*Math.sin(6*enlemRad))+(epsulon*Math.sin(8*enlemRad));
    return gd;
}
function a12345(N,t,n2,enrad){
    var a1=N*Math.cos(enrad);
    var a2=(-1/2)*N*t*Math.pow(Math.cos(enrad),2);
    var a3=(-1/6)*N*Math.pow(Math.cos(enrad),3)*(1-Math.pow(t,2)+n2);
    var a4=(1/24)*N*t*Math.pow(Math.cos(enrad),4)*(5-Math.pow(t,2)+9*n2+4*Math.pow(n2,2));
    var a5=(1/120)*N*Math.pow(Math.cos(enrad),5)*(5-18*Math.pow(t,2)+Math.pow(t,4));
    return {a1:a1,a2:a2,a3:a3,a4:a4,a5:a5};
}
function b12345(N,t,n2,enlem){
    var b1=1/(N*Math.cos(enlem));
    var b2 = -0.5*(t/Math.pow(N,2))*(1+n2);
    var b3 = (-1/(6*Math.pow(N,3)*Math.cos(enlem)))*(1+2*Math.pow(t,2)+n2);
    var b4 = (t/(24*Math.pow(N,4)))*(5+3*Math.pow(t,2)+6*n2-6*n2*Math.pow(t,2));
    var b5 = (5+28*Math.pow(t,2)+24*Math.pow(t,4))/(120*Math.pow(N,5)*Math.cos(enlem));
    return {b1:b1,b2:b2,b3:b3,b4:b4,b5:b5};
}
function ilkEnlem(elipsoidid,xCoord){
    var alfa = elipsoids[elipsoidid].alfa;
    var fi1=xCoord/alfa;
    var beta2 = elipsoids[elipsoidid].beta2;
    var gama2 = elipsoids[elipsoidid].gama2;
    var teta2 = elipsoids[elipsoidid].teta2;
    var epsulon2 = elipsoids[elipsoidid].epsulon2;
    return fi1+(beta2*Math.sin(2*fi1))+(gama2*Math.sin(4*fi1))+(teta2*Math.sin(6*fi1))+(epsulon2*Math.sin(8*fi1));
}
function BFormulu(f,f2,l,n,v,t,M){
    var k1 = M*f*Math.cos(l/2);
    var k2 = (((1-2*n)/24)*(Math.pow((l*Math.cos(f2)),2)));
    var k3 = (((n*(1-Math.pow(t,2)))/(8*Math.pow(v,4)))*(Math.pow(f,2)));
    return k1*(1+k2+k3);
}
function AFormulu(N,l,fo,f,n,t,v){
    var k1 = N*l*Math.cos(fo);
    var k2 = (Math.pow((l*Math.sin(fo)),2))/24;
    var k3 = ((1+n-(9*n*Math.pow(t,2)))/(24*Math.pow(v,4)))*Math.pow(f,2)
    return k1*(1-k2+k3);
}
function CFormulu(deltalamdarad,ortaFirad,n2m,v,deltafirad){
    var k1 = deltalamdarad*Math.sin(ortaFirad);
    var k2 = ((1+n2m)/12)*(Math.pow((deltalamdarad*Math.cos(ortaFirad)),2));
    var k3 = ((3+8*n2m)/(24*Math.pow(v,4)))*(Math.pow(deltafirad,2));
    return k1*(1+k2+k3);
}

function uFormulu(deltafi,c,v1,n1,t1,deltaboy,en1rad){
    var k1 = (c/Math.pow(v1,3))*deltafi;
    var k2 = ((3*c*n1*t1)/(2*Math.pow(v1,5)))*Math.pow(deltafi,2);
    var k3 = ((c*t1*Math.pow(Math.cos(en1rad),2))/(2*v1))*Math.pow(deltaboy,2);
    var k4 = ((c*n1)/(2*Math.pow(v1,7)))*(Math.pow(v1,2)-Math.pow(t1,2)+4*n1*Math.pow(t1,2))*Math.pow(deltafi,3);
    var k5 = ((c*Math.pow(Math.cos(en1rad),2))/(6*Math.pow(v1,3)))*(Math.pow(v1,2)-3*Math.pow(t1,2))*(deltafi*Math.pow(deltaboy,2));
    return k1+k2+k3+k4+k5;
}
function vFormulu(deltaboy,c,en1rad,v1,deltafi,t1,n1){
    var k1=((c*Math.cos(en1rad))/v1)*deltaboy;
    var k2=((c*t1*Math.cos(en1rad))/Math.pow(v1,3))*(deltafi*deltaboy);
    var k3 = ((c*Math.cos(en1rad)*(2*Math.pow(v1,2)+9*n1*Math.pow(t1,2)))/(6*Math.pow(v1,5)))*(Math.pow(deltafi,2)*deltaboy);
    var k4 =Math.pow(deltaboy,3)*((c*Math.pow(t1,2)*Math.pow(Math.cos(en1rad),3))/(6*v1));
    return k1-k2-k3-k4;
}
function cikcik(aci){
    var derece=parseInt(aci);
    var enlem=parseFloat(aci);
    var ondalik=enlem-derece;
    var ondalik_carp=ondalik*60;
    var dakika=parseInt(ondalik_carp);
    var ondalik2=ondalik-(dakika/60);
    var saniye=ondalik2*3600;
    saniye=ondalikli(saniye,3);
    return derece+"° "+dakika+"' "+saniye+"''";
}
function antiCikcik(deger){
    var bolunen = deger.split(" ");
    var derece = bolunen[0]; var yeniderece=derece.split("°"); var anaderece = yeniderece[0]; anaderece=parseInt(anaderece);
    var dakika = bolunen[1]; var yenidakika=dakika.split("'"); var anadakika = yenidakika[0]; anadakika=parseInt(anadakika);
    var saniye = bolunen[2]; var yenisaniye=saniye.split('"'); var anasaniye = yenisaniye[0]; anasaniye=parseFloat(anasaniye);
    return anaderece +(anadakika/60)+(anasaniye/3600);
}
function der2rad (sayi){return (pi*parseFloat(sayi))/180;}
function rad2der (sayi){return (180*parseFloat(sayi))/pi;}
function der2grad(sayi){return (200*parseFloat(sayi))/180;}
function grad2der(sayi){return (180*parseFloat(sayi))/200;}
function grad2rad(sayi){return (pi*parseFloat(sayi))/200;}
function rad2grad(sayi){return(200*parseFloat(sayi))/pi;}
function ondalikli(sayi,virgul){
    sayi = parseFloat(sayi);
    virgul = parseInt(virgul);
    virgul=Math.pow(10,virgul);
    var deger=Math.round(sayi*virgul)/virgul;
    return deger;
}
function helmert2D(y,x,olcek,donukluk,Yoteleme,Xoteleme){
    var x2 = Xoteleme + (olcek*(Math.cos(donukluk))*x) - (olcek*(Math.sin(donukluk))*y);
    var y2 = Yoteleme + (olcek*(Math.sin(donukluk))*x) + (olcek*(Math.cos(donukluk))*y);
    return {y:y2,x:x2};
}
function kartezyen2cografi(y,x,z,elipsoidid){
    var y=parseFloat(y);
    var x=parseFloat(x);
    var z=parseFloat(z);
    elipsoidid=parseInt(elipsoidid);
    var ei2 = elipsoids[elipsoidid].ei2; var c = elipsoids[elipsoidid].c;
    var tan_fi=(z*(1+ei2))/(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)));
    var fi_sifir=Math.atan(tan_fi);
    for(i=1;i<=10;i++){
        var n2=((Math.pow(Math.cos(fi_sifir),2))*(ei2));
        var v = Math.sqrt(1+n2);
        var N = c/v;
        var h = -N+((Math.sqrt(Math.pow(x,2)+Math.pow(y,2)))/(Math.cos(fi_sifir)));
        var tanfi=tan_fi*(1/(1+ei2*(h/(N+h))));
        fi_sifir=Math.atan(tanfi);
    }
    var lamda = Math.acos(x/(Math.sqrt(Math.pow(x,2)+Math.pow(y,2))));
    fi_sifir=rad2der(fi_sifir);
    lamda=rad2der(lamda);
    return {enlem:fi_sifir,boylam:lamda,yukseklik:h};
}
function cografi2kartezyen(enlem,boylam,yukseklik,elipsoidid){
    var yukseklik=parseFloat(yukseklik);
    var enlem=parseFloat(enlem);
    var boylam=parseFloat(boylam);
    elipsoidid=parseInt(elipsoidid);
    enlem=der2rad(enlem);
    boylam=der2rad(boylam);
    var c = elipsoids[elipsoidid].c; var ei2 = elipsoids[elipsoidid].ei2;
    var N = c/(Math.sqrt(1+(ei2*Math.cos(enlem)*Math.cos(enlem))));
    var y = (N+yukseklik)*(Math.cos(enlem))*(Math.sin(boylam));
    var x = (N+yukseklik)*(Math.cos(enlem))*(Math.cos(boylam));
    var z = ((N/(1+ei2))+(yukseklik))*(Math.sin(enlem));
    return {y:y,x:x,z:z};
}
function cografi2gauss(enlem,boylam,yukseklik,elipsoidid,proj_sis,dom){
    var ei2 = elipsoids[elipsoidid].ei2;
    var c = elipsoids[elipsoidid].c;
    var enlem = parseFloat(enlem); var enrad = der2rad(enlem);
    var boylam = parseFloat(boylam); var dom = parseFloat(dom);
    var l=boylam-dom; l=der2rad(l);
    var n2=((Math.pow(Math.cos(enrad),2))*(ei2));
    var v = Math.sqrt(1+n2);
    var N = c/v;
    var t = Math.tan(enrad);
    var G = Gdeger(elipsoidid,enrad);
    var a = a12345(N,t,n2,enrad);
    var a1= a.a1; var a2=a.a2; var a3=a.a3; var a4=a.a4; var a5=a.a5;
    var x = G - a2*Math.pow(l,2) + a4*Math.pow(l,4);
    var y = a1*l-a3*Math.pow(l,3)+a5*Math.pow(l,5);
    proj_sis=parseInt(proj_sis);
    if(proj_sis!==3 && proj_sis!==6){proj_sis=3;}
    if(proj_sis==3){if(y==0){y=0;}else{y=y+500000;}}
    if(proj_sis==6){y=y*0.9996+500000; x=x*0.9996;}
    y=parseFloat(y); if(y<=0){y=y+500000;}
    return {y:y,x:x,yukseklik:yukseklik};
}
function gauss2cografi(y,x,yukseklik,elipsoid,proj_sis,dom){
    var alfa = elipsoids[elipsoid].alfa;
    var c =  elipsoids[elipsoid].c;
    var ei2 =  elipsoids[elipsoid].ei2;
    x=parseFloat(x); y=parseFloat(y); yukseklik=parseFloat(yukseklik); dom=parseInt(dom);
    var fi = ilkEnlem(elipsoid,x);
    var t = Math.tan(fi);
    var n2=((Math.pow(Math.cos(fi),2))*(ei2));
    var v = Math.sqrt(1+n2); var N = c/v;
    var b=b12345(N,t,n2,fi);
    var b1= b.b1; var b2=b.b2;var b3=b.b3;var b4=b.b4; var b5=b.b5;
    var delta_l = (b1*y)+(b3*Math.pow(y,3))+(b5*Math.pow(y,5)); delta_l=rad2der(delta_l); var by = dom+delta_l;
    if(proj_sis==3){
        var minboy=dom-1.5;
        var maxboy=dom+1.5;
        var mo=1;
        if(by>=maxboy){y=y-500000;}
        if(by<=minboy){y=y+500000;}
        var delta_l = (b1*y)+(b3*Math.pow(y,3))+(b5*Math.pow(y,5)); delta_l=rad2der(delta_l);
    }
    if(proj_sis==6){
        var minboy=dom-3;
        var maxboy=dom+3;
        var mo=0.9996;
        if(by>=maxboy){y=y-500000; y=y*mo;}
        if(by<=minboy){y=y+500000; y=y*mo;}
        var delta_l = (b1*y)+(b3*Math.pow(y,3))+(b5*Math.pow(y,5)); delta_l=rad2der(delta_l);
    }
    var boylamrad=dom+delta_l;
    var delta_fi = (b2*Math.pow(y,2))+(b4*Math.pow(y,4));	var enlemrad = fi+delta_fi; enlemrad=rad2der(enlemrad);
    return {enlem:enlemrad,boylam:boylamrad,yukseklik:yukseklik};
}
function kartezyen2gauss(y,x,z,elipsoidid,proj_sis,dom){
    var don1 = kartezyen2cografi(y,x,z,elipsoidid);
    var don2 = cografi2gauss(don1.enlem,don1.boylam,don1.yukseklik,elipsoidid,proj_sis,dom);
    return {y:don2.y,x:don2.x,yukseklik:don2.yukseklik};
}
function gauss2kartezyen(y,x,yukseklik,elipsoidid,proj_sis,dom){
    var don1 = gauss2cografi(y,x,yukseklik,elipsoidid,proj_sis,dom);
    var don2 = cografi2kartezyen(don1.enlem,don1.boylam,don1.yukseklik,elipsoidid);
    return {y:don2.y,x:don2.x,z:don2.z};
}
function genelDonusum(tip1,tip2,obj){
    var donusum=0;
    if(tip1==0 && tip2 ==1){
        donusum = cografi2kartezyen(obj.enlem,obj.boylam,obj.yukseklik,obj.elipsoidid);
    }
    if(tip1==0 && tip2 ==2){
        donusum = cografi2gauss(obj.enlem,obj.boylam,obj.yukseklik,obj.elipsoidid,obj.proj_sis,obj.dom);
    }
    if(tip1==1 && tip2 ==0){
        donusum = kartezyen2cografi(obj.y,obj.x,obj.z,obj.elipsoidid);
    }
    if(tip1==1 && tip2 ==2){
        donusum = kartezyen2gauss(obj.y,obj.x,obj.z,obj.elipsoidid,obj.proj_sis,obj.dom);
    }
    if(tip1==2 && tip2 ==0){
        donusum = gauss2cografi(obj.y,obj.x,obj.yukseklik,obj.elipsoidid,obj.proj_sis,obj.dom);
    }
    if(tip1==2 && tip2 ==1){
        donusum = gauss2kartezyen(obj.y,obj.x,obj.yukseklik,obj.elipsoidid,obj.proj_sis,obj.dom);
    }
    return donusum;
}
function temelOdev1Big(enlem,boylam,uzunluk,semt1,elipsoidid){
    enlem = der2rad(enlem);
    boylam = der2rad(boylam);
    uzunluk = parseInt(uzunluk);
    var semtm = der2rad(semt1);
    var ei2 = elipsoids[elipsoidid].ei2;
    var c = elipsoids[elipsoidid].c;
    var n2=(Math.pow(Math.cos(enlem),2))*(ei2);
    var v=1+n2; var v = Math.sqrt(v);
    var N =c/v;
    var t =Math.tan(enlem);
    var M = c/(Math.pow(v,3));
    var uv = uzunluk*Math.cos(semtm);
    var vu = uzunluk*Math.sin(semtm);
    var xx = uv*(1+((Math.pow(vu,2))/(3*M*N)));
    var yy = vu*(1-((Math.pow(uv,2)/(6*M*N))));
    var fi=enlem+Math.pow(v,2)*((xx/N)-(((3*n2*t)/2)*(Math.pow(xx,2)/Math.pow(N,2)))-((n2)*((1-Math.pow(t,2)+n2-5*n2*Math.pow(t,2))/2)*(Math.pow(xx,3)/Math.pow(N,3))));
    var n2f=(Math.pow(Math.cos(fi),2))*(ei2);
    var vf=1+n2f; var vf = Math.sqrt(vf);
    var Nf =c/vf;
    var tf =Math.tan(fi);
    var cosf=Math.cos(fi);
    var fi2=fi+Math.pow(vf,2)*(((-1)*(tf/2)*(Math.pow(yy,2)/Math.pow(Nf,2)))+((tf/24)*(1+3*Math.pow(tf,2)+n2f-9*n2f*Math.pow(tf,2))*(Math.pow(yy,4)/Math.pow(Nf,4))));
    var by2=boylam+(1/cosf)*((yy/Nf)-((Math.pow(tf,2)/3)*(Math.pow(yy,3)/Math.pow(Nf,3)))+(((Math.pow(tf,2)*(1+3*Math.pow(tf,2)))/15)*(Math.pow(yy,5)/Math.pow(Nf,5))));
    var a2 = semtm +((tf*yy)/Nf)-((tf)*((1+2*Math.pow(tf,2)+n2f)/6)*(Math.pow(yy,3)/Math.pow(Nf,3)))-((xx*yy)/(2*M*N));
    var a2=rad2der(a2); a2=a2+180;
    if(semt1>=180){a2=a2-360;}
    var fi2=rad2der(fi2);
    var by2=rad2der(by2);
    return {enlem:fi2,boylam:by2,semt2:a2};
}
function temelA(u2){return 1+(u2/16384)*(4096+u2*(u2*(320-175*u2)-768));}
function temelB(u2){return (u2/1024)*(256+u2*(u2*(74-47*u2)-128));}
function tanfi2(a1,aek,ro,b1,ei2){
    var d1=(Math.sin(b1)*Math.cos(ro))+(Math.cos(b1)*Math.sin(ro)*Math.cos(a1));
    var d2=(Math.sin(b1)*Math.sin(ro))-(Math.cos(b1)*Math.cos(ro)*Math.cos(a1)); d2=Math.pow(Math.sin(aek),2)+Math.pow(d2,2); d2=Math.sqrt(d2);
    var d3 = (Math.sqrt(1+ei2)*d1)/d2; d3 = rad2der(Math.atan(d3));
    return d3;
}
function deltarom(ilkro,romiki,B){
    return B*Math.sin(ilkro)*(Math.cos(romiki)+(0.25*B*((Math.cos(ilkro)*(2*Math.pow(Math.cos(romiki),2)-1))-((1/6)*B*Math.cos(romiki)*(4*Math.pow(Math.sin(ilkro),2)-3)*(4*Math.pow(Math.cos(romiki),2)-3)))));
}
function temelOdev1Big1(enlem,boylam,uzunluk,semt1,elipsoidid){
    enlem=parseFloat(enlem); var enlemrad=der2rad(enlem); var semt1rad = der2rad(semt1);
    var tanfirad = Math.tan(enlemrad);
    tanfirad=tanfirad/Math.sqrt(1+elipsoids[elipsoidid].ei2);
    tanfirad = Math.atan(tanfirad);
    var tanfider = rad2der(tanfirad);
    var rorad = Math.tan(tanfirad)/Math.cos(semt1rad);
    rorad = Math.atan(rorad);
    var roder = rad2der(rorad);
    var raek = Math.cos(tanfirad)*Math.sin(semt1rad);
    raek = Math.asin(raek);
    var raekder = rad2der(raek);
    var ukare = elipsoids[elipsoidid].ei2*Math.pow(Math.cos(raek),2);

    var ilkro =uzunluk/(elipsoids[elipsoidid].b*temelA(ukare));
    var reraro = ilkro;
    var B = temelB(ukare);
    var romiki = 2*rorad+ilkro;
    var deltaro = deltarom(ilkro,romiki,B);
    var cosroiki = Math.cos(romiki);

    for(var i =0;i<5;i++){
        romiki = 2*rorad+ilkro;
        deltaro = deltarom(ilkro,romiki,B);
        ilkro =reraro+deltaro;
    }
    var ei2 = elipsoids[elipsoidid].ei2;
    var enlem2 = tanfi2(rorad,raek,ilkro,tanfirad,ei2);
}

temelOdev1Big1(36,26,1770713.8325,62.13915225,0);

function temelodev2(f,e,y1,x1,y2,x2,r){
    if(f=="cografi"){
        e=elipsoids[e];
        y1=der2rad(y1); y2=der2rad(y2); x1=der2rad(x1); x2=der2rad(x2);
        var deltafi=y2-y1; var deltaboy=x2-x1;
        var ortafi=(y2+y1)/2; var ortaboy=(x2+x1)/2;
        var ei2 = e.ei2;
        var c = e.c;
        var n2=(Math.pow(Math.cos(ortafi),2))*(ei2);
        var v=1+n2; var v = Math.sqrt(v);
        var N =c/v;
        var t =Math.tan(ortafi);
        var M = c/Math.pow(v,3);
        var cs=Math.cos(ortafi); var sn=Math.sin(ortafi);
        var ic1=deltaboy*cs;
        var ic2=deltaboy*sn;
        var u =M*deltafi*Math.cos(deltaboy/2)*(1+(((1-2*n2)/24)*Math.pow(ic1,2))+(((n2-n2*Math.pow(t,2))/(8*Math.pow(v,4)))*Math.pow(deltafi,2)));
        var v =N*deltaboy*Math.cos(ortafi)*(1-(Math.pow(ic2,2)/24)+((1+n2-9*n2*Math.pow(t,2))/(24*Math.pow(v,4)))*Math.pow(deltafi,2));
        var s = Math.sqrt((Math.pow(u,2)+Math.pow(v,2)));
        var a1=Math.atan(v/u);
        var deltaa = deltaboy*Math.sin(ortafi)*(1+(((1+n2)/12)*Math.pow(ic1,2))+(((3+8*n2)/(24*Math.pow(v,4)))*Math.pow(deltafi,2)));
        var t1=a1-deltaa/2; t1=rad2der(t1);
        var t2=a1+deltaa/2; t2=rad2der(t2)+180;
        return {s:s,t1:t1,t2:t2};

    }
}

function TemelOdev2GOE(elipsoidid,en1,boy1,en2,boy2){
    var i = elipsoidid;
    var deltafi = en2-en1;
    var deltalamda = boy2-boy1;
    var deltafirad = der2rad(deltafi);
    var deltalamdarad = der2rad(deltalamda);
    var ortaFi = (en1+en2)/2;
    var ortaFirad = der2rad(ortaFi);
    var ortaLamda = (boy1+boy2)/2;
    var ortaLamdarad = der2rad(ortaLamda);
    var ei2 = elipsoids[i].ei2;
    var n2m = n2(ortaFirad,ei2);
    var vx = v(n2m);
    var c =  elipsoids[i].c;
    var Mx = M(c,vx);
    var tx = t(ortaFirad);
    var Nx = N(c,vx);
    var B = BFormulu(deltafirad,ortaFirad,deltalamdarad,n2m,vx,tx,Mx);
    var A =AFormulu(Nx,deltalamdarad,ortaFirad,deltafirad,n2m,tx,vx);
    var C =CFormulu(deltalamdarad,ortaFirad,n2m,vx,deltafirad);
    var T =Math.atan(A/B);
    var C2 = C/2;
    var t1 = T-C2; t1=parseFloat(t1);
    var t2 = T+C2; t2=parseFloat(t2);
    var tt = t1+t2;
    if(tt>=0 && tt<Math.PI){t2=t2+Math.PI;}else{t2=t2-Math.PI;}
    t2=rad2der(t2);
    t1=rad2der(t1);
    var S = Math.sqrt(Math.pow(A,2)+Math.pow(B,2));
    return {s:S,t1:t1,t2:t2};
}





function temelOdev1Legendre(elipsoidid,en1,boy1,en2,boy2){
    var i = elipsoidid;
    var c =  elipsoids[i].c;
    var ei2 = elipsoids[i].ei2;
    var n1 =n2(en1,ei2);
    var v1 =Math.sqrt(1+n1);
    var t1 =t(en1);
    var deltafi  =(en2-en1); deltafi=der2rad(deltafi);
    var deltaboy  =(boy2-boy1); deltaboy=der2rad(deltaboy);
    var en1rad = der2rad(en1);
    var u = uFormulu(deltafi,c,v1,n1,t1,deltaboy,en1rad);
    var v = vFormulu(deltaboy,c,en1rad,v1,deltafi,t1,n1);
    var T = Math.atan(v/u);
    var Trad = rad2der(T);
    var S = u/Math.cos(T);
    return {s:S,t:T};
}


function xyildiz(en1rad,en2rad,N1,N2,ei2,deltaboyrad){
    var k1 = ((Math.cos(en1rad))/(1+ei2))*(N2*Math.sin(en2rad)-N1*Math.sin(en1rad));
    var k2 = Math.sin(en1rad)*((N2*Math.cos(en2rad)*Math.cos(deltaboyrad))-N1*Math.cos(en1rad));
    return k1-k2;
}
function yyildiz(N2,en2rad,deltaboyrad){
    return N2*Math.cos(en2rad)*Math.sin(deltaboyrad);
}
function zyildiz(en1rad,en2rad,N1,N2,ei2,deltaboyrad){
    var k1 = ((Math.sin(en1rad))/(1+ei2))*(N2*Math.sin(en2rad)-N1*Math.sin(en1rad));
    var k2 = Math.cos(en1rad)*((N2*Math.cos(en2rad)*Math.cos(deltaboyrad))-N1*Math.cos(en1rad));
    return k1+k2;
}
function bolgebul(y,x){
    var bolgeno = 0;
    var ekleme = 0;
    var eklemerad = 0;
    if(y>0 && x>0){bolgeno=1; ekleme=0; eklemerad=0;}
    if(y>0 && x<0){bolgeno=2; ekleme=180; eklemerad=Math.PI;}
    if(y<0 && x<0){bolgeno=3; ekleme=180; eklemerad=Math.PI;}
    if(y<0 && x>0){bolgeno=4; ekleme=360; eklemerad=2*Math.PI;}
    return {bolge:bolgeno,ek:ekleme,ekrad:eklemerad};
}
function Ryaricap(N1,n1){
    return N1/(1+n1);
}

function normalkesityayuz(elipsoidid,en1,boy1,en2,boy2){
    var deltaboy = parseFloat(boy2)-parseFloat(boy1);
    var deltaboyrad = der2rad(deltaboy); tabloyaekle("deltaboy rad",deltaboyrad);
    var ei2 = elipsoids[elipsoidid].ei2;
    var c = elipsoids[elipsoidid].c;
    var en1rad  =der2rad(en1); tabloyaekle("Enlem1 Radyan",en1rad);
    var v1 = V(en1rad,ei2); tabloyaekle("V1",v1);
    var N1 = N(c,v1); tabloyaekle("N1",N1);

    var en2rad  =der2rad(en2); tabloyaekle("Enlem 2Radyan",en2rad);
    var v2 = V(en2rad,ei2); tabloyaekle("V2",v2);
    var N2 = N(c,v2); tabloyaekle("N2",N2);

    var xx = xyildiz(en1rad,en2rad,N1,N2,ei2,deltaboyrad); tabloyaekle("XX",xx);
    var yy = yyildiz(N2,en2rad,deltaboyrad); tabloyaekle("YY",yy);
    var zz = zyildiz(en1rad,en2rad,N1,N2,ei2,deltaboyrad); tabloyaekle("ZZ",zz);
    var K = Math.sqrt(Math.pow(xx,2)+Math.pow(yy,2)+Math.pow(zz,2)); tabloyaekle("K",K);
    var bolgem = bolgebul(yy,xx);
    var al = Math.atan(yy/xx); al=rad2der(al); tabloyaekle("a1",al);
    var alorj = al+bolgem.ek; tabloyaekle("al der",alorj);
    al=der2rad(al);
    var n1 = n2(ei2,en1rad); tabloyaekle("n1",n1);
    var Ry = Ryaricap(N1,n1); tabloyaekle("R",Ry);
    Ry = 6371000;
    var SN = K+(Math.pow(K,3)/(24*Math.pow(Ry,2))); tabloyaekle("SN",SN);
}

function hedefyukseklik(elipsoidid,en3,dogrultu,h){
    var en3rad=der2rad(en3);
    var dogrulturad = der2rad(dogrultu);
    var ei2 = elipsoids[elipsoidid].ei2;
    var c = elipsoids[elipsoidid].c;
    var v3 = V(en3rad,ei2); tabloyaekle("V3",v3);
    var nn = n2(ei2,en3rad);  tabloyaekle("n3",nn);
    var N3 = N(c,v3); tabloyaekle("N3",N3);
    var hedyuk =h*Math.sin(2*dogrulturad)*((-1*nn)/(2*N3)); tabloyaekle("hedyuk",hedyuk);
    var hedyukder = rad2der(hedyuk); tabloyaekle("hedyukder",hedyukder);
    return hedyuk;
}
