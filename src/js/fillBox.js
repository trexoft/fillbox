

function fillBox(polygon,options) {
    if(typeof options == "undefined"){options={};}
    this.dLong = parseFloat(options["longEdge"]) || parseFloat(2.5);
    this.dShort = parseFloat(options["shortEdge"]) || parseFloat(1.5);
    this.auzun = parseFloat(options["longEdgeOffset"]) || parseFloat(2);
    this.akisa = parseFloat(options["shortEdgeOffset"]) || parseFloat(2);
    this.aci = parseFloat(options["rotateAngel"]) || parseFloat(45);
    this.disariTasma = options["intersection"]==false ? false:true;
    this.library = options["library"] || "leaflet";
    this.center = false;
    this.edge = false;
    this.polygon = polygon;
    this.leftTop = false;
    this.map = options["map"];
    this.addMap = options["addMap"]==false ? false:true;
    this.radiusCorner = 0;
    this.bbox=false;
    this.createdBox = [];
    this.resultBox = {type: "FeatureCollection",features:[]};
    this.databaseInfo = options["databaseInfo"] || {tableName:"mezarlar",geometryField:"geoloc",srid:"4326"};

    this.setup();

}

fillBox.prototype.setup = function () {
    this.getPolygonCenter();
    this.longCrossToCenter();
    this.findLeftTop();
    this.scanneBbox();
    this.rotateBox();
    if(this.addMap==true){
        if(this.library=="openlayers2"){
            this.addOpenLayersMap();
        }
        if(this.library=="leaflet"){
            this.addLeafletMap();
        }

    }
    return this;
};

fillBox.prototype.getOracleSQLFile = function(){
    var db = this.databaseInfo;
    var sql = 'INSERT ALL \n';
    var data = this.resultBox.features;
    if(data.length>0){
        var a = 0;
        for(i in data){
            var feat = data[i].geometry.coordinates[0];
            var wkt = '';
            var b=0;
            for(j in feat){
                if(b==0){
                    b++;
                    wkt = feat[j][0]+' '+feat[j][1];
                }else{
                    wkt=wkt+', '+feat[j][0]+' '+feat[j][1];
                }
            }
            wkt='POLYGON (('+wkt+'))';
            if(a==0){
                a++;
                sql =sql + ' INTO '+db.tableName+' ('+db.geometryField+') VALUES  (ST_GeomFromText( \''+wkt+'\'))\n ';
            }else{
                sql =sql + ' INTO '+db.tableName+' ('+db.geometryField+') VALUES  (ST_GeomFromText( \''+wkt+'\'))\n ';
            }
        }
        sql=sql+'SELECT * FROM dual;';
        download(sql,'fillBoxOracleSQLResult.sql','text/sql');

    }
};

fillBox.prototype.getPostgreSQLFile = function(){
    var db = this.databaseInfo;
    var sql = 'INSERT INTO '+db.tableName+' ('+db.geometryField+') VALUES ';
    var data = this.resultBox.features;
    if(data.length>0){
        var a = 0;
        for(i in data){
            var feat = data[i].geometry.coordinates[0];
            var wkt = '';
            var b=0;
            for(j in feat){
                if(b==0){
                    b++;
                    wkt = feat[j][0]+' '+feat[j][1];
                }else{
                    wkt=wkt+', '+feat[j][0]+' '+feat[j][1];
                }
            }
            wkt='POLYGON (('+wkt+'))';
            if(a==0){
                a++;
                sql =sql + ' (ST_GeomFromText( \''+wkt+'\','+db.srid+')) ';
            }else{
                sql =sql + ',(ST_GeomFromText( \''+wkt+'\','+db.srid+')) ';
            }
        }
        download(sql,'fillBoxPostgreSQLResult.sql','text/sql');
    }
};

fillBox.prototype.getMsSQLFile = function () {
    var db = this.databaseInfo;
    var sql = 'INSERT INTO '+db.tableName+' ('+db.geometryField+') VALUES ';
    var data = this.resultBox.features;
    if(data.length>0){
        var a = 0;
        for(i in data){
            var feat = data[i].geometry.coordinates[0];
            var wkt = '';
            var b=0;
            for(j in feat){
                if(b==0){
                    b++;
                    wkt = feat[j][0]+' '+feat[j][1];
                }else{
                    wkt=wkt+', '+feat[j][0]+' '+feat[j][1];
                }
            }
            wkt='POLYGON (('+wkt+'))';
            if(a==0){
                a++;
                sql =sql + ' (geography::STGeomFromText( '+wkt+','+db.srid+')) ';
            }else{
                sql =sql + ',(geography::STGeomFromText( '+wkt+','+db.srid+')) ';
            }
        }
        download(sql,'fillBoxMsSQLResult.sql','text/sql');
    }
};

fillBox.prototype.getResultGeojsonFile = function () {
    if(this.resultBox.features.length>0){
        var sonuc = JSON.stringify(this.resultBox);
        download(sonuc,'fillBoxGeojsonResult.geojson','text/json');
    }else{
        return false;
    }
};


fillBox.prototype.getResultGeojson = function () {
    if(this.resultBox.features.length>0){
        return this.resultBox;
    }else{
        return false;
    }
};

fillBox.prototype.getResultBox = function () {
    if(this.resultBox.features.length>0){
        return this.resultBox.features;
    }else{
        return false;
    }
};

fillBox.prototype.addLeafletMap = function(){
    var geojsons  =this.resultBox;
    L.geoJSON(geojsons, {
        style: {color:"green"}
    }).addTo(this.map);
};

