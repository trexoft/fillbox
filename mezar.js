var centerLng = 38.41893;
var centerLat = 27.12853;
var map = L.map('map').setView([centerLng,centerLat], 15);
var buffer = 0.04;
var collection = [];
var geojsonlist = [];

L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '<a style="color:#000" target="_blank" href="http://www.alikilic.org">Ali KILIÇ</a> | <a style="color:#000" href="mailto:alikilicharita@gmail.com">alikilicharita@gmail.com</a>'
}).addTo(map);



function geojsonAdd(json,color,text,durum){
    var geo = L.geoJSON(json, {
        style: {color: color}
    }).bindPopup(function (layer) {
        geojsonlist=layer.feature;
        return 'Buffer Alanı <a href="#" onclick="geojsonIndir();">İNDİR</a>';
    }).addTo(map);
    collection.push(geo);
    if(durum==true){
        var bbox = geo.getBounds();
        map.fitBounds(bbox);
    }

}

var features = {
    Poly:[],
    Rectangle:[],
    Line:[],
    Marker:[],
    Circle:[]
};
var options = {
    position: 'topright',
    drawMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawPolygon: true,
    drawCircle: false,
    cutPolygon: false,
    editMode: true,
    removalMode: true
};
map.pm.addControls(options);

map.on('pm:create', function(e) {
    var tip = e.shape;
    var f = e.layer;
    features[tip].push(f);
});
var tarama = {
    duzun:0,
    dkisa:0,
    auzun:0,
    akisa:0,
    aci:0,
    merkez:false,
    cerceve:false,
    polygon:false,
    solUst:false
};
function doldur(){
    var geo = features["Poly"].length;
    if(geo>0){
        var soru1 = prompt("Dikdortgenin Uzun Kenarı Kaç m ?", "2.5");
        if (soru1 != null) {
            tarama.duzun = parseFloat(soru1);
            var soru2 = prompt("Dikdortgenin Uzun Kenarı ile Diğer Dikdörtgen Arası Mesafe Kaç m ?", "1.5");
            if (soru2 != null) {
                tarama.auzun = parseFloat(soru2);
                var soru3 = prompt("Dikdortgenin Kısa Kenarı Kaç m ?", "1.5");
                if (soru3 != null) {
                    tarama.dkisa = parseFloat(soru3);
                    var soru4 = prompt("Dikdortgenin Kısa Kenarı ile Diğer Dikdörtgen Arası Mesafe Kaç m ?", "1.2");
                    if (soru4 != null) {
                        tarama.akisa = parseFloat(soru4);
                        var soru5 = prompt("Dönüklük Açısı Kaç Derecedir ?", "45");
                        if (soru5 != null) {
                            tarama.aci = parseFloat(soru5);
                            ozellikleriBul(tarama);
                        }else{
                            alert("Bu Kısmı Boş Bırakamazsınız 5");
                        }
                    }else{
                        alert("Bu Kısmı Boş Bırakamazsınız 4");
                    }
                }else{
                    alert("Bu Kısmı Boş Bırakamazsınız 3");
                }
            }else{
                alert("Bu Kısmı Boş Bırakamazsınız 2");
            }
        }else{
            alert("Bu Kısmı Boş Bırakamazsınız 1");
        }
    }else{
        alert("Çizim Bulunmamaktadır Lütfen Polygon Çiziniz");
    }
}

function ozellikleriBul(t){
    var polygon =features["Poly"][0];
    tarama.merkez = polygon.getCenter();
    var marker = L.marker(tarama.merkez);
    var mesafe = enUzunKenar(polygon,tarama.merkez);
    var center = [tarama.merkez.lng,tarama.merkez.lat];
    var radius = mesafe/1000;
    var options = {steps: 360, units: 'kilometers', properties: {}};
    var circle = turf.circle(center, radius, options);
    var bbox = turf.bbox(circle);
    tarama.bbox = bbox;
    tarama.solUst = [bbox[0],bbox[3]];
    var bboxPolygon = turf.bboxPolygon(bbox);
    var marker2 = L.marker([bbox[3],bbox[0]]);
    var bboxPolygon = turf.bboxPolygon(bbox);
    tarama.cerceve = bboxPolygon;
    tarama.polygon = polygon;
    taramayıBaslat();
}

