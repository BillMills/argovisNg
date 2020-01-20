import { Component, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FormControl } from '@angular/forms'
import { ArServiceService } from './../../services/ar-service.service'
import { QueryService } from './../../services/query.service'
import { MapService } from './../../services/map.service'
import { ARShape } from './../../models/ar-shape'
import { DateRange } from './../../../../typeings/daterange'


import * as moment from 'moment';

export interface DropDownSelection {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-ar-display',
  templateUrl: './ar-display.component.html',
  styleUrls: ['./ar-display.component.css']
})
export class ArDisplayComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ArDisplayComponent>, 
              private arService: ArServiceService,
              private queryService: QueryService,
              private mapService: MapService ) { }
  private arDate: moment.Moment;
  private arFormDate = new FormControl( new Date( 2010, 0, 1, 0, 0, 0, 0) ) 
  
  private hour: number
  private MIN_DATE = new Date(2007, 0, 1, 0, 0, 0, 0)
  private MAX_DATE = new Date(2016, 12, 31, 0, 0, 0, 0)
  private hours: DropDownSelection[] = [
    {value: 0, viewValue: '0:00'},
    {value: 3, viewValue: '3:00'},
    {value: 6, viewValue: '6:00'},
    {value: 9, viewValue: '9:00'},
    {value: 12, viewValue: '12:00'},
    {value: 15, viewValue: '15:00'},
    {value: 18, viewValue: '18:00'},
    {value: 21, viewValue: '21:00'},
  ];

  ngOnInit() { 
    this.arDate = moment(this.arFormDate.value)
    this.queryService.sendArDate(this.arDate)
    this.hour = 0
  }

  dateChanged(date: Date): void {
    this.arFormDate = new FormControl(moment(date))
  }

  timeChange(hour: number): void {
    this.hour = hour
  }

  private incrementDay(increment: number): void {
    this.arDate = this.arDate.add(increment, 'd')
    this.arFormDate = new FormControl( this.arDate.toDate() )
  }

  private incrementHour(increment: number): void {
    this.arDate = this.arDate.add(increment, 'h')
    this.arFormDate = new FormControl( this.arDate.toDate() )
    this.hour = this.arDate.hour()
  }

  private onNoClick(): void {
    this.dialogRef.close();
  }

  private formatDate(date: moment.Moment): string {
    return date.format("YYYY-MM-DDTHH:mm:ss") + 'Z'
  }

  private setArShapesAndDate(): void {
    this.queryService.sendThreeDayMsg(false, false)
    this.mapService.drawnItems.clearLayers()
    this.mapService.arShapeItems.clearLayers()

    const dateString = this.formatDate(this.arDate)
    
    const arShapes = this.arService.getArShapes(dateString)
    const arDateRange = this.queryService.getArDateRange()
    arShapes.subscribe((arShapes: ARShape[]) => {
      if (arShapes.length !== 0) {
        this.setDateRange()
        this.setArShape(arShapes)
        const startDate = this.formatDate(this.arDate.clone().add(arDateRange[0], 'h'))
        const endDate = this.formatDate(this.arDate.clone().add(arDateRange[1], 'h'))
        const dateRange: DateRange = {start: startDate, end: endDate, label: ''}
        console.log('dateRange: ', dateRange)
        const broadcastChange = false
        const clearOtherShapes = false
        //this.queryService.sendArMode(true, broadcastChange, clearOtherShapes)
        this.queryService.sendSelectedDate(dateRange, broadcastChange)
      }
      this.dialogRef.close();
    })
  }

  private setDateRange(): void {
    const broadcastChange = false
    const startDate = this.arDate.add(-18, 'h').toISOString()
    const endDate = this.arDate.add(18, 'h').toISOString()
    const dateRange: DateRange = {start: startDate, end: endDate, label: ''}
    this.queryService.sendSelectedDate(dateRange, broadcastChange)
  }

  private setArShape(arShapes: ARShape[]) {
    let shapeArrays = []
    for(let idx=0; idx<arShapes.length; idx++){
      let sa = arShapes[idx].geoLocation.coordinates
      sa = this.arService.swapCoords(sa)
      shapeArrays.push(sa)
    }

    const shapeFeatureGroup = this.mapService.convertArrayToFeatureGroup(shapeArrays, this.mapService.arShapeOptions)
    const shapeType = 'atmospheric river shape'
    shapeFeatureGroup.eachLayer( layer => {
      const polygon = layer as L.Polygon
      this.mapService.popupWindowCreation(polygon, this.mapService.arShapeItems, shapeType)
    })
    //this.queryService.arEvent.emit('ar changed')
    this.queryService.sendARShapes(shapeArrays)
  }
}
