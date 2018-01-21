# README #

This library produced for filling  the rectangles in a drawn polygon.

![fillbox library](http://www.alikilic.org/fillbox/img.png)

### Demo Version ###
* [**fillBox - Leaflet DEMO**](http://www.alikilic.org/fillbox/leaflet.html)
* [**fillBox - Openlayers 2 DEMO**](http://www.alikilic.org/fillbox/openlayers2.html)

### What is this Library for? ###

* Parcel Creation
* Grave Creation
* Rectangle Creation

### How do I get set up? ###

* Create Options Object
* Draw a Polygon
* Call Library's Main Method
```ruby
// first Options
var options = {
      longEdge:50,
      shortEdge:30,
      longEdgeOffset:20,
      shortEdgeOffset:20,
      rotateAngel:45,
      intersection:false,
      library:"leaflet",
      map:map,
      addMap:true,
      databaseInfo:{
          tableName:"box",
          geometryField:"geoloc",
          srid:"4326"
      }
};
// convert to geojson object your polygon
var newBox = new fillBox(geojson,options);

//
// get GeoJSON file
newBox.getResultGeojsonFile();
//
// get MsSQL.sql file
newBox.getMsSQLFile();
//
// get Oracle.sql file
newBox.getOracleSQLFile();
//
// get PostgreSQL.sql file
newBox.getPostgreSQLFile();
```

### Options About ###

* **longEdge** is the long side of the rectangle to be formed ( unit meters)
* **shortEdge** is the shot side of the rectangle to be formed ( unit meters)
* **longEdgeOffset** the distinct between to long side of seperate rectangle 
* **shortEdgeOffset** the distinct between to short side of seperate rectangle
* **rotateAngel** is angle at which all rectangles should rotate collectively (unit degree)
* **intersection** is Acceptance rectangles intersecting the border of the polygon
* **library** is name of the map javascript library you are using (leaflet,openlayers2)
* **map** is the map object you created
* **addMap** is for add your result box to map
* **databaseInfo - tableName** is your database's table name
* **databaseInfo - geometryField** is your database's table geometry filed name
* **databaseInfo - srid** is your geometry'a coordinate system srid number

### Methods ###
* **newBox.getResultGeojsonFile()** - use with (newBox) and get Box's Geojson file
* **newBox.getMsSQLFile()** - use with (newBox) and get Box's SQL Insert Query for MsSQL
* **newBox.getOracleSQLFile()** - use with (newBox) and get Box's SQL Insert Query for Oracle
* **newBox.getPostgreSQLFile()** - use with (newBox) and get Box's SQL Insert Query for PostgreSQL - Postgis
* **newBox.setOptions(newOpt)** - when you change options selection use this method
* **newBox.setPolygon(polygonGeojson)** - when you change polygon use this method

### Thank You ###

* [**Leaflet and PM**](http://leafletjs.com/)
* [**Openlayers**](http://openlayers.org/)
* [**Turf**](http://turfjs.org/)
* [**Download.js**](http://danml.com/download.html)
* [**harita.js**](http://www.alikilic.org/)

### Writed By ###
* [**Ali KILIÇ - Gis Developer and Geodesy Engineer**](http://admin.alikilic.org/)