function enUzunKenar(polygon,merkez){
    var polygonCoordinates = polygon.getLatLngs()[0];
    var enUzakNokta = [];
    var mesafe  =0;
    for(var i=0;i<polygonCoordinates.length;i++){
        var a = polygonCoordinates[i];
        var aramesafe = map.distance(merkez,a);
        if(aramesafe>mesafe){mesafe=aramesafe;}
    }
    return mesafe;
}

var olusanlar = [];

function taramayıBaslat(){
    var koseSag = [tarama.bbox[0],tarama.bbox[1]];
    var koseAlt = [tarama.bbox[2],tarama.bbox[3]];
    var from = turf.point(tarama.solUst);
    var to = turf.point(koseSag);
    var to2 = turf.point(koseAlt);
    var options = {units: 'kilometers'};
    var yatayKenar = turf.distance(from, to, options)*1000;
    var duseyKenar = turf.distance(from, to2, options)*1000;

    var yatayd = tarama.dkisa;
    var yataya = yatayd + tarama.akisa;
    var duseyd = tarama.duzun;
    var duseya = duseyd + tarama.auzun;
    var hipotd = Math.sqrt(Math.pow(yatayd,2)+Math.pow(duseyd,2));
    var hipota = Math.sqrt(Math.pow(yataya,2)+Math.pow(duseya,2));
    var semtd = (Math.PI/2+Math.asin(duseyd/hipotd))*(180/Math.PI);
    var semta = (Math.PI/2+Math.asin(duseya/hipota))*(180/Math.PI);

    var yatayi = parseInt(yatayKenar/yataya)+10;
    var duseyi = parseInt(duseyKenar/duseya)+10;

    var basepoint = tarama.solUst;
    var ekboylam = tarama.solUst[0];
    for(var i=0;i<=duseyi;i++){
        for(var j=0;j<=yatayi;j++){
            var noktad = temelOdev1Big(basepoint[1],basepoint[0],hipotd,semtd,0);
            var noktaa = temelOdev1Big(basepoint[1],basepoint[0],hipota,semta,0);
            var nextbasenokta = temelOdev1Big(basepoint[1],basepoint[0],yataya,90,0);
            var kutud = [[basepoint[1],basepoint[0]],[noktad.enlem,noktad.boylam]];
            var kutua = [[basepoint[1],basepoint[0]],[noktaa.enlem,noktaa.boylam]];
            var boxd = L.rectangle(kutud, {color: "#ff7800", weight: 1});
            olusanlar.push(boxd.toGeoJSON());
            basepoint = [nextbasenokta.boylam,nextbasenokta.enlem];
        }
        var altnoktam = temelOdev1Big(basepoint[1],basepoint[0],duseya,180,0);
        basepoint = [ekboylam,altnoktam.enlem];
    }
    kutulariDondur();
}

function kutulariDondur(){
    for(i in olusanlar){
        var kutu = olusanlar[i];
        var poly = turf.polygon([[[0,29],[3.5,29],[2.5,32],[0,29]]]);
        var options = {pivot: [tarama.merkez.lng, tarama.merkez.lat]};
        var yenikutu = turf.transformRotate(kutu, tarama.aci, options);

        debugger;
        var polySinir = tarama.polygon.toGeoJSON();
        var kontrol = icindemiKontrol(yenikutu,polySinir);
        if(kontrol==true){
            geojsonAdd(yenikutu,"yellow");
        }
    }
}

function icindemiKontrol(kutu,poly){

    var durum = false;
    var coords  =kutu.geometry.coordinates[0];
    for(i in coords){
        var kord = coords[i];
        var pt = turf.point(kord);
        var icindemi  = turf.booleanPointInPolygon(pt, poly);
        if(icindemi==true){
            durum=true;
        }
    }
    return durum;
}

