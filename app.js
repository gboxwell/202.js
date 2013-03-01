
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , geojson = require('./routes/geojson')
  , http = require('http')
  , path = require('path');

var app = express();
var pg = require('pg');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/geojson', geojson.list);

app.post('/RetrieveCadastre', function(req, res){
    RetrieveCadastre(req.body, res);
});

// RetrieveCadastre
function RetrieveCadastre(bounds, res){

    var connString = 'tcp://js:password@localhost/geojson';

    pg.connect(connString, function(err, client) {
 
        //var sql = 'select ST_AsGeoJSON(wkb_geometry ) as shape ';
        //sql = sql + 'from bozeman_schools ';
        //sql = sql + 'where ST_Transform(wkb_geometry, 4269)  && ST_GeogFromText(\'SRID=4269;POLYGON((' + bounds._southWest.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._southWest.lat + '))\') ';
        //sql = sql + 'and ST_Intersects(ST_Transform(wkb_geometry,4269) , ST_GeogFromText(\'SRID=4269;POLYGON((' + bounds._southWest.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._southWest.lat + '))\'));';
        var sql = 'select ST_AsGeoJSON(wkb_geometry ) as shape ';
        sql = sql + 'from bozeman_city_limits ';
        sql = sql + 'where ST_Transform(wkb_geometry, 4269)  && ST_GeogFromText(\'SRID=4269;POLYGON((' + bounds._southWest.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._southWest.lat + '))\') ';
        sql = sql + 'and ST_Intersects(ST_Transform(wkb_geometry,4269) , ST_GeogFromText(\'SRID=4269;POLYGON((' + bounds._southWest.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._southWest.lat + ',' + bounds._northEast.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._northEast.lat + ',' + bounds._southWest.lng + ' ' + bounds._southWest.lat + '))\'));';

        console.log(sql);
        client.query(sql, function(err, result) {
 
            var featureCollection = new FeatureCollection();
            if(result) {
              for (i = 0; i < result.rows.length; i++)
              {
                  featureCollection.features[i] = JSON.parse(result.rows[i].shape);
              }
            } 
            res.send(featureCollection);
        });
    });
}
 
// GeoJSON Feature Collection
function FeatureCollection(){
    this.type = 'FeatureCollection';
    this.features = new Array();
}


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
