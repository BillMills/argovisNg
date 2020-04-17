import { Component, OnInit, Injector } from '@angular/core';
import { SidebarNavComponent } from './../../home/sidebar-nav/sidebar-nav.component'
import { ArQueryService } from './../ar-query.service'
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-ar-sidebar-nav',
  templateUrl: './ar-sidebar-nav.component.html',
  styleUrls: ['./ar-sidebar-nav.component.css']
})
export class ArSidebarNavComponent extends SidebarNavComponent implements OnInit {
  public queryService: ArQueryService
  public dialog: MatDialog
  constructor( public injector: Injector ) { super(injector)
                                             this.queryService = this.injector.get(ArQueryService) }
  private arMode: boolean = true

  ngOnInit(): void {
    super.ngOnInit()
    //this.arMode = this.queryService.getArMode()
  }
  arModeChange(checked: boolean): void {
    this.arMode = checked
    const broadcastChange = false
    const clearOtherShapes = checked // remove other shape if checked
    this.queryService.sendArMode(this.arMode, broadcastChange, clearOtherShapes)
  }


}
