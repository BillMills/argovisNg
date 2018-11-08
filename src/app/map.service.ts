import { Injectable, ApplicationRef } from "@angular/core";
import { ShapePopupComponent } from './shape-popup/shape-popup.component';
import { PopupCompileService } from './popup-compile.service';

import 'leaflet';
import 'proj4leaflet';
import 'arc';
import 'leaflet-arc';
import 'leaflet-graticule'
//import 'leaflet-draw';
import '../ext-js/leaflet.draw-arc-src.js';
import '../../node_modules/leaflet.coordinates/dist/Leaflet.Coordinates-0.1.5.min.js';
import 'leaflet-ajax'


declare let L;


@Injectable()
export class MapService {
  public map: L.Map;
  public baseMaps: any;
  //public proj = '';
  public drawnItems = L.featureGroup();
  public platformProfileMarkersLayer = L.featureGroup();
  public markersLayer = L.featureGroup()

  public sStereo = new L.Proj.CRS('EPSG:3411',
                                  '+proj=stere '+
                                  '+lat_0=-90 +lon_0=-45 +lat_ts=80'+
                                  '+k=1 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs',
                                  {
                                      resolutions: [
                                      4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8
                                      ],
                                      origin: [.1,.1]
                                  });
  public nStereo = new L.Proj.CRS('EPSG:3411',
                                  '+proj=stere' +
                                  '+lat_0=90 +lon_0=-45 +lat_ts=-80' +
                                  ' +k=1 +x_0=0 +y_0=0 +a=6378273 +b=6356889.449 +units=m +no_defs',
                                  {
                                      resolutions: [
                                      4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8
                                      ],
                                      origin: [.1,.1]
                                  });
  private worldStyle = {
    "color": "#15b01a",
    "fill-rule": "evenodd",
    "weight": 1,
    "fillColor": "#033500",
    "opacity": 1,
    "fillOpacity": .9,
    };
  public geojsonLayer = new L.GeoJSON.AJAX("../assets/world-countries.json", {style: this.worldStyle});
  public geojsonLayerNoAntartica = new L.GeoJSON.AJAX("../assets/world-contries-except-ant.json", {style: this.worldStyle});
  public satelliteMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });
  public googleMap = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
    {attribution: 'google'
  });
  public esri_OceanBasemap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
    {attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
  });

  public graticule = L.latlngGraticule({
    showLabel: true,
    zoomInterval: [
        {start: 0, end: 4, interval: 30},
        {start: 4, end: 5, interval: 10},
        {start: 5, end: 7.5, interval: 5},
        {start: 7.5, end: 12, interval: 1}
    ]
    });

  constructor(private compileService: PopupCompileService) { 
    this.baseMaps = {
      esri: this.satelliteMap,
      ocean: this.esri_OceanBasemap,
      google: this.googleMap
    };
  }

  public appRef: ApplicationRef;

  public init(appRef: ApplicationRef): void {
    this.appRef = appRef;
    this.compileService.configure(this.appRef);
  }

  public drawOptions = {
    position: 'topleft',
    draw: {
        polygon: {
            allowIntersection: <false> false,
            shapeOptions: {
                color: '#983fb2',
                weight: 4
            },
        },
        rectangle: <false> false,
        polyline: <false> false,
        lineString: <false> false,
        marker: <false> false,
        circlemarker: <false> false, 
        circle: <false> false
    },
    edit: {
      featureGroup: this.drawnItems,
      polygon: {
          allowIntersection: <false> false
      }
    },
  }

  public drawControl = new L.Control.Draw(this.drawOptions);

  public coordDisplay = L.control.coordinates({ position:"topright",
                                                useDMS:true,
                                                labelTemplateLat:"N {y}",
                                                labelTemplateLng:"E {x}",
                                                decimals:2,
                                              });
  
  public scaleDisplay = L.control.scale();

  public getTransformedShape(shape: number[][][]): number[][][] {
    let transformedShape = [];
    for (let j = 0; j < shape[0].length; j++) {
        //transformation if shape is outside latitude.
        let lat = shape[0][j][0] % 360;
        //crossing antimeridian transformation
        if (lat < -180) {
            lat = 180 + lat % 180;
        }
        else if (lat > 180) {
            lat = -180 + lat % 180;
        }
        let point = [lat, shape[0][j][1]];
        transformedShape.push(point);
    }
    return([transformedShape])
  };

  public popupWindowCreation = function(layer, drawnItems){
    let layerCoords = layer.toGeoJSON();
    const shape = layerCoords.geometry.coordinates;
    console.log(shape)
    const transformedShape = this.getTransformedShape(shape);
    console.log(transformedShape)
    layer.bindPopup(null);
    layer.on('click', (event) => {
        layer.setPopupContent(
            this.compileService.compile(ShapePopupComponent, (c) => { c.instance.shape = transformedShape; })
        );
    });
    layer.on('add', (event) => { 
        layer.fire('click') // click generates popup object
    });
    drawnItems.addLayer(layer);
    }
}