fillBox.prototype.addOpenLayersMap = function () {
    var geojsons  =this.resultBox;
    var geojson_format = new OpenLayers.Format.GeoJSON();
    var vector_layer = new OpenLayers.Layer.Vector();
    this.map.addLayer(vector_layer);
    vector_layer.addFeatures(geojson_format.read(geojsons));
    return this;
};


fillBox.prototype.rotateBox=function () {
    for(i in this.createdBox){
        var kutu = this.createdBox[i];
        var options = {pivot: this.center};
        var yenikutu = turf.transformRotate(kutu, this.aci, options);
        var polySinir = this.polygon;
        var kontrol = withinControl(yenikutu,polySinir,this.disariTasma);
        if(kontrol==true){
            this.resultBox.features.push(yenikutu);
        }
    }
    return this;
};

function withinControl(kutu,poly,kontrol){
    var durum = false;
    var coords  =kutu.geometry.coordinates[0];
    var sayi = coords.length;
    var a =0;
    for(i in coords){
        var kord = coords[i];
        var pt = turf.point(kord);
        var icindemi  = turf.booleanPointInPolygon(pt, poly);
        if(icindemi==true){
            a++;
            if(kontrol==false && a==sayi){
                durum=true;
            }
            if(kontrol==true){
                durum=true;
            }

        }
    }
    return durum;
}


fillBox.prototype.scanneBbox = function () {
    var koseSag = [this.bbox[0],this.bbox[1]];
    var koseAlt = [this.bbox[2],this.bbox[3]];
    var from = turf.point(this.leftTop);
    var to = turf.point(koseSag);
    var to2 = turf.point(koseAlt);
    var options = {units: 'meters'};
    var yatayKenar = turf.distance(from, to, options);
    var duseyKenar = turf.distance(from, to2, options);

    var yatayd = this.dShort;
    var yataya = yatayd + this.akisa;
    var duseyd = this.dLong;
    var duseya = duseyd + this.auzun;
    var hipotd = Math.sqrt(Math.pow(yatayd,2)+Math.pow(duseyd,2));
    var hipota = Math.sqrt(Math.pow(yataya,2)+Math.pow(duseya,2));
    var semtd = (Math.PI/2+Math.asin(duseyd/hipotd))*(180/Math.PI);
    var semta = (Math.PI/2+Math.asin(duseya/hipota))*(180/Math.PI);

    var yatayi = parseInt(yatayKenar/yataya)+10;
    var duseyi = parseInt(duseyKenar/duseya)+10;

    var basepoint = this.leftTop;
    var ekboylam = this.leftTop[0];
    for(var i=0;i<=duseyi;i++){
        for(var j=0;j<=yatayi;j++){
            var noktad = temelOdev1Big(basepoint[1],basepoint[0],hipotd,semtd,0);
            var noktaa = temelOdev1Big(basepoint[1],basepoint[0],hipota,semta,0);
            var nextbasenokta = temelOdev1Big(basepoint[1],basepoint[0],yataya,90,0);
            var bboxx = [basepoint[0], basepoint[1], noktad.boylam, noktad.enlem];
            var boxd = turf.bboxPolygon(bboxx);
            this.createdBox.push(boxd);
            basepoint = [nextbasenokta.boylam,nextbasenokta.enlem];
        }
        var altnoktam = temelOdev1Big(basepoint[1],basepoint[0],duseya,180,0);
        basepoint = [ekboylam,altnoktam.enlem];
    }
};




fillBox.prototype.findLeftTop = function () {
    var center = this.center;
    var radius = this.radiusCorner;
    var options = {steps: 360, units: 'meters', properties: {}};
    var circle = turf.circle(center, radius, options);
    var bbox = turf.bbox(circle);
    this.bbox = bbox;
    this.leftTop = [bbox[0],bbox[3]];
    this.edge = turf.bboxPolygon(bbox);
    return this;
};

fillBox.prototype.getPolygonCenter = function () {
    var centroid = turf.centroid(this.polygon);
    this.center = centroid.geometry.coordinates;
    return this;
};

fillBox.prototype.setRotateCenter = function () {

};

fillBox.prototype.setPolygon = function (polygon) {
    this.polygon = polygon;
    return this;
};

fillBox.prototype.setOptions = function (options) {
    for(i in options){
        if(i=="uzunKenar"){this.dLong =parseFloat(options[i]) || parseFloat(2.5);}
        if(i=="kisaKenar"){this.dShort =parseFloat(options[i]) || parseFloat(1.5);}
        if(i=="uzunKenarAraligi"){this.auzun =parseFloat(options[i]) || parseFloat(2);}
        if(i=="kisaKenarAraligi"){this.akisa =parseFloat(options[i]) || parseFloat(2);}
        if(i=="donuklukAcisi"){this.aci =parseFloat(options[i]) || parseFloat(45);}
        if(i=="disariTasma"){this.disariTasma =options[i]==false ? false:true;}
    }
    return this;
};

fillBox.prototype.longCrossToCenter = function(){
    var polygonCoordinates = this.polygon.geometry.coordinates[0];
    var mesafe  =0;
    for(var i=0;i<polygonCoordinates.length;i++){
        var a = polygonCoordinates[i];
        var from = turf.point(a);
        var to = turf.point(this.center);
        var options = {units: 'meters'};
        var aramesafe = turf.distance(from, to, options);
        if(aramesafe>mesafe){mesafe=aramesafe;}
    }
    this.radiusCorner = mesafe;
    return this;
};



