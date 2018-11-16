import { Component, OnInit, Input, Inject } from '@angular/core';
import { QueryService } from '../query.service'
import { DOCUMENT } from '@angular/common';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {FormControl} from '@angular/forms';

export interface Projections {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css']
})

export class SidebarNavComponent implements OnInit {

  private url: string;
  private proj: string;
  private date = new FormControl(new Date());

  constructor(private queryService: QueryService,
              @Inject(DOCUMENT) private document: Document) { }

  @Input() includeRT = true;
  @Input() onlyBGC = false;
  @Input() display3Day = true;

  ngOnInit() {
    this.queryService.sendToggleMsg(this.includeRT)
    this.url = this.document.location.search.split('?map=')[0];
    this.proj = this.document.location.search.split('?map=')[1];
  }

  realtimeChange(event: any): void {
    this.includeRT = event.checked
    this.queryService.sendToggleMsg(this.includeRT);
  }

  display3DayChange(event: any): void {
    this.display3Day = event.checked
    this.queryService.sendThreeDayMsg(this.display3Day);
  }

  bgcChange(event: any): void {
    this.onlyBGC = event.checked
    this.queryService.sendBGCToggleMsg(this.onlyBGC);
  }

  clearProfiles(): void {
    console.log('clearProfiles Clicked')
    this.queryService.triggerClearLayers();
  }

  resetToStart(): void {
    console.log('resetToStart Clicked')
    this.queryService.triggerResetToStart();
  }

  mapProjChange(proj: string): void {
    const newUrl = this.url + '?map=' + proj
    window.location.assign(newUrl)
  }

  displayPlatformInputChanged(platformInput: string) {
    if (platformInput.length >= 5){ this.queryService.triggerShowPlatform(platformInput) }
  }

  displayLastThreeDaysDateChanged(type: string, event: MatDatepickerInputEvent<Date>) {
    const date = event.value
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dateStr = year + '-' + month + '-' + day
    this.queryService.sendDisplayDateMessage(dateStr)
  }


  projections: Projections[] = [
    {value: 'WM', viewValue: 'Web mercator'},
    {value: 'SSP', viewValue: 'Southern stereo projection'},
    {value: 'NSP', viewValue: 'Northern stereo projection'}
  ];
}
