import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import "rxjs/add/operator/toPromise";
import "rxjs/Rx";
import { ColorPickerModule } from "ngx-color-picker";
import { EmitterChanelBusService } from "../../services/emitterChanelBus.service";
import { IconComponent } from "./icon.component";
import { ColorFormats } from "common-enums";
import * as $ from "jquery";
export enum rangesChartType {
  map = "Map",
  tree = "Tree",
  grid = "Grid",
  badge = "badge",
  chord = "Chord",
  heatmap = "Heatmap",
  gauge = "Gauge",
  scatter = "Scatter",
  tagcloud = "TagCloud",
  treemap = "Treemap",
  topology = "Topology",  
  bulletMap = "bulletmap",
  Badge = "Badge",
  calendarHeatmap = "CalendarHeatmap"
}
export const BLACK_HEX_COLOR_CODE = "#000000";
export const RED_HEX_COLOR_CODE = "#e62424";
@Component({
  selector: "appRanges",
  templateUrl:
  "./ranges.template.html",
  styleUrls: ["./ranges.css"]
})
export class Ranges implements OnInit, AfterViewInit {
  private arrInput: Array<any> = [];
  private arrMapInput: Array<any> = [];
  private arrValueInput: Array<any> = [];
  private parentArrInput: Array<any> = [];
  private childArrInput: Array<any> = [];
  private defaultRanges: any = {};
  private outputValue: any = {};
  private emitterChannel: EventEmitter<any>;
  private color: string = "#e62424";
  //private prop : any;
  //private prop0 : any;
  private badgeTextColor = "";
  private locale = {};
  @Input() colapsTabIndex: number;
  @Input() AllData: any;
  @Input() inputData: any;
  @Input() inputMapData: any;
  private chartType: string;
  public isDisabled: Boolean = true;
  public isChecked: Boolean = false;
  public allWidgets = window.appnamespace.tabregister[
    window.appnamespace.currentkey
  ].datapacket.layoutJSON
    ? window.appnamespace.tabregister[window.appnamespace.currentkey].datapacket
        .layoutJSON.widgets
    : window.appnamespace.tabregister[window.appnamespace.currentkey]
        .datapacket;
  //@Output() notify: EventEmitter<any> = new EventEmitter(true);
  rangeSetByDefault: boolean = true;
  SpecificValueByDefault: boolean = false;
  showValueContainer: boolean = true;
  showIconsContainer: boolean = false;
  showShapesPanel: boolean = true;
  showHideShapesPanelValues: boolean = true;
  showIconsPanel: boolean = false;
  showHideValueIconPanel: boolean = false;
  public colorPickerClass: any;
  public AllColors = [];
  private mapData: Array<any> = [
    {
      shape: "",
      value: "",
      color: ""
    }
  ];
  public thresholdValue: string = "ranges";
  public textPlaceholder: string = "Range Name";
  private colorFormat: ColorFormats = ColorFormats.hex;

  constructor(private emitterService: EmitterChanelBusService) {
    if (window["divdrawerconfig"].currentWidget.type !== "ComplexGauge") {
      this.defaultRanges = {
        ranges: [0, 1],
        status: "normal",
        colors: RED_HEX_COLOR_CODE,
        fontcolors: BLACK_HEX_COLOR_CODE,
        backgroundcolors: RED_HEX_COLOR_CODE,
        shape: "Dot"
      };
      const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
      this.arrInput[0] = tempObj;
      this.emitterChannel = this.emitterService.getBroadcastChannel(
        "RANGES_STATUS"
      );
      this.arrMapInput = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];

      this.arrValueInput = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
    } else {
      /* 	this.defaultRanges = { ranges: [null,0], colors: '#e62424' };
				let tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
				this.parentArrInput[0] = tempObj;
				this.defaultRanges = { ranges: [null,0], colors: '#e62424' };
				tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
				this.childArrInput[0] = tempObj;			 */
    }
  }

  //Upgradation codeing for custom color ranges
  upgradeJsonValforCharts(){
    switch(this.chartType){
      case "Tree" :
        let treeLessThanClr = this.AllData.properties["treeLessThanColor"];
        let treeGreaterThanClr = this.AllData.properties["treeGreaterThanColor"];
        if(treeLessThanClr == undefined || treeLessThanClr == null){
          this.AllData.properties["treeLessThanColor"] = "#535353";
        }  
        if(treeGreaterThanClr == undefined || treeGreaterThanClr == null){
          this.AllData.properties["treeGreaterThanColor"] = "#535353";
        }  
        break;
      case "bulletmap" :
        let bulletLessThanClr = this.AllData.properties["bulletLessThanColor"];
        let bulletGreaterThanClr = this.AllData.properties["bulletGreaterThanColor"];
        if(bulletLessThanClr == undefined || bulletLessThanClr == null){
          this.AllData.properties["bulletLessThanColor"] = "#000000";
        }  
        if(bulletGreaterThanClr == undefined || bulletGreaterThanClr == null){
          this.AllData.properties["bulletGreaterThanColor"] = "#000000";
        }  
        break;
      case "TagCloud" :
        let tagLessThanClr = this.AllData.properties["tagcloudLessThanColor"];
        let tagGreaterThanClr = this.AllData.properties["tagcloudGreaterThanColor"];
        if(tagLessThanClr == undefined || tagLessThanClr == null){
          this.AllData.properties["tagcloudLessThanColor"] = "#9dc3e6";
        }  
        if(tagGreaterThanClr == undefined || tagGreaterThanClr == null){
          this.AllData.properties["tagcloudGreaterThanColor"] = "#9dc3e6";
        }  
        break;
      case "Heatmap" :
        let heatLessThanBG = this.AllData.properties["heatmapLessThanBgColor"];
        let heatLessThanText = this.AllData.properties["heatmapLessThanTextColor"];
        let heatGreaterThanBG = this.AllData.properties["heatmapGreaterThanBgColor"];
        let heatGreaterThanText = this.AllData.properties["heatmapGreaterThanTextColor"];
        let heatLessThanInputName = this.AllData.properties["heatmapLessThanInputName"];
        let heatGreaterThanInputName = this.AllData.properties["heatmapGreaterThanInputName"];
        if(heatLessThanBG == undefined || heatLessThanBG == null){
          this.AllData.properties["heatmapLessThanBgColor"] = "#9dc3e6";
        }            
        if(heatLessThanText == undefined || heatLessThanText == null){
          this.AllData.properties["heatmapLessThanTextColor"] = "#000000";
        }            
        if(heatGreaterThanBG == undefined || heatGreaterThanBG == null){
          this.AllData.properties["heatmapGreaterThanBgColor"] = "#9dc3e6";
        }            
        if(heatGreaterThanText == undefined || heatGreaterThanText == null){
          this.AllData.properties["heatmapGreaterThanTextColor"] = "#000000";
        }            
        if(heatLessThanInputName == undefined || heatLessThanInputName == null){
          this.AllData.properties["heatmapLessThanInputName"] = "";
        }
        if(heatGreaterThanInputName == undefined || heatGreaterThanInputName == null){
          this.AllData.properties["heatmapGreaterThanInputName"] = "";
        }            
        break;
      case "Badge" :
        let labelClrsLess = this.AllData.properties["labelColorsLessThan"];
        let labelBgClrsLess = this.AllData.properties["labelBgColorsLessThan"];
        let valueClrsLess = this.AllData.properties["valueColorsLessThan"];
        let valueBgClrsLess = this.AllData.properties["valueBgColorsLessThan"];
        let unitClrsLess = this.AllData.properties["unitColorsLessThan"];
        let labelClrsGreater = this.AllData.properties["labelColorsGreaterThan"];
        let labelBgClrsGreater = this.AllData.properties["labelBgColorsGreaterThan"];
        let valueClrsGreater = this.AllData.properties["valueColorsGreaterThan"];
        let valueBgClrsGreater = this.AllData.properties["valueBgColorsGreaterThan"];
        let unitClrsGreater = this.AllData.properties["unitColorsGreaterThan"];
        if(labelClrsLess == undefined || labelClrsLess == null){
          this.AllData.properties["labelColorsLessThan"] = "['#000000']";
        }
        if(labelBgClrsLess == undefined || labelBgClrsLess == null){
          this.AllData.properties["labelBgColorsLessThan"] = "['#e62424']";
        }
        if(valueClrsLess == undefined || valueClrsLess == null){
          this.AllData.properties["valueColorsLessThan"] = "['#000000']";
        }
        if(valueBgClrsLess == undefined || valueBgClrsLess == null){
          this.AllData.properties["valueBgColorsLessThan"] = "['#e62424']";
        }
        if(unitClrsLess == undefined || unitClrsLess == null){
          this.AllData.properties["unitColorsLessThan"] = "['#000000']";
        }
        if(labelClrsGreater == undefined || labelClrsGreater == null){
          this.AllData.properties["labelColorsGreaterThan"] = "['#000000']";
        }
        if(labelBgClrsGreater == undefined || labelBgClrsGreater == null){
          this.AllData.properties["labelBgColorsGreaterThan"] = "['#e62424']";
        }
        if(valueClrsGreater == undefined || valueClrsGreater == null){
          this.AllData.properties["valueColorsGreaterThan"] = "['#000000']";
        }
        if(valueBgClrsGreater == undefined || valueBgClrsGreater == null){
          this.AllData.properties["valueBgColorsGreaterThan"] = "['#e62424']";
        }
        if(unitClrsGreater == undefined || unitClrsGreater == null){
          this.AllData.properties["unitColorsGreaterThan"] = "['#000000']";
        }
        break;
      case "Topology" :
        let topoLessThanThickness = this.AllData.properties["topologyLessThanThickness"];
        let topoGreaterThanThickness = this.AllData.properties["topologyGreaterThanThickness"];
        let topoLessThanclr = this.AllData.properties["topologyLessThanColor"];
        let topoLessGreaterclr = this.AllData.properties["topologyGreaterThanColor"];
        if(topoLessThanThickness == undefined || topoLessThanThickness == null){
          this.AllData.properties["topologyLessThanThickness"] = "1";
        }
        if(topoGreaterThanThickness == undefined || topoGreaterThanThickness == null){
          this.AllData.properties["topologyGreaterThanThickness"] = "1";
        }
        if(topoLessThanclr == undefined || topoLessThanclr == null){
          this.AllData.properties["topologyLessThanColor"] = "#535353";
        }
        if(topoLessGreaterclr == undefined || topoLessGreaterclr == null){
          this.AllData.properties["topologyGreaterThanColor"] = "#535353";
        }
        break;
      case "Grid":
        let gridLessThanStatus = this.AllData.columns[this.colapsTabIndex]["gridDropDownLessThanStatus"];
        let gridGreaterThanStatus = this.AllData.columns[this.colapsTabIndex]["gridDropDownGreaterThanStatus"];
        if (gridLessThanStatus == undefined || gridLessThanStatus == null){
          this.AllData.columns[this.colapsTabIndex]["gridDropDownLessThanStatus"] = "normal";
        }
        if (gridGreaterThanStatus == undefined || gridGreaterThanStatus == null){
          this.AllData.columns[this.colapsTabIndex]["gridDropDownGreaterThanStatus"] = "normal";
        }

        let gridLessThanclrs = this.AllData.columns[this.colapsTabIndex]["gridLessThancolors"];
        let gridGreaterThanclrs = this.AllData.columns[this.colapsTabIndex]["gridGreaterThancolors"];
        let gridLessThanFontclrs = this.AllData.columns[this.colapsTabIndex]["gridLessThanfontcolors"];
        let gridGreaterFontThanclrs = this.AllData.columns[this.colapsTabIndex]["gridGreaterThanfontcolors"];

        if (gridLessThanclrs == undefined || gridLessThanclrs == null){
          this.AllData.columns[this.colapsTabIndex]["gridLessThancolors"] = RED_HEX_COLOR_CODE;
        }
        if (gridGreaterThanclrs == undefined || gridGreaterThanclrs == null){
          this.AllData.columns[this.colapsTabIndex]["gridGreaterThancolors"] = RED_HEX_COLOR_CODE;
        }
        if (gridLessThanFontclrs == undefined || gridLessThanFontclrs == null){
          this.AllData.columns[this.colapsTabIndex]["gridLessThanfontcolors"] = BLACK_HEX_COLOR_CODE;
        }
        if (gridGreaterFontThanclrs == undefined || gridGreaterFontThanclrs == null){
          this.AllData.columns[this.colapsTabIndex]["gridGreaterThanfontcolors"] = BLACK_HEX_COLOR_CODE;
        }
        break;
        case "Map":
        let gisLessThanStatus = this.AllData.properties["lessThanshape"];
        let gisGreaterThanStatus = this.AllData.properties["greaterThanshape"];
        let gisLessThanClr = this.AllData.properties["gisLessThanColor"];
        let gisGreaterThanClr = this.AllData.properties["gisGreaterThanColor"];
        if(gisLessThanStatus == undefined || gisLessThanStatus == null){
          this.AllData.properties["lessThanshape"] = "Dot";
        }
        if(gisGreaterThanStatus == undefined || gisGreaterThanStatus == null){
          this.AllData.properties["greaterThanshape"] = "Dot";
        }
        if(gisLessThanClr == undefined || gisLessThanClr == null){
          this.AllData.properties["gisLessThanColor"] = "#000000";
        }
        if(gisGreaterThanClr == undefined || gisGreaterThanClr == null){
          this.AllData.properties["gisGreaterThanColor"] = "#000000";
        }
        break;
    }
  }

  ngOnInit() {
    this.chartType = this.AllData.type;
    this.upgradeJsonValforCharts();
    if(window["divdrawerconfig"].currentWidget.type == rangesChartType.grid){
      for(let i =0; i< window["divdrawerconfig"].currentWidget["columns"].length;i++){
      this.AllData.columns[i].ranges = this.removeElement(window.divdrawerconfig.currentWidget.columns[i].ranges,"0");
      window["divdrawerconfig"].currentWidget.columns[i].ranges = this.removeElement(window.divdrawerconfig.currentWidget.columns[i].ranges,"0");
    }
      if(window["divdrawerconfig"].currentWidget["checkedRadios"] !== undefined){
        let checkedRadioArray = window["divdrawerconfig"].currentWidget["checkedRadios"][3].split(",");
        let checkedRadioObject = JSON.parse(checkedRadioArray).splice(1);
         for(let i =0; i< window["divdrawerconfig"].currentWidget["columns"].length;i++){
          if(checkedRadioArray.length > 2 && i != 0){
              window["divdrawerconfig"].currentWidget["columns"][i]["propOption"] = checkedRadioObject[i].replace(/[0-9]/g, '');
          }else{
              window["divdrawerconfig"].currentWidget["columns"][i]["propOption"] = checkedRadioObject[0].replace(/[0-9]/g, '');
         }
        } 
        delete window["divdrawerconfig"].currentWidget["checkedRadios"];
          }  
    }
    if (this.chartType !== "ComplexGauge") {      
      this.initRange();
    } else {
      this.initComplexGaugeRange();
    }

    this.locale = {
      //Grid
      "Show Number Only":
        window["locale"].widget.setProperties.grid.numberDataTypeNumberOnly,
      "Show Number + Status Icons as per Range":
        window["locale"].widget.setProperties.grid.numberDataTypeNumberAndIcons,
      Range: window["locale"].widget.setProperties.grid.numberDataTypeRange,
      Icons: window["locale"].widget.setProperties.grid.numberDataTypeIcons,
      normal: window["locale"].widget.setProperties.grid.numberDataTypeNormal,
      critical:
        window["locale"].widget.setProperties.grid.numberDataTypeCritical,
      warning: window["locale"].widget.setProperties.grid.numberDataTypeWarning,
      fatal: window["locale"].widget.setProperties.grid.numberDataTypeFatal,
      indeterminate:
        window["locale"].widget.setProperties.grid.numberDataTypeIndeterminate,
      info: window["locale"].widget.setProperties.grid.numberDataTypeInfo,
      undefined:
        window["locale"].widget.setProperties.grid.numberDataTypeUndefined,
      unknown: window["locale"].widget.setProperties.grid.numberDataTypeUnknown,
      "warning major":
        window["locale"].widget.setProperties.grid.numberDataTypeWarningMajor,
      "+ Add Another": window["locale"].dataDefiPopover.AddAnother,
      "Show Number + Change Background Color as per Range":
        window["locale"].widget.setProperties.grid.numberDataTypeNumberAndColor,
      BG: window["locale"].widget.setProperties.grid.numberDataTypeBackground,
      Text: window["locale"].widget.setProperties.grid.numberDataTypeText,
      "Replace Number with Progress Bar":
        window["locale"].widget.setProperties.grid
          .numberDataTypeReplaceWithProgress,
      "Progress Bar Range":
        window["locale"].widget.setProperties.grid.numberDataTypeBarRange,
      //Badge
      "Fixed Text Color":
        window["locale"].widget.setProperties.badge.fixedTextColor,
      Color: window["locale"].widget.setProperties.badge.fixedTextColor_Color,
      "Change Text Color as per Range":
        window["locale"].widget.setProperties.badge.changeColorWithRange,
      Colors: window["locale"].widget.setProperties.chartProperties.panel.color,
      "Fixed Background and Text Colors":
        window["locale"].widget.setProperties.badge.fixedColors,
      title: window["locale"].widget.properties.title,
      Value: window["locale"].dataDefiPopover.Value,
      Unit: window["locale"].widget.properties.unit,
      "Default Color Range":
        window["locale"].widget.setProperties.color.colorRangeDefault,
      //heeatMap labels
      "Show Heat Value on each Box":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .showheatvalue,
      "Use Default Colors as per Theme":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .defaultColors,
      "Define a Custom Static Color Range":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .staticColorRange,
      "In a Static Range, you define each color of every range that you specify. You can also give a name to each range.":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .staticColorRangeDescription,
      Name: window["locale"].widget.gridcolumn.name,
      "Show Range Name on each Box":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .showRangeName,
      "Show Range in Legend":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .showRangeLegend,
      "Define a Custom Linear Range":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .defineCustomRange,
      "In a Linear Range, you only specify the min and max heat colors. Rest of the colors in between are rendered automatically. Text colors can not be controlled in this range.":
        window["locale"].widget.setProperties.chartProperties.heatmap
          .defineCustomRangeDescription,
      "Min Heat":
        window["locale"].widget.setProperties.chartProperties.heatmap.minHeat,
      "Max Heat":
        window["locale"].widget.setProperties.chartProperties.heatmap.maxHeat,
      Delete: window["common"].users.button.delete,
      "Bullet Color": window["locale"].widget.setProperties.bullet.bulletcolor,
      "Define a Custom Color Range":
        window["locale"].widget.setProperties.bullet.defineCustomColors,
      "In a Custom Range, you define each color of every range that you specify. You can also define the color of the bullet.":
        window["locale"].widget.setProperties.bullet.defineCustomColorsHelptext,
      "Left Top": window["locale"].widget.setProperties.quadrant.lefttop,
      "Left Bottom": window["locale"].widget.setProperties.quadrant.leftbottom,
      "Right Top": window["locale"].widget.setProperties.quadrant.righttop,
      "Right Bottom":
        window["locale"].widget.setProperties.quadrant.rightbottom,
      "Max Value Color":
        window["locale"].widget.setProperties.chartProperties.tagcloud.maxColor,
      "Min Value Color":
        window["locale"].widget.setProperties.chartProperties.tagcloud.minColor,
      "No Scale & Default Colors as per Theme":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .noscaledefaultColors,
      "Show a Linear Scale":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .definelinearscale,
      "Show Scale as per Threshold":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .thresholdscale,
      "Show Scale as per Category":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .categoryscale,
      "This will not show any scale, and will render the Tag Cloud as per the default colors of the selected Theme by the user in the Engine.":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .noscaleDescription,
      "This will show a scale as per the Value/Frequency of the Word, and Tag Cloud will be rendered as per the min and max colors that you set.":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .linearscaleDescription,
      "This will show a scale and Tag Cloud will be rendered as per the threshold colors thatare set of the Value/Frequency of the Word.":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .thresholdscaleDescription,
      "Shows a scale according to the Category of the word. Renders the chart colors according to the Theme set on Engine.":
        window["locale"].widget.setProperties.chartProperties.tagcloud
          .categoryscaleDescription,
      "As per Theme": window["locale"].widget.setProperties.tree.asPerTheme,
      "Specify node label color for a range":
        window["locale"].widget.setProperties.tree.nodeLabelColors,
      "Label text": window["locale"].widget.setProperties.tree.labelText,
      "Cascade alert range color to all its parent nodes":
        window["locale"].widget.setProperties.tree.cascadeAlertRange,
      "From the range list, select the range that indicates an alert range.":
        window["locale"].widget.setProperties.tree.setColors,
      "Edge color": window["locale"].widget.newWidget.edgeColor,
      Thickness: window["locale"].widget.advancedChart.widgetType.thickness,
      px: window["locale"].widget.setProperties.chartProperties.badge.pixel,
      "Specify edge color and thickness for a range":
        window["locale"].widget.newWidget.specifyRangeForEdge,
      "Specify a range and its color.":
        window["locale"].widget.setProperties.treemap.specifyRangeForTreemap,
      "Specify colors for min and max values. For the other values in the range, colors are rendered automatically.":
        window["locale"].widget.setProperties.treemap
          .specifyLinearRangeForTreemap,
      "Max value": window["locale"].widget.setProperties.treemap.maxvalue,
      "Min value": window["locale"].widget.setProperties.treemap.minvalue,
      Dot: window["locale"].widget.setProperties.chartProperties.map.dot,
      Shape: window["locale"].widget.setProperties.chartProperties.map.shape,
      Square: window["locale"].widget.setProperties.chartProperties.map.square,
      Triangle:
        window["locale"].widget.setProperties.chartProperties.map.triangle,
      Diamond:
        window["locale"].widget.setProperties.chartProperties.map.diamond,
      "Define Threshold based on":
        window["locale"].widget.setProperties.chartProperties.map
          .defineThreshold,
      "Show Range as Legend":
        window["locale"].widget.setProperties.treemap.showRangeLegend,
      Shapes: window["locale"].widget.setProperties.chartProperties.map.shapes,
      Indicators:
        window["locale"].widget.setProperties.chartProperties.map.showOnMap,
      KPI: window["locale"].widget.setProperties.chartProperties.map.selectKPI,
      Custom: window["locale"].widget.setProperties.widgetArea.borderCustom,
      "Enter a KPI column name":
      window["locale"].widget.setProperties.chartProperties.map.enterKPIName,
      "Define Background and Text Colors for value ranges":
      window["locale"].widget.setProperties.badge.changeColorsAsPerRange,
      "Title BG": window["locale"].widget.setProperties.badge.titleBackground,
      "Value BG": window["locale"].widget.setProperties.badge.valueBackground,
      "In a static range, specify a range and define a color for the range and its labels.": window["locale"].widget.setProperties.chartProperties.CalendarHeatmap.staticRangeHelpText,
      "Define a Custom Linear Color Range": window["locale"].widget.setProperties.chartProperties.CalendarHeatmap.linearRange,
      "In a linear range, define colors for minimum and maximum heat values. Colors for all the intermediate values are rendered automatically. Default label colors are used.": window["locale"].widget.setProperties.chartProperties.CalendarHeatmap.linearRangeHelpText,   
      "Range Name": window["locale"].widget.setProperties.heatmap.rangeName,
    };

    if (this.inputData.chartType !== "badge") {
      var colorpicker = setInterval(() => {
        let ele = $("appRanges .html-color-picker-normal-size");
        if (ele.length > 0) {
          ele.css({
            width: "20px",
            height: "20px"
          });
        } else {
          clearInterval(colorpicker);
        }
      }, 200);
    }
  }

  ngAfterViewInit() {}

  initRange() {
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      if (this.AllData.columns[this.colapsTabIndex]["ranges"]) {
        const arrRanges = [];

        const strRanges: string = this.AllData.columns[this.colapsTabIndex][
          "ranges"
        ];
        const arrStrRanges = strRanges.split(",");
        const strgridLessThanStatus: string = this.AllData.columns[this.colapsTabIndex][
          "gridDropDownLessThanStatus"
        ];
        // add check if strgridLessThanStatus is undefined the pass empty array
        const arrStrgridLessThanStatus = ( strgridLessThanStatus != undefined ) ? strgridLessThanStatus.split(",") : [];
        const strStatus: string = this.AllData.columns[this.colapsTabIndex][
          "status"
        ];
        const arrStrStatus = strStatus.split(",");
        const strgridGreaterThanStatus: string = this.AllData.columns[this.colapsTabIndex][
          "gridDropDownGreaterThanStatus"
        ];        
        const arrStrgridGreaterThanStatus = strgridGreaterThanStatus.split(",");
        const strcolor: string = this.AllData.columns[this.colapsTabIndex][
          "colors"
        ];
        let arrstrcolor: any;
        if (strcolor !== undefined) arrstrcolor = strcolor.split(",");
        let arrfontstrcolor: any;
        const fontstrcolor: string = this.AllData.columns[this.colapsTabIndex][
          "fontcolors"
        ];
        if (fontstrcolor !== undefined)
          arrfontstrcolor = fontstrcolor.split(",");
        if (arrstrcolor !== undefined) {
          for (let i = 0; i < arrstrcolor.length; i++) {
            if (arrstrcolor[i] == "") arrstrcolor[i] = RED_HEX_COLOR_CODE;
          }
        }
        //Grid LessThan "BG color" and "Text color" values get from column ColapsTab 
        const strLessThancolor: string = this.AllData.columns[this.colapsTabIndex][
          "gridLessThancolors"
        ];
        let arrstrLessThancolor: any;
          if (strLessThancolor !== undefined){
            arrstrLessThancolor = strLessThancolor.split(",");
          }
        let arrfontstrLessThancolor: any;
        const fontstrLessThancolor: string = this.AllData.columns[this.colapsTabIndex][
          "gridLessThanfontcolors"
        ];
        if (fontstrLessThancolor !== undefined){
          arrfontstrLessThancolor = fontstrLessThancolor.split(",");
        }
        if (arrstrLessThancolor !== undefined) {
          for (let i = 0; i < arrstrLessThancolor.length; i++) {
          if (arrstrLessThancolor[i] == "") arrstrLessThancolor[i] = RED_HEX_COLOR_CODE;
          }
        }
        //Grid GraterThan "BG color" and "Text color" values get from column ColapsTab
        const strGreaterThancolor: string = this.AllData.columns[this.colapsTabIndex][
          "gridGreaterThancolors"
        ];
        let arrstrGreaterThancolor: any;
        if (strGreaterThancolor !== undefined){
          arrstrGreaterThancolor = strGreaterThancolor.split(",");
        }
        let arrfontstrGreaterThancolor: any;
        const fontstrGreaterThancolor: string = this.AllData.columns[this.colapsTabIndex][
          "gridGreaterThanfontcolors"
        ];
        if (fontstrGreaterThancolor !== undefined){
          arrfontstrGreaterThancolor = fontstrGreaterThancolor.split(",");
        }
        if (arrstrGreaterThancolor !== undefined) {
          for (let i = 0; i < arrstrGreaterThancolor.length; i++) {
          if (arrstrGreaterThancolor[i] == "") arrstrGreaterThancolor[i] = RED_HEX_COLOR_CODE;
          }
        }
        //Show default "Status Dropdown" Icons for LessThan, Inbetween and GreaterThan "Grid" ranges 
        if (arrStrgridLessThanStatus !== undefined) {
          for (let i = 0; i < arrStrgridLessThanStatus.length; i++) {
          if (arrStrgridLessThanStatus[i] == "") 
            arrStrgridLessThanStatus[i] = "normal";
          }
        }
        if (arrStrStatus !== undefined) {
          for (let i = 0; i < arrStrStatus.length; i++) {
            if (arrStrStatus[i] == "") arrStrStatus[i] = "normal";
          }
        }
        if (arrStrgridGreaterThanStatus !== undefined) {
          for (let i = 0; i < arrStrgridGreaterThanStatus.length; i++) {
            if (arrStrgridGreaterThanStatus[i] == "") arrStrgridGreaterThanStatus[i] = "normal";
          }
        }
        //Show default "Colors" Icons for LessThan, Inbetween and GreaterThan "Grid" ranges 
        if (arrfontstrcolor !== undefined) {
          for (let i = 0; i < arrfontstrcolor.length; i++) {
            if (arrfontstrcolor[i] == "") arrfontstrcolor[i] = BLACK_HEX_COLOR_CODE;
          }
        }
        if (arrfontstrLessThancolor !== undefined) {
          for (let i = 0; i < arrfontstrLessThancolor.length; i++) {
            if (arrfontstrLessThancolor[i] == "") arrfontstrLessThancolor[i] = BLACK_HEX_COLOR_CODE;
          }
        }
        if (arrfontstrGreaterThancolor !== undefined) {
          for (let i = 0; i < arrfontstrGreaterThancolor.length; i++) {
            if (arrfontstrGreaterThancolor[i] == "") arrfontstrGreaterThancolor[i] = BLACK_HEX_COLOR_CODE;
          }
        }
        if (arrStrRanges.length > 1) {
          this.defaultRanges = {
            ranges: [arrStrRanges[0], arrStrRanges[1]],
            status: arrStrStatus[0],
            gridDropDownLessThanStatus: arrStrgridLessThanStatus[0],
            gridDropDownGreaterThanStatus: arrStrgridGreaterThanStatus[0],
            colors: arrstrcolor[0],
            fontcolors: arrfontstrcolor[0],
            gridLessThancolors: arrstrLessThancolor[0],
            gridLessThanfontcolors: arrfontstrLessThancolor[0],
            gridGreaterThancolors: arrstrGreaterThancolor[0],
            gridGreaterThanfontcolors: arrfontstrGreaterThancolor[0]
          };
          const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
          this.arrInput = [];
          this.arrInput.push(tempObj);
          this.arrInput[0].gridGreaterThanValue= 1;
          this.arrInput[0].gridColorPerRangeGreaterThanValue= 1;
        }

        for (let i = 0; i < arrStrRanges.length; i++) {
          if (i > 1) {
            this.defaultRanges = {
              ranges: [null, arrStrRanges[i]],
              status: arrStrStatus[i - 1],
              gridDropDownLessThanStatus: arrStrgridLessThanStatus[i - 1],
              gridDropDownGreaterThanStatus: arrStrgridGreaterThanStatus[i - 1],
              colors:
                arrstrcolor[i - 1] == undefined
                  ? RED_HEX_COLOR_CODE
                  : arrstrcolor[i - 1],
              fontcolors:
                arrfontstrcolor[i - 1] == undefined
                  ? BLACK_HEX_COLOR_CODE
                  : arrfontstrcolor[i - 1],
              gridLessThancolors:
                arrstrLessThancolor[i - 1] == undefined
                  ? RED_HEX_COLOR_CODE
                  : arrstrLessThancolor[i - 1],
              gridLessThanfontcolors:
                arrfontstrLessThancolor[i - 1] == undefined
                  ? BLACK_HEX_COLOR_CODE
                  : arrfontstrLessThancolor[i - 1],
              gridGreaterThancolors:
                arrstrGreaterThancolor[i - 1] == undefined
                    ? RED_HEX_COLOR_CODE
                    : arrstrGreaterThancolor[i - 1],
              gridGreaterThanfontcolors:
                arrfontstrGreaterThancolor[i - 1] == undefined
                    ? BLACK_HEX_COLOR_CODE
                    : arrfontstrGreaterThancolor[i - 1]
            };
            const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
            this.arrInput.push(tempObj);
          }
        }
      }
    } else if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
      this.arrMapInput = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];

      this.arrValueInput = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
    } else {
      const arrRanges = [];
      let strRanges: string;
      if (this.AllData.properties.ranges) {
        strRanges = this.AllData.properties["ranges"];

        var arrStrRanges = strRanges.split(",").toString();
        let strcolor: string;
        if (this.AllData.properties["colors"])
          strcolor = this.AllData.properties["colors"];
        let arrstrcolor;
        if (strcolor !== undefined) arrstrcolor = strcolor.split(",");

        let strbgcolor: string = this.AllData.properties["backgroundcolors"];
        let arrstrbgcolor = [];
        if (strbgcolor !== undefined) arrstrbgcolor = strbgcolor.split(",");
        const strNames: string = this.AllData.properties["names"];
        let arrstrnames = [];
        if (strNames !== undefined) arrstrnames = strNames.split(",");

        const strLabelColors: string = this.AllData.properties["labelColors"];
        let arrstrLabelColors = [];
        if (strLabelColors !== undefined)
          arrstrLabelColors = strLabelColors.split(",");

        //"Badge chart" LessThan & GreaterThan color values retain from AllData.properties
        const strlabelColorsLessThan: string = this.AllData.properties["labelColorsLessThan"];
        let arrstrlabelColorsLessThan = [];
        if (strlabelColorsLessThan !== undefined)
          arrstrlabelColorsLessThan = strlabelColorsLessThan.split(",");
          
        const strlabelColorsGreaterThan: string = this.AllData.properties["labelColorsGreaterThan"];
        let arrstrlabelColorsGreaterThan = [];
        if (strlabelColorsGreaterThan !== undefined)
          arrstrlabelColorsGreaterThan = strlabelColorsGreaterThan.split(",");

        const strLabelBgColorsLessThan: string = this.AllData.properties[
          "labelBgColorsLessThan"
        ];
        const strLabelBgColors: string = this.AllData.properties[
          "labelBgColors"
        ];
        const strLabelBgColorsGreaterThan: string = this.AllData.properties[
          "labelBgColorsGreaterThan"
        ];
        let arrstrLabelBgColors = [];
        if (strLabelBgColors !== undefined)
          arrstrLabelBgColors = strLabelBgColors.split(",");

        let arrstrLabelBgColorsLessThan = [];
        if (strLabelBgColorsLessThan !== undefined){
          arrstrLabelBgColorsLessThan = strLabelBgColorsLessThan.split(",");
        }
        let arrstrLabelBgColorsGreaterThan = [];
        if (strLabelBgColorsGreaterThan !== undefined){
          arrstrLabelBgColorsGreaterThan = strLabelBgColorsGreaterThan.split(",");
        }
        const strValueColors: string = this.AllData.properties["valueColors"];
        let arrstrValueColors = [];
        if (strValueColors !== undefined)
          arrstrValueColors = strValueColors.split(",");

        const strvalueColorsLessThan: string = this.AllData.properties["valueColorsLessThan"];
        let arrstrvalueColorsLessThan = [];
        if (strvalueColorsLessThan !== undefined)
          arrstrvalueColorsLessThan = strvalueColorsLessThan.split(",");

        const strvalueColorsGreaterThan: string = this.AllData.properties["valueColorsGreaterThan"];
        let arrstrvalueColorsGreaterThan = [];
        if (strvalueColorsGreaterThan !== undefined)
          arrstrvalueColorsGreaterThan = strvalueColorsGreaterThan.split(",");

        const strValueBgColors: string = this.AllData.properties["valueBgColors"];
        let arrstrValueBgColors = [];
        if (strValueBgColors !== undefined)
          arrstrValueBgColors = strValueBgColors.split(",");

        const strvalueBgColorsLessThan: string = this.AllData.properties["valueBgColorsLessThan"];
        let arrstrvalueBgColorsLessThan = [];
        if (strvalueBgColorsLessThan !== undefined)
          arrstrvalueBgColorsLessThan = strvalueBgColorsLessThan.split(",");

        const strvalueBgColorsGreaterThan: string = this.AllData.properties["valueBgColorsGreaterThan"];
        let arrstrvalueBgColorsGreaterThan = [];
        if (strvalueBgColorsGreaterThan !== undefined)
          arrstrvalueBgColorsGreaterThan = strvalueBgColorsGreaterThan.split(",");

        const strUnitColors: string = this.AllData.properties["unitColors"];
        let arrstrUnitColors = [];
        if (strUnitColors !== undefined) {
          arrstrUnitColors = strUnitColors.split(",");
        }

        const strunitColorsLessThan: string = this.AllData.properties["unitColorsLessThan"];
        let arrstrunitColorsLessThan = [];
        if (strunitColorsLessThan !== undefined) {
          arrstrunitColorsLessThan = strunitColorsLessThan.split(",");
        }
        const strunitColorsGreaterThan: string = this.AllData.properties["unitColorsGreaterThan"];
        let arrstrunitColorsGreaterThan = [];
        if (strunitColorsGreaterThan !== undefined) {
          arrstrunitColorsGreaterThan = strunitColorsGreaterThan.split(",");
        }

        //Added below code for "Topology range" - Thickness and Color values retain
        const strThickness: string = this.AllData.properties["thickness"];
        let arrstrThicknesss = [];
        if (strThickness !== undefined)
        arrstrThicknesss = strThickness.split(",");

        const strLessThanThickness: string = this.AllData.properties["topologyLessThanThickness"];
        let arrstrLessThanThicknesss = [];
        if (strLessThanThickness !== undefined)
        arrstrLessThanThicknesss = strLessThanThickness.split(",");

        const strGreaterThanThickness: string = this.AllData.properties["topologyGreaterThanThickness"];
        let arrstrGreaterThanThicknesss = [];
        if (strGreaterThanThickness !== undefined)
        arrstrGreaterThanThicknesss = strGreaterThanThickness.split(",");

        const strtopologyLessThanColor: string = this.AllData.properties["topologyLessThanColor"];
        let arrstrtopologyLessThanColor = [];
        if (strtopologyLessThanColor !== undefined)
        arrstrtopologyLessThanColor = strtopologyLessThanColor.split(",");  
        
        const strtopologyGreaterThanColor: string = this.AllData.properties["topologyGreaterThanColor"];
        let arrstrtopologyGreaterThanColor = [];
        if (strtopologyGreaterThanColor !== undefined)
        arrstrtopologyGreaterThanColor = strtopologyGreaterThanColor.split(",");  

        let strRange; 
        let Ranges;
        let arrRanges = [],
          count = 0;
        if (arrStrRanges) {
          Ranges = arrStrRanges.replace(/[\[\]'"]+/g, "").split(",");
          Ranges.forEach( (ele,index) => {
          if( index == 0 ) {
            strRange =  parseFloat(ele); 
          } else {
            strRange =  strRange + ',' + parseFloat(ele); 
          }
          });
          this.arrInput.length = 0;
        }
        
        strRange = '[' + strRange + ']';
        arrRanges = JSON.parse( strRange );
        setTimeout(() => {
          this.arrInput.length = 0;
          for (let i = 0; i < arrRanges.length; i++) {
            if (i > 1 || i == 0) {
              count = i === 0 ? 0 : i - 1;
              this.defaultRanges = {
                ranges: [
                  count === 0 ? arrRanges[0] : 0,
                  count === 0 ? arrRanges[1] : arrRanges[i]
                ],
                colors: arrstrcolor[count],
                backgroundcolors: arrstrbgcolor[count],
                rangeNames: arrstrnames[count],
                labelColors: arrstrLabelColors[count],
                labelBgColors: arrstrLabelBgColors[count],
                labelColorsLessThan: arrstrlabelColorsLessThan[count],
                labelColorsGreaterThan: arrstrlabelColorsGreaterThan[count],
                labelBgColorsLessThan: arrstrLabelBgColorsLessThan[count],
                labelBgColorsGreaterThan: arrstrLabelBgColorsGreaterThan[count],
                valueColors: arrstrValueColors[count],
                valueColorsLessThan: arrstrvalueColorsLessThan[count],
                valueColorsGreaterThan: arrstrvalueColorsGreaterThan[count],
                valueBgColors: arrstrValueBgColors[count],
                valueBgColorsLessThan: arrstrvalueBgColorsLessThan[count],
                valueBgColorsGreaterThan: arrstrvalueBgColorsGreaterThan[count],
                unitColors: arrstrUnitColors[count],
                unitColorsLessThan: arrstrunitColorsLessThan[count],
                unitColorsGreaterThan: arrstrunitColorsGreaterThan[count],
                thickness: arrstrThicknesss[count],
                topologyLessThanThickness: arrstrLessThanThicknesss[count],
                topologyGreaterThanThickness: arrstrGreaterThanThicknesss[count],
                topologyLessThanColor: arrstrtopologyLessThanColor[count],
                topologyGreaterThanColor: arrstrtopologyGreaterThanColor[count]
              };
              const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
              this.arrInput.push(tempObj);
            }
          }
        }, 100);
      }
    }

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  initComplexGaugeRange() {
    if (this.AllData.properties[0].ranges) {
      const arrRanges = [];
      let strRanges: string;
      strRanges = this.AllData.properties[0]["ranges"];
      const arrStrRanges = strRanges.split(",");
      let strcolor: string;
      if (this.AllData.properties[0]["colors"])
        strcolor = this.AllData.properties[0]["colors"];
      let arrstrcolor;
      if (strcolor !== undefined) arrstrcolor = strcolor.split(",");

      if (arrStrRanges.length > 1) {
        this.defaultRanges = {
          ranges: [arrStrRanges[0], arrStrRanges[1]],
          colors: arrstrcolor[0]
        };
        const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
        this.parentArrInput = [];
        this.parentArrInput.push(tempObj);
      }

      for (let i = 0; i < arrStrRanges.length; i++) {
        if (i > 1) {
          this.defaultRanges = {
            ranges: [null, arrStrRanges[i]],
            colors: arrstrcolor[i - 1]
          };
          const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
          this.parentArrInput.push(tempObj);
        }
      }
    }
    if (this.AllData.properties[1].ranges) {
      const arrRanges = [];
      let strRanges: string;
      strRanges = this.AllData.properties[1]["ranges"];
      const arrStrRanges = strRanges.split(",");
      let strcolor: string;
      if (this.AllData.properties[1]["colors"])
        strcolor = this.AllData.properties[1]["colors"];
      let arrstrcolor;
      if (strcolor !== undefined) arrstrcolor = strcolor.split(",");

      if (arrStrRanges.length > 1) {
        this.defaultRanges = {
          ranges: [arrStrRanges[0], arrStrRanges[1]],
          colors: arrstrcolor[0]
        };
        const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
        this.childArrInput = [];
        this.childArrInput.push(tempObj);
      }

      for (let i = 0; i < arrStrRanges.length; i++) {
        if (i > 1) {
          this.defaultRanges = {
            ranges: [null, arrStrRanges[i]],
            colors: arrstrcolor[i - 1]
          };
          const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
          this.childArrInput.push(tempObj);
        }
      }
    }

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  getRange(rowIndex, inputname, inputIndex, incrementValueFlag) {
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      if(inputname == "gridDropDownLessThanStatus" || inputname == "gridLessThancolors" || inputname == "gridLessThanfontcolors"){
        let value = "";
        if (inputIndex !== undefined) {
          value = this.arrInput[0][inputname];          
          if (inputname == "gridDropDownLessThanStatus" && value !== undefined) {
            return 0;
          }
        } else {
          value = this.arrInput[0][inputname];
        }
        if (inputname == "gridLessThancolors") {
          if (value == undefined) {
            value = RED_HEX_COLOR_CODE;
          } else {
            value = this.arrInput[0][inputname];
          }
        }
        if (inputname == "gridDropDownLessThanStatus") {
          if (value == undefined) {
            value = "normal";
          }
        }
        if (inputname == "gridLessThanfontcolors") {
          if (value == undefined) {
            value = BLACK_HEX_COLOR_CODE;
          } else {
            value = this.arrInput[0][inputname];
          }
        }
        return value;
      }else if(inputname == "gridDropDownGreaterThanStatus" || inputname == "gridGreaterThancolors" || inputname == "gridGreaterThanfontcolors"){
        let value = "";
        if (inputIndex !== undefined) {
          value = this.arrInput[0][inputname];
          if (inputname == "gridDropDownGreaterThanStatus" && value == undefined) {
            return 0;
          }
        } else {
          value = this.arrInput[0][inputname];
        }
        if (inputname == "gridGreaterThancolors") {
          if (value == undefined) {
            value = RED_HEX_COLOR_CODE;
          } else {
            value = this.arrInput[0][inputname];
          }
        }
        if (inputname == "gridDropDownGreaterThanStatus") {
          if (value == undefined ) {
          value = "normal";
          }
        }
        if (inputname == "gridGreaterThanfontcolors") {
          if (value == undefined) {
            value = BLACK_HEX_COLOR_CODE;
          } else {
            value = this.arrInput[0][inputname];
          }
        }
        return value;
      } else{    
        let value = "";
        let updatedValue = "";
        if (inputIndex !== undefined) {
          value = this.arrInput[rowIndex][inputname][inputIndex];
          if (inputname == "ranges" && value == null) {
            return 0;
          }
        } else {
          value = this.arrInput[rowIndex][inputname];
        }
        if (inputname == "colors") {
          if (value == undefined) {
            value = RED_HEX_COLOR_CODE;
          }
        }
        if (inputname == "status") {
          if (value == undefined) {
            value = "normal";
          }
        }
        if (inputname == "fontcolors") {
          if (value == undefined) {
            value = BLACK_HEX_COLOR_CODE;
          }
        }
        if (inputname == "shape") {
          if (value == undefined) {
            value = "Dot";
          }
        }
        return value; 
      } 
    } else if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
      if (this.AllData.properties["KPIStringValuesFlag"] == "kpiString") {
        if (this.AllData.properties["KPIStringData"].length - 1 < rowIndex) {
          let KPIStringData = {
            value: "",
            shape: "Dot",
            colors: "#000000"
          };
          KPIStringData = JSON.parse(JSON.stringify(KPIStringData));
          this.AllData.properties["KPIStringData"].push(KPIStringData);
        }
        this.AllData.properties.ranges = "[0,1]";
        this.arrMapInput = this.AllData.properties["KPIStringData"];
        if (inputname == "value") {
          return this.AllData.properties["KPIStringData"][rowIndex].value;
        } else if (inputname == "shape") {
          return this.AllData.properties["KPIStringData"][rowIndex].shape;
        } else if (inputname == "kpiColumn2") {
          return this.AllData.properties.kpiColumn2;
        }
      } else if (inputname == "lessThanshape") {
        return this.AllData.properties.lessThanshape;
      } else if (inputname == "greaterThanshape") {
        return this.AllData.properties.greaterThanshape;
      } else if (this.AllData.properties["KPIStringValuesFlag"] == "kpiValues") {
        this.arrInput = this.AllData.properties["KPIValuesData"];
        if (this.arrInput.length == 0) {
          this.arrInput = [];
          let defRanges = {
            ranges: [null, 1],
            status: "normal",
            colors: "#000000",
            fontcolors: "#000000",
            backgroundcolors: "#e62424",
            shape: "Dot"
          };
          const tempObj = JSON.parse(JSON.stringify(defRanges));
          this.arrInput[0] = tempObj;
        }

        this.AllData.properties["ranges"] = this.AllData.properties[
          "ranges"
        ].replace(/[\\"]/g, "");

        let value = "";
        let updatedValue = "";
        if (inputIndex !== undefined) {
          updatedValue = this.arrInput[rowIndex][inputname][inputIndex];
          if (
            updatedValue != null &&
            (updatedValue[0] == "[" ||
              updatedValue[1] == "]" ||
              updatedValue[0] == "/" ||
              updatedValue[0] == '"' ||
              updatedValue[updatedValue.length - 1] == "]")
          ) {
            value = updatedValue.replace(/[\[\]/"/']+/g, "");
          } else {
            value = updatedValue;
          }
        } else {
          // added condition for kpi values shape checkbox if shape and value input the need not to execute
          if (
            this.arrInput.length > rowIndex &&
            (inputname != "shape" || inputname != "lessThanshape" || inputname != "greaterThanshape" || inputname != "value")
          ) {
            updatedValue = this.arrInput[rowIndex][inputname];
            if (updatedValue) {
              if (updatedValue[0] == "'" || updatedValue[1] == "'") {
                value = updatedValue.replace(/[\[\]/"/']+/g, "");
              } else {
                value = this.arrInput[rowIndex][inputname];
              }
            }
          }
        }
        if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
          if (incrementValueFlag && inputname == "ranges") {
            return parseInt(value) + 1;
          }
        }
        if (typeof value == "string") {
          if (value.indexOf("[") >= 0 || value.indexOf("]") >= 0) {
            let formatedStringColor = value.replace(/[\[\]']+/g, "");
            value = formatedStringColor;
          }
        }
        if (inputname == "kpiValuesColumn2") {
          return this.AllData.properties.kpiValuesColumn2;
        }
        return value;
      } else if (
        this.AllData.properties["KPIStringValuesFlag"] == "defaultAsPerTheme"
      ) {
        if (inputname == "defaultShapes") {
          return this.AllData.properties.shapeToBePlotted;
        }
      }
    } else {
      //below code is call when Badge color change
      for (let i = 0; i < this.arrInput.length; i++) {      
        if (this.AllData.properties["ranges"]) {
          this.AllData.properties["ranges"] = this.AllData.properties["ranges"]
            .toString()
            .replace(/[\\"]/g, "");
          let value = "";
          let updatedValue = "";
          if (inputIndex !== undefined) {
            updatedValue = this.arrInput[rowIndex][inputname][inputIndex];
            if (
              updatedValue != null &&
              (updatedValue[0] == "[" ||
                updatedValue[1] == "]" ||
                updatedValue[0] == "/" ||
                updatedValue[0] == '"' ||
                updatedValue[updatedValue.length - 1] == "]")
            ) {
              value = updatedValue.replace(/[\[\]/"/']+/g, "");
            } else {
              value = updatedValue;
              if (inputname == "ranges" && value == null) {
                return 0;
              }
            }
          } 
          else if(inputname == "labelColorsLessThan" || inputname == "labelBgColorsLessThan" || 
            //Code is execute when LessThan Badge color changes
            inputname == "valueColorsLessThan" || inputname == "valueBgColorsLessThan" || inputname == "unitColorsLessThan"){
              updatedValue = this.arrInput[i][inputname];
              if (updatedValue) {
                if (updatedValue[0] == "'" || updatedValue[1] == "'") {
                  value = updatedValue.replace(/[\[\]/"/']+/g, "");
                } else {
                  value = this.arrInput[i][inputname];
                }
              }
          } else if(inputname == "labelColorsGreaterThan" || inputname == "labelBgColorsGreaterThan" || 
            inputname == "valueColorsGreaterThan" || inputname == "valueBgColorsGreaterThan" || inputname == "unitColorsGreaterThan"){
             //Code is execute when GreaterThan Badge color changes
              updatedValue = this.arrInput[i][inputname];
              if (updatedValue) {
                if (updatedValue[0] == "'" || updatedValue[1] == "'") {
                  value = updatedValue.replace(/[\[\]/"/']+/g, "");
                } else {
                  value = this.arrInput[i][inputname];
                }
              }
          }
          else {
            updatedValue = this.arrInput[rowIndex][inputname];
            if (updatedValue) {
              if (updatedValue[0] == "'" || updatedValue[1] == "'") {
                value = updatedValue.replace(/[\[\]/"/']+/g, "");
              } else {
                value = this.arrInput[rowIndex][inputname];
              }
            }
          }
          if (
            window["divdrawerconfig"].currentWidget.type == rangesChartType.bulletMap ||
            window["divdrawerconfig"].currentWidget.type == rangesChartType.tagcloud ||
            window["divdrawerconfig"].currentWidget.type == rangesChartType.tree ||
            window["divdrawerconfig"].currentWidget.type == rangesChartType.topology ||
            window["divdrawerconfig"].currentWidget.type == rangesChartType.treemap || 
            window["divdrawerconfig"].currentWidget.type == rangesChartType.calendarHeatmap
          ) {
            if (incrementValueFlag && inputname == "ranges") {
              return parseInt(value) + 1;
            }
          }
          if (typeof value == "string") {
            if (value.indexOf("[") >= 0 || value.indexOf("]") >= 0) {
              let formatedStringColor = value.replace(/[\[\]']+/g, "");
              value = formatedStringColor;
            }
          }
          return value;
        }
      }
    }
    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  setRange(rowIndex, inputname, inputIndex, $event) {
    const inputValue = $event.target.value;
    if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
      if (this.AllData.properties["KPIStringValuesFlag"] == "kpiString") {
        if (this.AllData.properties["KPIStringData"].length - 1 < rowIndex) {
          let KPIStringData = {
            value: "",
            shape: "Dot",
            colors: "#000000"
          };
          KPIStringData = JSON.parse(JSON.stringify(KPIStringData));
          this.AllData.properties["KPIStringData"].push(KPIStringData);
        }

        if (inputname == "value"){
          this.AllData.properties["KPIStringData"][rowIndex].value = inputValue;
        } else if (inputname == "shape"){
          this.AllData.properties["KPIStringData"][rowIndex].shape = inputValue;
        } else if (inputname == "kpiColumn2"){
          this.AllData.properties.kpiColumn2 = inputValue;
        }
      } else if (inputname == "lessThanshape"){
        this.AllData.properties["lessThanshape"] = inputValue;
      } else if (inputname == "greaterThanshape"){
        this.AllData.properties["greaterThanshape"] = inputValue;
      } else if (this.AllData.properties["KPIStringValuesFlag"] == "kpiValues") {
        if (inputname == "kpiValuesColumn2") {
          this.AllData.properties.kpiValuesColumn2 = inputValue;
        } else {
          if (inputIndex !== undefined && inputIndex !== null) {
            this.arrInput[rowIndex][inputname][inputIndex] = inputValue;
          } else {
            this.arrInput[rowIndex][inputname] = inputValue;
          }
          this.setOutputString();
          if (window.divdrawerconfig.currentWidget.type == rangesChartType.map)
            this.setOutputColor();
          if (this.AllData.properties["KPIValuesData"].length - 1 < rowIndex) {
            let KPIValueData = {
              ranges: [null, 1],
              status: "normal",
              colors: "#000000",
              fontcolors: "#000000",
              shape: "Dot"
            };
            KPIValueData = JSON.parse(JSON.stringify(KPIValueData));
            this.AllData.properties["KPIValuesData"].push(KPIValueData);
          }
          this.AllData.properties["KPIValuesData"][rowIndex] = this.arrInput[
            rowIndex
          ];
        }
      } else if (
        this.AllData.properties["KPIStringValuesFlag"] == "defaultAsPerTheme"
      ) {
        this.AllData.properties.shapeToBePlotted = inputValue;
      }
    }else {
      if (inputIndex !== undefined && inputIndex !== null) {
        this.arrInput[rowIndex][inputname][inputIndex] = inputValue;
        if(inputIndex == 1 && rowIndex >0){
          for(let i = 1; i <= this.arrInput.length-1; i++){
            this.arrInput[i][inputname][inputIndex-1] = null
          }
        }
      } else if(inputname == "gridDropDownLessThanStatus"){
        this.arrInput[0][inputname]= inputValue;
      } else if(inputname == "gridDropDownGreaterThanStatus"){
        this.arrInput[0][inputname] = inputValue;
      } else if(inputname == "labelColorsLessThan" || inputname == "labelBgColorsLessThan" || 
        inputname == "valueColorsLessThan" || inputname == "valueBgColorsLessThan" || inputname == "unitColorsLessThan"){
        this.arrInput[0][inputname] = inputValue;
      } else if(inputname == "labelColorsGreaterThan" || inputname == "labelBgColorsGreaterThan" || 
        inputname == "valueColorsGreaterThan" || inputname == "valueBgColorsGreaterThan" || inputname == "unitColorsGreaterThan"){
          this.arrInput[0][inputname] = inputValue;
      } else {
        this.arrInput[rowIndex][inputname] = inputValue;
      }
      this.setOutputString();
      if (
        window["divdrawerconfig"].currentWidget.type == rangesChartType.badge ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.heatmap ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.bulletMap ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.gauge ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.scatter ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.tagcloud ||
        window["divdrawerconfig"].currentWidget.type == rangesChartType.treemap || 
        window["divdrawerconfig"].currentWidget.type == rangesChartType.calendarHeatmap
      )
        this.setOutputColor();
    }
    return 0;
  }
  setColor(rowIndex, inputname, inputIndex, $event) {
    const inputValue = $event;
    if (inputIndex !== undefined && inputIndex !== null) {
      this.arrInput[rowIndex][inputname][inputIndex] = inputValue;
    } else {
      if (inputIndex !== undefined && inputIndex !== null) {
        this.arrInput[rowIndex][inputname][inputIndex] = inputValue;
      } else if(inputname == "gridLessThancolors" || inputname == "gridLessThanfontcolors"){
        this.arrInput[0][inputname]= inputValue;
      } else if(inputname == "gridGreaterThancolors" || inputname == "gridGreaterThanfontcolors"){
        this.arrInput[0][inputname] = inputValue;
      } else if(inputname == "labelColorsLessThan" || inputname == "labelBgColorsLessThan" || 
        inputname == "valueColorsLessThan" || inputname == "valueBgColorsLessThan" || inputname == "unitColorsLessThan"){
          this.arrInput[0][inputname] = inputValue; //Set all LessThan "Badge Chart" color values in array Input 
      } else if(inputname == "labelColorsGreaterThan" || inputname == "labelBgColorsGreaterThan" || 
        inputname == "valueColorsGreaterThan" || inputname == "valueBgColorsGreaterThan" || inputname == "unitColorsGreaterThan"){
          this.arrInput[0][inputname] = inputValue; //Set all GreaterThan "Badge Chart" color values in array Input 
      } else {
        this.arrInput[rowIndex][inputname] = inputValue;
      }
      this.setOutputString();
      if (
        window["divdrawerconfig"].currentWidget.type === "Badge" ||
        window["divdrawerconfig"].currentWidget.type === "Heatmap" ||
        window["divdrawerconfig"].currentWidget.type === "bulletmap" ||
        window["divdrawerconfig"].currentWidget.type === "Gauge" ||
        window["divdrawerconfig"].currentWidget.type === "Scatter" ||
        window["divdrawerconfig"].currentWidget.type === "TagCloud" ||
        window["divdrawerconfig"].currentWidget.type === "Treemap" || 
        window["divdrawerconfig"].currentWidget.type === "CalendarHeatmap"
      ){
        this.setOutputColor();
      }
    }
  }

  setComplexGaugeColor(rowIndex, inputname, inputIndex, $event, objIndex) {
    let array;
    if (objIndex !== undefined) {
      if (objIndex == 0) array = this.parentArrInput;
      else array = this.childArrInput;
    }
    const inputValue = $event;
    if (inputIndex !== undefined && inputIndex !== null) {
      array[rowIndex][inputname][inputIndex] = inputValue;
    } else {
      array[rowIndex][inputname] = inputValue;
    }
    this.setOutputComplexGaugeColor(objIndex);
  }
  addKpiValue() {
    let KpiValueInput = {
      value: "",
      shape: "Dot",
      colors: "#000000"
    };
    const tempKpiValueObj = JSON.parse(JSON.stringify(KpiValueInput));
    this.arrValueInput.push(tempKpiValueObj);
  }
  addRanges() {
    if (this.chartType == rangesChartType.treemap) {
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    } else {
      this.defaultRanges = {
        ranges: [null, 1],
        status: "normal",
        colors: RED_HEX_COLOR_CODE,
        fontcolors: BLACK_HEX_COLOR_CODE,
        shape: "Dot"
      };
      const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
      this.arrInput.push(tempObj);
    }
  }
  addcolors(index) {
    if (this.chartType == "ComplexGauge") {
      this.defaultRanges = { ranges: [null, 0], colors: "#e62424" };
      const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
      if (index == 0) this.parentArrInput.push(tempObj);
      else this.childArrInput.push(tempObj);
    } else if (this.chartType == rangesChartType.map) {
      if (this.AllData.checkedRadios[0][1] == "kpiValues") {
        this.defaultRanges = {
          ranges: [0, 1],
          status: "normal",
          colors: "#000000",
          fontcolors: "#000000",
          backgroundcolors: "#e62424",
          rangeNames: " ",
          shape: "Dot"
        };
        const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
        this.arrInput.push(tempObj);
        this.arrInput.map(e => {
          e.lastrow = true;
        });
      }
      if (this.AllData.checkedRadios[0][1] == "kpiString") {
        let mapInput = {
          value: "",
          shape: "Dot",
          colors: "#000000"
        };
        const tempMapInputObj = JSON.parse(JSON.stringify(mapInput));
        this.arrMapInput.push(tempMapInputObj);
      }
    } else if(this.chartType == rangesChartType.bulletMap){
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#e62424",
        fontcolors: "#000000",
        backgroundcolors: "#e62424",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }else if(this.chartType == rangesChartType.tagcloud){
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#e62424",
        fontcolors: "#000000",
        backgroundcolors: "#e62424",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    else{
      if (window["divdrawerconfig"].currentWidget.properties.labelColors) {
        this.defaultRanges = {
          ranges: [null, 1],
          status: "",
          colors: "#000000",
          fontcolors: "#000000",
          backgroundcolors: "#e62424",
          labelColors: "#000000",
          labelBgColors: "#e62424",
          valueColors: "#000000",
          valueBgColors: "#e62424",
          unitColors: "#000000"
        };
      } else
        this.defaultRanges = {
          ranges: [null, 1],
          status: "normal",
          colors: RED_HEX_COLOR_CODE,
          fontcolors: BLACK_HEX_COLOR_CODE,
          backgroundcolors: RED_HEX_COLOR_CODE,
          rangeNames: " ",
          shape: "Dot"
        };
      const tempObj = JSON.parse(JSON.stringify(this.defaultRanges));
      this.arrInput.push(tempObj);

      // Store the default colors in labelBgColors and valueBgColors
      // if anything delete then it appears with it default color or it's previously set color
      if( this.chartType == rangesChartType.Badge ) { 
        let arrStrLabelBgColors = this.AllData.properties.labelBgColors.replace(/[\[\]]+/g, "");
        arrStrLabelBgColors = '[' + arrStrLabelBgColors + ",'" + this.arrInput[this.arrInput.length - 1].labelBgColors + "']";
        this.AllData.properties.labelBgColors = [];
        this.AllData.properties.labelBgColors = arrStrLabelBgColors;

        let arrStrvalueBgColors = this.AllData.properties.valueBgColors.replace(/[\[\]]+/g, "");
        arrStrvalueBgColors = '[' + arrStrvalueBgColors + ",'" + this.arrInput[this.arrInput.length - 1].valueBgColors + "']";
        this.AllData.properties.valueBgColors = [];
        this.AllData.properties.valueBgColors = arrStrvalueBgColors;
      }
      
      // setTimeout(()=>{
      //   window.inputStream.next(['refreshColorPicker']);
      // }, 100);
    }
  }

  removeKpiValue(rowIndex) {
    this.arrValueInput.splice(rowIndex, 1);
  }

  removeRange(rowId, rowIndex, columnIndex,$event) {
    this.arrInput.splice(rowId, 1);
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      let strRanges = this.AllData.columns[this.colapsTabIndex].ranges;
      let arrStrRanges = strRanges.split(",");
      let strStatus = this.AllData.columns[this.colapsTabIndex].status;
      let arrStrStatus = strStatus.split(",");
      let strColors = this.AllData.columns[this.colapsTabIndex].colors;
      let arrStrColors = strColors.split(",");
      let fontstrColors = this.AllData.columns[this.colapsTabIndex].fontcolors;
      let arrfontStrColors = fontstrColors.split(",");
      arrStrRanges.splice(rowId + 1, 1);
      arrStrStatus.splice(rowId, 1);
      arrStrColors.splice(rowId, 1);
      arrfontStrColors.splice(rowId, 1);
      let updatedRange = arrStrRanges.toString();
      let updatedStatus = arrStrStatus.toString();
      let updatedColors = arrStrColors.toString();
      let updatedfontColors = arrfontStrColors.toString();
      this.AllData.columns[this.colapsTabIndex].ranges = updatedRange;
      this.AllData.columns[this.colapsTabIndex].status = updatedStatus;
      this.AllData.columns[this.colapsTabIndex].colors = updatedColors;
      this.AllData.columns[this.colapsTabIndex].fontcolors = updatedfontColors;
      this.initRange();
      window["outputStream"].next([
        "setFocusToSetPropertyElements",
        arrStrRanges.length - 2,
        columnIndex
      ]);
    } else if (window["divdrawerconfig"].currentWidget.type == rangesChartType.topology) {
      let strRanges = this.AllData.properties.ranges;
      let arrStrRanges = strRanges.split(",");
      let strColors = this.AllData.properties.colors;
      let arrStrColors = strColors.split(",");
      let strThickness = this.AllData.properties.thickness;
      let arrStrThickness =
        strThickness !== "undefined" ? strThickness.split(",") : "";
      arrStrThickness.splice(rowId, 1);
      arrStrRanges.splice(rowId + 1, 1);
      arrStrColors.splice(rowId, 1);

      let updatedRange = arrStrRanges.toString();
      let updatedColors = arrStrColors.toString();
      let updatedThickness = arrStrThickness.toString();

      if (updatedRange[updatedRange.length - 1] !== "]")
        this.AllData.properties.ranges = updatedRange + "]";
      else this.AllData.properties.ranges = updatedRange;

      if (this.AllData.properties.ranges == "[0]")
        this.AllData.properties.ranges = "[0,1]";

      if (updatedColors[updatedColors.length - 1] !== "]")
        this.AllData.properties.colors = updatedColors + "]";
      else if (updatedColors[0] !== "[")
        this.AllData.properties.colors = "[" + updatedColors;
      else this.AllData.properties.colors = updatedColors;

      if (updatedThickness[updatedThickness.length - 1] !== "]")
        this.AllData.properties.thickness = updatedThickness + "]";
      else if (updatedThickness[0] !== "[")
        this.AllData.properties.thickness = "[" + updatedThickness;
      else this.AllData.properties.thickness = updatedThickness;

      if (this.AllData.properties.ranges == "[0,1]") {
        if (this.AllData.properties["colors"]) {
          this.AllData.properties["colors"] = "['#535353']";
        }
      }
      this.initRange();
      window["outputStream"].next([
        "setFocusToSetPropertyElements",
        arrStrRanges.length - 2,
        columnIndex
      ]);
    } else if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
      this.arrMapInput.splice(rowId, 1);
      this.AllData.properties["KPIValuesData"][0].ranges[0] = JSON.parse(this.AllData.properties["ranges"])[0];
    } else {
      let strRanges = this.AllData.properties.ranges;
      let arrStrRanges = strRanges.split(",");
      let strColors = this.AllData.properties.colors;
      let arrStrColors = strColors.split(",");
      let strBgColors = this.AllData.properties.backgroundcolors;
      let strRangeNames = this.AllData.properties.names;
      let strLabelColors = this.AllData.properties.labelColors;
      let strLabelBgColors = this.AllData.properties.labelBgColors;
      let strValueColors = this.AllData.properties.valueColors;
      let strValueBgColors = this.AllData.properties.valueBgColors;
      let strUnitColors = this.AllData.properties.unitColors;
      let arrStrBgColors, updatedBgColors;
      let arrStrRangeNames, updatedRangeNames;
      let arrStrLabelColors, updatedLabelColors;
      let arrStrLabelBgColors, updatedLabelBgColors;
      let arrStrValueColors, updatedValueColors;
      let arrStrValueBgColors, updatedValueBgColors;
      let arrStrUnitColors, updatedUnitColors;

      arrStrRanges.splice(rowId + 1, 1);
      arrStrColors.splice(rowId, 1);
      let updatedRange = arrStrRanges.toString();
      let updatedColors = arrStrColors.toString();
      if (updatedRange[updatedRange.length - 1] !== "]")
        this.AllData.properties.ranges = updatedRange + "]";
      else this.AllData.properties.ranges = updatedRange;
      if (this.AllData.properties.ranges == "[0]")
        this.AllData.properties.ranges = "[0,1]";
      if (updatedColors[updatedColors.length - 1] !== "]")
        this.AllData.properties.colors = updatedColors + "]";
      else if (updatedColors[0] !== "[")
        this.AllData.properties.colors = "[" + updatedColors;
      else this.AllData.properties.colors = updatedColors;
      if (strBgColors) {
        arrStrBgColors = strBgColors.split(",");
        arrStrBgColors.splice(rowId, 1);
        updatedBgColors = arrStrBgColors.toString();
        if (updatedBgColors[updatedBgColors.length - 1] !== "]")
          this.AllData.properties.backgroundcolors = updatedBgColors + "]";
        else if (updatedBgColors[0] !== "[")
          this.AllData.properties.backgroundcolors = "[" + updatedBgColors;
        else this.AllData.properties.backgroundcolors = updatedBgColors;
      }
      if (strRangeNames) {
        arrStrRangeNames = strRangeNames.split(",");
        arrStrRangeNames.splice(rowId, 1);
        updatedRangeNames = arrStrRangeNames.toString();
        if (updatedRangeNames[updatedRangeNames.length - 1] !== "]")
          this.AllData.properties.names = updatedRangeNames + "]";
        else if (updatedRangeNames[0] !== "[")
          this.AllData.properties.names = "[" + updatedRangeNames;
        else this.AllData.properties.names = updatedRangeNames;
      }
      if (strLabelColors) {
        arrStrLabelColors = strLabelColors.split(",");
        arrStrLabelColors.splice(rowId, 1);
        updatedLabelColors = arrStrLabelColors.toString();
        if (updatedLabelColors[updatedLabelColors.length - 1] !== "]")
          this.AllData.properties.labelColors = updatedLabelColors + "]";
        else if (updatedLabelColors[0] !== "[")
          this.AllData.properties.labelColors = "[" + updatedLabelColors;
        else this.AllData.properties.labelColors = updatedLabelColors;
      }
      if (strLabelBgColors) {
        arrStrLabelBgColors = strLabelBgColors.split(",");
        arrStrLabelBgColors.splice(rowId, 1);
        updatedLabelBgColors = arrStrLabelBgColors.toString();
        if (updatedLabelBgColors[updatedLabelBgColors.length - 1] !== "]")
          this.AllData.properties.labelBgColors = updatedLabelBgColors + "]";
        else if (updatedLabelBgColors[0] !== "[")
          this.AllData.properties.labelBgColors = "[" + updatedLabelBgColors;
        else this.AllData.properties.labelBgColors = updatedLabelBgColors;
      }
      if (strValueColors) {
        arrStrValueColors = strValueColors.split(",");
        arrStrValueColors.splice(rowId, 1);
        updatedValueColors = arrStrValueColors.toString();
        if (updatedValueColors[updatedValueColors.length - 1] !== "]")
          this.AllData.properties.valueColors = updatedValueColors + "]";
        else if (updatedValueColors[0] !== "[")
          this.AllData.properties.valueColors = "[" + updatedValueColors;
        else this.AllData.properties.valueColors = updatedValueColors;
      }
      if (strValueBgColors) {
        arrStrValueBgColors = strValueBgColors.split(",");
        arrStrValueBgColors.splice(rowId, 1);
        updatedValueBgColors = arrStrValueBgColors.toString();
        if (updatedValueBgColors[updatedValueBgColors.length - 1] !== "]")
          this.AllData.properties.valueBgColors = updatedValueBgColors + "]";
        else if (updatedValueBgColors[0] !== "[")
          this.AllData.properties.valueBgColors = "[" + updatedValueBgColors;
        else this.AllData.properties.valueBgColors = updatedValueBgColors;
      }
      if (strUnitColors) {
        arrStrUnitColors = strUnitColors.split(",");
        arrStrUnitColors.splice(rowId, 1);
        updatedUnitColors = arrStrUnitColors.toString();
        if (updatedUnitColors[updatedUnitColors.length - 1] !== "]")
          this.AllData.properties.unitColors = updatedUnitColors + "]";
        else if (updatedUnitColors[0] !== "[")
          this.AllData.properties.unitColors = "[" + updatedUnitColors;
        else this.AllData.properties.unitColors = updatedUnitColors;
      }
      if (this.AllData.properties.ranges == "[0,1]") {
        if (this.AllData.properties["labelColors"]) {
          this.AllData.properties["labelColors"] = "['#000000']";
          this.AllData.properties["labelBgColors"] = "['#e62424']";
          this.AllData.properties["valueColors"] = "['#000000']";
          this.AllData.properties["valueBgColors"] = "['#e62424']";
          this.AllData.properties["unitColors"] = "['#000000']";
        }
        if (this.AllData.properties["colors"]) {
          if (this.AllData.type == rangesChartType.heatmap){
            this.AllData.properties["colors"] = "['#000000']";
          } else if (this.AllData.type == rangesChartType.treemap){
            this.AllData.properties["colors"] = "['#535353']";
          } else if (this.AllData.type == rangesChartType.calendarHeatmap){
            this.AllData.properties["colors"] = "['#000000']";
          } else{
            this.AllData.properties["colors"] = "['#e62424']";
          }
        }

        if (this.AllData.properties["backgroundcolors"]) {
          if (this.AllData.type == rangesChartType.heatmap){
            this.AllData.properties["backgroundcolors"] = "['#9dc3e6']";
          } else if (this.AllData.type == rangesChartType.treemap){
            this.AllData.properties["backgroundcolors"] = "['#9dc3e6']";
          } else{
            this.AllData.properties["backgroundcolors"] = "['#9dc3e6']";
          }
        }

        if (this.AllData.properties["names"])
          this.AllData.properties["names"] = "['']";
      }
      this.initRange();
      window["outputStream"].next([
        "setFocusToSetPropertyElements",
        arrStrRanges.length - 2,
        columnIndex
      ]);
    }
  }

  setOutputString() {
    let strOutputStringRanges = "";
    let strOutputStringStatus = "";
    let strOutputStringLessThanDropDown = "";
    let strOutputStringGreaterThanDropDown = "";
    let strOutputStringColor = "";
    let strOutputfontStringColor = "";
    let strOutputStringLessThanColor = "";
    let strOutputfontStringLessThanColor = "";
    let strOutputStringGreaterThanColor = "";
    let strOutputfontStringGreaterThanColor = "";
    let strOutputBgColor = "";
    let strOutputStringThickness = "";
    let strOutputStringLessThanThickness = "";
    let strOutputStringGreaterThanThickness = "";
    for (let i = 0; i < this.arrInput.length; i++) {
      const arrRanges = this.arrInput[i]["ranges"];
      for (let j = 0; j < arrRanges.length; j++) {
        if (
          arrRanges[j] !== null &&
          strOutputStringRanges.indexOf(arrRanges[j]) < 0
        ) {
            strOutputStringRanges += arrRanges[j] + ",";
        }
      }
      let status = this.arrInput[i]["status"];
      if (status == undefined){
        status = "normal";
      }
      strOutputStringStatus += status + ",";
      if (strOutputStringStatus == ","){
        strOutputStringStatus = "";
      }

      //Set default LessThan and GreaterThan "Status dropdown" values in variables as per Grid range
      if(this.chartType == rangesChartType.grid){
        let gridDropDownLessThanStatus = this.arrInput[i]["gridDropDownLessThanStatus"];
        let gridDropDownGreaterThanStatus = this.arrInput[i]["gridDropDownGreaterThanStatus"];
 
        if (i == 0){          
          strOutputStringLessThanDropDown = gridDropDownLessThanStatus;          
          strOutputStringGreaterThanDropDown = gridDropDownGreaterThanStatus;
        }
      }      
      
      let color = this.arrInput[i]["colors"];
      if (color == undefined){
        color = RED_HEX_COLOR_CODE;
      }
      strOutputStringColor += color + ",";      

      //Set default LessThan & GreaterThan "Background(BG)" color values in variables as per Grid range
      if(this.chartType == rangesChartType.grid){        
        let gridLessThancolor = this.arrInput[i]["gridLessThancolors"];        
        let gridGreaterThancolor = this.arrInput[i]["gridGreaterThancolors"];
        if (gridLessThancolor == undefined || gridGreaterThancolor == undefined ){
          gridLessThancolor = RED_HEX_COLOR_CODE;
          gridGreaterThancolor = RED_HEX_COLOR_CODE;          
        }
        if (i == 0){
          strOutputStringLessThanColor = gridLessThancolor;
          strOutputStringGreaterThanColor= gridGreaterThancolor;
        }
      }

      if (window["divdrawerconfig"].currentWidget.type == rangesChartType.topology) {
        let thickness = this.arrInput[i]["thickness"];
        let topologyLessThanThickness = this.arrInput[i]["topologyLessThanThickness"];
        let topologyGreaterThanThickness = this.arrInput[i]["topologyGreaterThanThickness"];
        
        if (thickness == undefined) {
          thickness = (document.getElementById(
            "colorThikness-" + i
          ) as HTMLInputElement).value;
        }else{
          strOutputStringThickness += thickness + ",";
        }

        if(topologyLessThanThickness == undefined) {
          topologyLessThanThickness = (document.getElementById(
            "topologyLessThanColorThicknessId"
          ) as HTMLInputElement).value;
        } else{
          strOutputStringLessThanThickness += topologyLessThanThickness + ","
        }

        if(topologyGreaterThanThickness == undefined) {
          topologyGreaterThanThickness = (document.getElementById(
            "topologyGreaterThanColorThicknessId"
          ) as HTMLInputElement).value;
        } else{
          strOutputStringGreaterThanThickness += topologyGreaterThanThickness + ","
        }
      }
      let fontcolor = this.arrInput[i]["fontcolors"];
      if (fontcolor == undefined){
        fontcolor = BLACK_HEX_COLOR_CODE;
      }
      strOutputfontStringColor += fontcolor + ",";
      
      //Set default LessThan & GreaterThan "Text(Font)" color values in variables as per Grid range
      if(this.chartType == rangesChartType.grid){ 
        let gridFontLessThancolor = this.arrInput[i]["gridLessThanfontcolors"];        
        let gridFontGreaterThancolor = this.arrInput[i]["gridGreaterThanfontcolors"];
        if (gridFontLessThancolor == undefined || gridFontGreaterThancolor == undefined){
          gridFontLessThancolor = BLACK_HEX_COLOR_CODE;
          gridFontGreaterThancolor = BLACK_HEX_COLOR_CODE;
        }
        if (i == 0){    
          strOutputfontStringLessThanColor = gridFontLessThancolor;  
          strOutputfontStringGreaterThanColor = gridFontGreaterThancolor; 
        }
      }      

      let bgcolor = this.arrInput[i]["backgroundcolors"];
      if (bgcolor == undefined){
        bgcolor = RED_HEX_COLOR_CODE;
      }
      strOutputBgColor += bgcolor + ",";
    }

    strOutputStringRanges = strOutputStringRanges.slice(
      0,
      strOutputStringRanges.length - 1
    );
    strOutputStringStatus = strOutputStringStatus.slice(
      0,
      strOutputStringStatus.length - 1
    );
    strOutputStringColor = strOutputStringColor.slice(
      0,
      strOutputStringColor.length - 1
    );
    strOutputfontStringColor = strOutputfontStringColor.slice(
      0,
      strOutputfontStringColor.length - 1
    );
    strOutputBgColor = strOutputBgColor.slice(0, strOutputBgColor.length - 1);
    strOutputStringThickness = strOutputStringThickness.slice(
      0,
      strOutputStringThickness.length - 1
    );
    strOutputStringLessThanThickness = strOutputStringLessThanThickness.slice(
      0,
      strOutputStringLessThanThickness.length - 1
    );
    strOutputStringGreaterThanThickness = strOutputStringGreaterThanThickness.slice(
      0,
      strOutputStringGreaterThanThickness.length - 1
    );
    if (strOutputStringRanges[0] == "[") {
      let formatedstring = strOutputStringRanges.replace(/[\[\]']+/g, "");
      strOutputStringRanges = formatedstring;
    }
    this.outputValue["ranges"] = strOutputStringRanges;
    if (strOutputStringStatus !== undefined){
      this.outputValue["status"] = strOutputStringStatus;
    }
    if (strOutputStringLessThanDropDown !== undefined){
      this.outputValue["gridDropDownLessThanStatus"] = strOutputStringLessThanDropDown;
    }
    if (strOutputStringGreaterThanDropDown !== undefined){
      this.outputValue["gridDropDownGreaterThanStatus"] = strOutputStringGreaterThanDropDown;
    }
    //Send values to subscribeEmitters() for "UPDATE_RANGES_STATUS"
    this.outputValue["colors"] = strOutputStringColor;
    this.outputValue["fontcolors"] = strOutputfontStringColor;
    this.outputValue["gridLessThancolors"] = strOutputStringLessThanColor;
    this.outputValue["gridGreaterThancolors"] = strOutputStringGreaterThanColor;
    this.outputValue["gridLessThanfontcolors"] = strOutputfontStringLessThanColor;
    this.outputValue["gridGreaterThanfontcolors"] = strOutputfontStringGreaterThanColor;
    this.outputValue["thickness"] = strOutputStringThickness;
    this.outputValue["topologyLessThanThickness"] = strOutputStringLessThanThickness;
    this.outputValue["topologyGreaterThanThickness"] = strOutputStringGreaterThanThickness;
    this.outputValue["backgroundcolors"] = strOutputBgColor;
    this.emitterChannel.emit({
      ACTION: "UPDATE_RANGES_STATUS",
      VALUE: { columnIndex: this.colapsTabIndex, params: this.outputValue }
    });
  }
  setOutputColor() {
    let strOutputStringRanges = "";
    let strOutputStringColor = "";
    let strOutputfontStringColor = "";
    let strOutputStringLessThanColor = ""; 
    let strOutputfontStringLessThanColor = "";
    let strOutputStringGreaterThanColor = "";
    let strOutputfontStringGreaterThanColor = "";
    let strOutputBgColor = "";
    let strOutputLabelColor = "";
    let strOutputLabelColorLessThan = "";
    let strOutputLabelColorGreaterThan = "";
    let strOutputLabelBgColorLessThan = "";
    let strOutputLabelBgColorGreaterThan = "";
    let strOutputLabelBgColor = "";
    let strOutputValueColor = "";
    let strOutputValueColorLessThan = "";
    let strOutputValueColorGreaterThan = "";
    let strOutputUnitColor = "";
    let strOutputUnitColorLessThan = "";
    let strOutputUnitColorGreaterThan = "";
    let strOutputValueBgColor = "";
    let strOutputValueBgColorLessThan = "";
    let strOutputValueBgColorGreaterThan = "";
    let strOutputStringThickness = "";
    let strOutputStringLessThanThickness = "";
    let strOutputStringGreaterThanThickness = "";
   
    for (let i = 0; i < this.arrInput.length; i++) {
      const arrRanges = this.arrInput[i]["ranges"];
      for (let j = 0; j < arrRanges.length; j++) {
        if (arrRanges[j] !== null) {
          strOutputStringRanges += arrRanges[j] + ",";
        }
      }
      //Grid Background(BG) colors values stored in below "let" variables 
      let color = this.arrInput[i]["colors"];
      let gridLessThancolor = this.arrInput[i]["gridLessThancolors"];
      let gridGreaterThancolor = this.arrInput[i]["gridGreaterThancolors"];
      if (window["divdrawerconfig"].currentWidget.type == rangesChartType.topology) {
        let thickness = this.arrInput[i]["thickness"];
        if (thickness == undefined) {
          thickness = (document.getElementById(
            "colorThikness-" + i
          ) as HTMLInputElement).value;
        }
        if (thickness != undefined) strOutputStringThickness += thickness + ",";

        //Set Ouput color of Topology LessThan colorPicker
        let topologyLessThanThickness = this.arrInput[i]["topologyLessThanThickness"];
        if (thickness == undefined) {
          thickness = (document.getElementById(
            "topologyLessThanColorThicknessId"
          ) as HTMLInputElement).value;
        }
        if (topologyLessThanThickness != undefined) strOutputStringLessThanThickness += topologyLessThanThickness + ",";

        //Set Ouput color of Topology GreaterThan colorPicker
        let topologyGreaterThanThickness = this.arrInput[i]["topologyGreaterThanThickness"];
        if (thickness == undefined) {
          thickness = (document.getElementById(
            "topologyGreaterThanColorThicknessId"
          ) as HTMLInputElement).value;
        }
        if (topologyGreaterThanThickness != undefined) strOutputStringGreaterThanThickness += topologyGreaterThanThickness + ",";
      }

      let colorLength = color.length - 1;

      if (color[0] == "[" || color[colorLength] == "]") {
        let updatecolor = color.replace(/[\[\]]+/g, "");
        color = updatecolor;
      }
      
      //Grid text(fontColor) values stored in below variables 
      const fontcolor = this.arrInput[i]["fontcolors"];
      const gridFontLessThancolor = this.arrInput[i]["gridLessThanfontcolors"];
      const gridFontGreaterThancolor = this.arrInput[i]["gridGreaterThanfontcolors"];

      if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
        //Set Ouput color of Grid LessThan "background" colorpicker
        let gridLessThancolorLength = gridLessThancolor.length - 1;
        if (gridLessThancolor[0] == "[" || gridLessThancolor[gridLessThancolorLength] == "]") {
          let updatecolor = gridLessThancolor.replace(/[\[\]]+/g, "");
          gridLessThancolor = updatecolor;
        }
        //Set Ouput color of Grid GreaterThan "background" colorpicker
        let gridGreaterThancolorLength = gridGreaterThancolor.length - 1;
        if (gridGreaterThancolor[0] == "[" || gridGreaterThancolor[gridGreaterThancolorLength] == "]") {
          let updatecolor = gridGreaterThancolor.replace(/[\[\]]+/g, "");
          gridGreaterThancolor = updatecolor;
        }
        // variables for Grid Background and text colors change as per its provided range
        strOutputStringColor += color + ",";
        strOutputfontStringColor += fontcolor + ",";
        strOutputStringLessThanColor += gridLessThancolor + ",";
        strOutputfontStringLessThanColor += gridFontLessThancolor + ",";
        strOutputStringGreaterThanColor += gridGreaterThancolor + ",";
        strOutputfontStringGreaterThanColor += gridFontGreaterThancolor + ",";
      } else {
        let bgcolor = "";
        if (this.arrInput[i]["backgroundcolors"]) {
          bgcolor = this.arrInput[i]["backgroundcolors"];
          let bgcolorLength = bgcolor.length - 1;
          if (bgcolor[0] == "[" || bgcolor[bgcolorLength] == "]") {
            let updatebgcolor = bgcolor.replace(/[\[\]]+/g, "");
            bgcolor = updatebgcolor;
          }   
        }

        let labelcolor = "";      
        if (this.arrInput[i]["labelColors"]) {
          labelcolor = this.arrInput[i]["labelColors"];
          let labelcolorLength = labelcolor.length - 1;
          if (labelcolor[0] == "[" || labelcolor[labelcolorLength] == "]") {
            let updatelabelcolor = labelcolor.replace(/[\[\]]+/g, "");
            labelcolor = updatelabelcolor;
          }
        }
        //Set lessThan & GreaterThan "Badge Range Colors" in variables and Send it to subscribeEmitters() for "UPDATE_RANGES_COLORS" in JSON
        let labelcolorLessThan;
        let labelcolorGreaterThan;
        if(this.chartType == rangesChartType.Badge){               
          labelcolorLessThan = this.arrInput[i]["labelColorsLessThan"];  
          labelcolorGreaterThan = this.arrInput[i]["labelColorsGreaterThan"];
          if (labelcolorLessThan == undefined || labelcolorGreaterThan == undefined){
            labelcolorLessThan = BLACK_HEX_COLOR_CODE;     
            labelcolorGreaterThan = BLACK_HEX_COLOR_CODE;
          }
          if (i == 0){
            strOutputLabelColorLessThan = labelcolorLessThan;
            strOutputLabelColorGreaterThan = labelcolorGreaterThan;
          }
        }     

        let labelbgcolor = "";
        if (this.arrInput[i]["labelBgColors"]) {
          labelbgcolor = this.arrInput[i]["labelBgColors"];
          let labelbgcolorLength = labelbgcolor.length - 1;
          if (
            labelbgcolor[0] == "[" ||
            labelbgcolor[labelbgcolorLength] == "]"
          ) {
            let updatelabelbgcolor = labelbgcolor.replace(/[\[\]]+/g, "");
            labelbgcolor = updatelabelbgcolor;
          }
        }

        let labelbgcolorLessThan;
        let labelbgcolorGreaterThan;
        if(this.chartType == rangesChartType.Badge){             
          labelbgcolorLessThan = this.arrInput[i]["labelBgColorsLessThan"];
          labelbgcolorGreaterThan = this.arrInput[i]["labelBgColorsGreaterThan"];   
          if (labelbgcolorLessThan == undefined || labelbgcolorGreaterThan == undefined){
            labelbgcolorLessThan = RED_HEX_COLOR_CODE;     
            labelbgcolorGreaterThan = RED_HEX_COLOR_CODE;
          }
          if (i == 0){
            strOutputLabelBgColorLessThan = labelbgcolorLessThan;
            strOutputLabelBgColorGreaterThan = labelbgcolorGreaterThan;
          }
        }

        let valuecolor = "";
        if (this.arrInput[i]["valueColors"]) {
          valuecolor = this.arrInput[i]["valueColors"];
          let valuecolorLength = valuecolor.length - 1;
          if (valuecolor[0] == "[" || valuecolor[valuecolorLength] == "]") {
            let updatevaluecolor = valuecolor.replace(/[\[\]]+/g, "");
            valuecolor = updatevaluecolor;
          }
        }

        let valuecolorLessThan;
        let valuecolorGreaterThan;
        if(this.chartType == rangesChartType.Badge){               
          valuecolorLessThan = this.arrInput[i]["valueColorsLessThan"];  
          valuecolorGreaterThan = this.arrInput[i]["valueColorsGreaterThan"];
          if (valuecolorLessThan == undefined || valuecolorGreaterThan == undefined){
            valuecolorLessThan = BLACK_HEX_COLOR_CODE;     
            valuecolorGreaterThan = BLACK_HEX_COLOR_CODE;
          }
          if (i == 0){
            strOutputValueColorLessThan = valuecolorLessThan;
            strOutputValueColorGreaterThan = valuecolorGreaterThan;
          }
        }

        let valuebgcolor = "";
        if (this.arrInput[i]["valueBgColors"]) {
          valuebgcolor = this.arrInput[i]["valueBgColors"];
          let valuebgcolorLength = valuebgcolor.length - 1;
          if (
            valuebgcolor[0] == "[" ||
            valuebgcolor[valuebgcolorLength] == "]"
          ) {
            let updatevaluebgcolor = valuebgcolor.replace(/[\[\]]+/g, "");
            valuebgcolor = updatevaluebgcolor;
          }
        }
        
        let valuebgcolorLessThan;
        let valuebgcolorGreaterThan;
        if(this.chartType == rangesChartType.Badge){             
          valuebgcolorLessThan = this.arrInput[i]["valueBgColorsLessThan"];
          valuebgcolorGreaterThan = this.arrInput[i]["valueBgColorsGreaterThan"];   
          if (valuebgcolorLessThan == undefined || valuebgcolorGreaterThan == undefined){
            valuebgcolorLessThan = RED_HEX_COLOR_CODE;     
            valuebgcolorGreaterThan = RED_HEX_COLOR_CODE;
          }
          if (i == 0){
            strOutputValueBgColorLessThan = valuebgcolorLessThan;
            strOutputValueBgColorGreaterThan = valuebgcolorGreaterThan;
          }
        }

        let unitcolor = "";
        if (this.arrInput[i]["unitColors"]) {
          unitcolor = this.arrInput[i]["unitColors"];
          let unitcolorLength = unitcolor.length - 1;
          if (unitcolor[0] == "[" || unitcolor[unitcolorLength] == "]") {
            let updateunitcolor = unitcolor.replace(/[\[\]]+/g, "");
            unitcolor = updateunitcolor;
          }
        }

        let unitcolorLessThan;
        let unitcolorGreaterThan;
        if(this.chartType == rangesChartType.Badge){             
          unitcolorLessThan = this.arrInput[i]["unitColorsLessThan"];
          unitcolorGreaterThan = this.arrInput[i]["unitColorsGreaterThan"];   
          if (unitcolorLessThan == undefined || unitcolorGreaterThan == undefined){
            unitcolorLessThan = BLACK_HEX_COLOR_CODE;     
            unitcolorGreaterThan = BLACK_HEX_COLOR_CODE;
          }
          if (i == 0){
            strOutputUnitColorLessThan = unitcolorLessThan;
            strOutputUnitColorGreaterThan = unitcolorGreaterThan;
          }
        }
        
        let appendsign = "'";
        if (color[0] !== "'") {
          strOutputStringColor += appendsign + color + appendsign + ",";
        } else {
          strOutputStringColor += color + ",";
        }
        if(this.chartType == rangesChartType.grid){
          if (gridLessThancolor[0] !== "'") {
            strOutputStringLessThanColor += appendsign + gridLessThancolor + appendsign + ",";
          } else {
            strOutputStringLessThanColor += gridLessThancolor + ",";
          }
          if (gridGreaterThancolor[0] !== "'") {
            strOutputStringGreaterThanColor += appendsign + gridGreaterThancolor + appendsign + ",";
          } else {
            strOutputStringGreaterThanColor += gridGreaterThancolor + ",";
          }
        }
        if (bgcolor[0] !== "'") {
          strOutputBgColor += appendsign + bgcolor + appendsign + ",";
        } else {
          strOutputBgColor += bgcolor + ",";
        }
        if (labelcolor[0] !== "'") {
          strOutputLabelColor += appendsign + labelcolor + appendsign + ",";
        } else {
          strOutputLabelColor += labelcolor + ",";
        }
        if (labelbgcolor[0] !== "'") {
          strOutputLabelBgColor += appendsign + labelbgcolor + appendsign + ",";
        } else {
          strOutputLabelBgColor += labelbgcolor + ",";
        }
        if (valuecolor[0] !== "'") {
          strOutputValueColor += appendsign + valuecolor + appendsign + ",";
        } else {
          strOutputValueColor += valuecolor + ",";
        }
        if (valuebgcolor[0] !== "'") {
          strOutputValueBgColor += appendsign + valuebgcolor + appendsign + ",";
        } else {
          strOutputValueBgColor += valuebgcolor + ",";
        }
        if (unitcolor[0] !== "'") {
          strOutputUnitColor += appendsign + unitcolor + appendsign + ",";
        } else {
          strOutputUnitColor += unitcolor + ",";
        }

        strOutputfontStringColor += appendsign + fontcolor + appendsign + ",";
        strOutputfontStringLessThanColor += appendsign + gridFontLessThancolor + appendsign + ",";
        strOutputfontStringGreaterThanColor += appendsign + gridFontGreaterThancolor + appendsign + ",";
      }
    }
    strOutputStringRanges = strOutputStringRanges.slice(
      0,
      strOutputStringRanges.length - 1
    );
    strOutputStringColor = strOutputStringColor.slice(
      0,
      strOutputStringColor.length - 1
    );
    strOutputStringLessThanColor = strOutputStringLessThanColor.slice(
      0,
      strOutputStringLessThanColor.length - 1
    );
    strOutputStringGreaterThanColor = strOutputStringGreaterThanColor.slice(
      0,
      strOutputStringGreaterThanColor.length - 1
    );
    strOutputfontStringColor = strOutputfontStringColor.slice(
      0,
      strOutputfontStringColor.length - 1
    );
    strOutputfontStringLessThanColor = strOutputfontStringLessThanColor.slice(
      0,
      strOutputfontStringLessThanColor.length - 1
    );
    strOutputfontStringGreaterThanColor = strOutputfontStringGreaterThanColor.slice(
      0,
      strOutputfontStringGreaterThanColor.length - 1
    );
    strOutputBgColor = strOutputBgColor.slice(0, strOutputBgColor.length - 1);
    strOutputLabelColor = strOutputLabelColor.slice(0, strOutputLabelColor.length - 1);
    strOutputLabelBgColor = strOutputLabelBgColor.slice(
      0,
      strOutputLabelBgColor.length - 1
    );
    strOutputValueColor = strOutputValueColor.slice(
      0,
      strOutputValueColor.length - 1
    );
    strOutputValueBgColor = strOutputValueBgColor.slice(
      0,
      strOutputValueBgColor.length - 1
    );
    strOutputUnitColor = strOutputUnitColor.slice(
      0,
      strOutputUnitColor.length - 1
    );
    strOutputStringThickness = strOutputStringThickness.slice(
      0,
      strOutputStringThickness.length - 1
    );

    if (
      strOutputfontStringColor.indexOf("[") >= 0 ||
      strOutputfontStringColor.indexOf("]") >= 0
    ) {
      let formatedStringColor = strOutputfontStringColor.replace(
        /[\[\]']+/g,
        ""
      );
      strOutputfontStringColor = formatedStringColor;
    }
    if (
      strOutputfontStringLessThanColor.indexOf("[") >= 0 ||
      strOutputfontStringLessThanColor.indexOf("]") >= 0
    ) {
      let formatedStringLessThanColor = strOutputfontStringLessThanColor.replace(
        /[\[\]']+/g,
        ""
      );
      strOutputfontStringLessThanColor = formatedStringLessThanColor;
    }
    if (
      strOutputfontStringGreaterThanColor.indexOf("[") >= 0 ||
      strOutputfontStringGreaterThanColor.indexOf("]") >= 0
    ) {
      let formatedStringGreaterThanColor = strOutputfontStringGreaterThanColor.replace(
        /[\[\]']+/g,
        ""
      );
      strOutputfontStringGreaterThanColor = formatedStringGreaterThanColor;
    }
    //Send values to subscribeEmitters() for "UPDATE_RANGES_COLORS" 
    this.outputValue["ranges"] = strOutputStringRanges;
    this.outputValue["colors"] = strOutputStringColor;
    this.outputValue["gridLessThancolors"] = strOutputStringLessThanColor;
    this.outputValue["gridGreaterThancolors"] = strOutputStringGreaterThanColor;
    this.outputValue["fontcolors"] = strOutputfontStringColor;
    this.outputValue["gridLessThanfontcolors"] = strOutputfontStringLessThanColor;
    this.outputValue["gridGreaterThanfontcolors"] = strOutputfontStringGreaterThanColor;
    this.outputValue["backgroundcolors"] = strOutputBgColor;
    this.outputValue["labelColors"] = strOutputLabelColor;
    this.outputValue["labelColorsLessThan"] = strOutputLabelColorLessThan;
    this.outputValue["labelColorsGreaterThan"] = strOutputLabelColorGreaterThan;
    this.outputValue["labelBgColorsLessThan"] = strOutputLabelBgColorLessThan;
    this.outputValue["labelBgColorsGreaterThan"] = strOutputLabelBgColorGreaterThan;
    this.outputValue["labelBgColors"] = strOutputLabelBgColor;
    this.outputValue["valueColors"] = strOutputValueColor;
    this.outputValue["valueColorsLessThan"] = strOutputValueColorLessThan;
    this.outputValue["valueColorsGreaterThan"] = strOutputValueColorGreaterThan;
    this.outputValue["valueBgColors"] = strOutputValueBgColor;
    this.outputValue["valueBgColorsLessThan"] = strOutputValueBgColorLessThan;
    this.outputValue["valueBgColorsGreaterThan"] = strOutputValueBgColorGreaterThan;
    this.outputValue["unitColors"] = strOutputUnitColor;
    this.outputValue["unitColorsLessThan"] = strOutputUnitColorLessThan;
    this.outputValue["unitColorsGreaterThan"] = strOutputUnitColorGreaterThan;

    if (window["divdrawerconfig"].currentWidget.type ==  rangesChartType.topology) {
      if (strOutputStringThickness !== undefined) {
        this.outputValue["thickness"] = strOutputStringThickness;
      }
      if (strOutputStringLessThanThickness !== undefined) {
        this.outputValue["topologyLessThanThickness"] = strOutputStringLessThanThickness;
      }
      if (strOutputStringGreaterThanThickness !== undefined) {
        this.outputValue["topologyGreaterThanThickness"] = strOutputStringGreaterThanThickness;
      }
    }

    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      this.AllData.columns[this.colapsTabIndex].status = "";
    }
    this.emitterChannel.emit({
      ACTION: "UPDATE_RANGES_COLORS",
      VALUE: { columnIndex: this.colapsTabIndex, params: this.outputValue }
    });
  }
  getrangeOut(inputData, $event, colapsTabIndex) {
    //	LoggerService.tick_then() => this.prop = "numberOnly");
    this.AllData.columns[colapsTabIndex].ranges = "";
    this.AllData.columns[colapsTabIndex].status = "";
    this.AllData.columns[colapsTabIndex].gridDropDownLessThanStatus = "";
    this.AllData.columns[colapsTabIndex].gridDropDownGreaterThanStatus = "";
    this.AllData.columns[colapsTabIndex].colors = "";
    this.AllData.columns[colapsTabIndex].fontcolors = "";
    this.AllData.columns[colapsTabIndex].gridLessThancolors = "";
    this.AllData.columns[colapsTabIndex].gridLessThanfontcolors = "";
    this.AllData.columns[colapsTabIndex].gridGreaterThancolors = "";
    this.AllData.columns[colapsTabIndex].gridGreaterThanfontcolors = "";
    // this.arrInput[colapsTabIndex].gridDropDownGreaterThanStatus = "";
    if (this.AllData.columns[colapsTabIndex].type)
      delete this.AllData.columns[colapsTabIndex].type;
    if (this.AllData.columns[colapsTabIndex].properties)
      delete this.AllData.columns[colapsTabIndex].properties;
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "normal",
      colors: RED_HEX_COLOR_CODE,
      fontcolors: BLACK_HEX_COLOR_CODE,
      backgroundcolors: RED_HEX_COLOR_CODE,
      shape: "Dot"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //	delete this.AllData.columns[colapsTabIndex].properties ;
  }
  getStatusOut(inputData, $event, colapsTabIndex) {
    //	this.prop = "numberAndColor";
    //	this.AllData.columns[colapsTabIndex].ranges="";
    this.AllData.columns[colapsTabIndex].status = "";
    this.AllData.columns[colapsTabIndex].gridDropDownLessThanStatus = "";
    this.AllData.columns[colapsTabIndex].gridDropDownGreaterThanStatus = "";
    if (this.AllData.columns[colapsTabIndex].type)
      delete this.AllData.columns[colapsTabIndex].type;
    if (this.AllData.columns[colapsTabIndex].properties)
      delete this.AllData.columns[colapsTabIndex].properties;

    this.setOutputString();
  }
  getColorsOut(inputData, $event, colapsTabIndex) {
    //	this.prop = "numberAndIcon";
    //	this.AllData.columns[colapsTabIndex].ranges="";
    this.AllData.columns[colapsTabIndex].colors = "";
    this.AllData.columns[colapsTabIndex].fontcolors = "";
    this.AllData.columns[colapsTabIndex].gridLessThancolors = "";
    this.AllData.columns[colapsTabIndex].gridLessThanfontcolors = "";
    this.AllData.columns[colapsTabIndex].gridGreaterThancolors = "";
    this.AllData.columns[colapsTabIndex].gridGreaterThanfontcolors = "";
    if (this.AllData.columns[colapsTabIndex].type)
      delete this.AllData.columns[colapsTabIndex].type;
    if (this.AllData.columns[colapsTabIndex].properties)
      delete this.AllData.columns[colapsTabIndex].properties;

    this.setOutputString();
  }
  getprogressOut(inputData, $event, colapsTabIndex) {
    this.AllData.columns[colapsTabIndex].ranges = "";
    this.AllData.columns[colapsTabIndex].colors = "";
    this.AllData.columns[colapsTabIndex].fontcolors = "";
    this.AllData.columns[colapsTabIndex].status = "";
    this.AllData.columns[colapsTabIndex].type = "ProgressBar";
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "normal",
      colors: RED_HEX_COLOR_CODE,
      fontcolors: BLACK_HEX_COLOR_CODE,
      backgroundcolors: RED_HEX_COLOR_CODE,
      shape: "Dot"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //this.AllData.columns[colapsTabIndex].properties = "maximum:0,minimum:0"
  }
  addBadgeProperties() {
      this.AllData.properties["ranges"] = "[0,1]";
      this.AllData.properties["colors"] = "['#e62424']";
      this.AllData.properties["backgroundcolors"] = "['#e62424']";
      this.AllData.properties["labelColors"] = "['#000000']";
      this.AllData.properties["labelBgColors"] = "['#e62424']";
      this.AllData.properties["valueColors"] = "['#000000']";
      this.AllData.properties["valueBgColors"] = "['#e62424']";
      this.AllData.properties["unitColors"] = "['#000000']";
      this.AllData.properties["labelColorsLessThan"] = "['#000000']";
      this.AllData.properties["labelBgColorsLessThan"] = "['#e62424']";
      this.AllData.properties["valueColorsLessThan"] = "['#000000']";
      this.AllData.properties["valueBgColorsLessThan"] = "['#e62424']";
      this.AllData.properties["unitColorsLessThan"] = "['#000000']";
      this.AllData.properties["labelColorsGreaterThan"] = "['#000000']";
      this.AllData.properties["labelBgColorsGreaterThan"] = "['#e62424']";
      this.AllData.properties["valueColorsGreaterThan"] = "['#000000']";
      this.AllData.properties["valueBgColorsGreaterThan"] = "['#e62424']";
      this.AllData.properties["unitColorsGreaterThan"] = "['#000000']";
      this.initRange();
  }
  setprogessBar(rowIndex, inputname, colapsTabIndex, $event) {
    this.AllData.columns[colapsTabIndex].type = "ProgressBar";
    this.AllData.columns[colapsTabIndex].properties = "maximum:100,minimum:0";
    const inputValue = $event.target.value;
    let arrStrTochange = this.AllData.columns[colapsTabIndex].properties.split(
      ","
    );
    let node = arrStrTochange[0];
    let arrParamName = node.split(":");
    let paramName = arrParamName[0];
    if (paramName == "maximum") {
      arrParamName[1] = inputValue;
      arrStrTochange[0] = arrParamName.join(":");
    }
    let strTochange = arrStrTochange.join(",");
    this.AllData.columns[colapsTabIndex].properties = strTochange;
  }

  setFixedTextColor(inputName, $event) {
    const inputValue = $event;
    let strTochange = this.AllData[inputName];
    let arrStrTochange = strTochange.split(";");
    let flag = 0;
    for (let i = 0; i < arrStrTochange.length; i++) {
      let node = arrStrTochange[i];
      let arrParamName = node.split(":");
      let paramName = arrParamName[0];
      if (paramName == "color") {
        arrParamName[1] = inputValue;
        flag = 1;
        arrStrTochange[i] = arrParamName.join(":");
      }
    }
    if (flag == 0) {
      //if property not found, add it
      let newParam = [];
      newParam[0] = "color";
      newParam[1] = inputValue;
      if (arrStrTochange[arrStrTochange.length - 1] == "")
        arrStrTochange[arrStrTochange.length - 1] = newParam.join(":");
      else arrStrTochange[arrStrTochange.length] = newParam.join(":");
    }
    strTochange = arrStrTochange.join(";");
    this.AllData[inputName] = strTochange;
  }

  getFixedTextColor(inputName) {
    let value = this.AllData[inputName];
    const arrValue = value.split(";");
    let flag = 0;

    for (let i = 0; i < arrValue.length; i++) {
      let arrParamName = arrValue[i].split(":");
      let paramName = arrParamName[0];
      if (paramName == "color") {
        flag = 1;
        value = arrParamName[1].replace(" !important", "");
      }
    }
    if (flag == 0) {
      //property not found
      value = "#777777";
    }
    return value;
  }

  getprogessBar(inputname, colapsTabIndex) {
    let value = "";
    let updatedValue = "";
    let arrStrTochange;
    if (this.AllData.columns[colapsTabIndex].properties !== undefined) {
      arrStrTochange = this.AllData.columns[colapsTabIndex].properties.split(
        ","
      );
      let node = arrStrTochange[0];
      let arrParamName = node.split(":");
      let paramName = arrParamName[0];
      if (paramName == "maximum") {
        value = arrParamName[1];
      }
    }
    if (value == "") return 0;
    else return value;
  }

  setCheckedRadios(id, radioName, value, $event, index) {
    if (radioName === "tagcloudColors") {
      this.AllData.chartColorProperties.levelOneRadBtnValue = "as-per-theme";
    }
    let i;
    if (window["divdrawerconfig"].currentWidget["checkedRadios"] == undefined)
      window["divdrawerconfig"].currentWidget["checkedRadios"] = [];

    for (
      i = 0;
      i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
      i++
    ) {
      if (
        window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
        radioName
      )
        break;
    }
    if (i == window["divdrawerconfig"].currentWidget["checkedRadios"].length) {
      window["divdrawerconfig"].currentWidget["checkedRadios"][i] = [];
      window["divdrawerconfig"].currentWidget["checkedRadios"][
        i
      ][0] = radioName;
    }
    let object = window["divdrawerconfig"].currentWidget;
    object.colorData = id; // Setting colorData to check which color option is selected.
    let KPISstrignShapeIconFlag;
    KPISstrignShapeIconFlag =
      object.properties.KPISstrignShapeIcon == "R2Icons" ? true : false;

    if (KPISstrignShapeIconFlag == false && this.arrInput.length == 0) {
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low",
        shape: "Dot"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    if (index !== undefined)
      window["divdrawerconfig"].currentWidget["checkedRadios"][i][index + 1] =
        id + index;
    else window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] = id;
    /* 	if(this.AllData["checkedRadios"][radioName] == undefined){
				this.AllData["checkedRadios"][radioName] = [];
				
			}
			else{
				if(radioName !== "badgeTextColor"){
					if(this.AllData["checkedRadios"][radioName].length > 0)
						this.AllData["checkedRadios"][radioName][index] = [];
				}	
				
				}
				if(radioName == "badgeTextColor"){
					this.AllData["checkedRadios"][radioName] = [];
					this.AllData["checkedRadios"][radioName][id] = "on";
				}
				else{
					this.AllData["checkedRadios"][radioName][index] = [];
					this.AllData["checkedRadios"][radioName][index][id] = "on";
				} */
  }

  getKPIStringShapeIconCheckedRadios() {
    let object = window["divdrawerconfig"].currentWidget;
    let KPISstrignShapeIconFlag;
    KPISstrignShapeIconFlag =
      object.properties.KPISstrignShapeIcon == "R2Icons" ? true : false;
    return KPISstrignShapeIconFlag;
  }

  getKPIValuesShapeIconCheckedRadios() {
    let object = window["divdrawerconfig"].currentWidget;
    let KPISValuesShapeIconFlag;
    KPISValuesShapeIconFlag =
      object.properties.KPISValuesShapeIcon == "R3Icons" ? true : false;
    if (
      object.properties.KPISValuesShapeIcon == "R3Shapes" &&
      KPISValuesShapeIconFlag == false &&
      this.arrInput == undefined
    ) {
      this.arrInput = [];
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low",
        shape: "Dot"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    return KPISValuesShapeIconFlag;
  }

  getCheckedRadios(id, radioName, value, index, isDefaultChecked) {
    if (
      window["divdrawerconfig"].currentWidget["checkedRadios"] !== undefined
    ) {
      this.formCorrectArray("checkedRadios");
      let i;

      for (
        i = 0;
        i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
        i++
      ) {
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
          radioName
        )
          break;
      }

      if (i < window["divdrawerconfig"].currentWidget["checkedRadios"].length) {
        if (index == "undefined") {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] == id
          )
            return true;
          else return false;
        }
        if (index !== undefined) {
          index++;
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][
              index
            ] !== undefined
          ) {
            if (
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][
                index
              ] == id
            ) {
              return true;
            } else return false;
          } else {
            if (isDefaultChecked !== undefined) {
              return isDefaultChecked;
            } else return false;
          }
        } else {
          if (isDefaultChecked !== undefined) {
            return isDefaultChecked;
          } else return false;
        }
      } else {
        if (isDefaultChecked !== undefined) {
          return isDefaultChecked;
        } else return false;
      }
    } else if (isDefaultChecked !== undefined) {
      return isDefaultChecked;
    } else return false;
  }

  removeBadgeProperties(type) {
    // check if background image is added at composite widget level for that current widget and,
    // if it is added then make the compositeWidgetHasImg flag to true
    let compositeWidgetHasImg = false;
    if (this.allWidgets && this.allWidgets.length > 0) {
      for (let i = 0; i < this.allWidgets.length; i++) {
        if (
          this.allWidgets[i].type == "LayoutManager" &&
          this.allWidgets[i].layoutWidgets
        ) {
          for (let j = 0; j < this.allWidgets[i].layoutWidgets.length; j++) {
            if (
              this.allWidgets[i].layoutWidgets[j].index == this.AllData.index &&
              this.allWidgets[i].backgroundImageId
            ) {
              compositeWidgetHasImg = true;
              break;
            }
          }
        }
      }
    }

    if (type == "fixed" || type == "keeprange") {
      if (
        type == "fixed" &&
        this.AllData.type === "Badge" &&
        (this.AllData.backgroundImageId || compositeWidgetHasImg)
      ) {
        this.setFixedBadgeColors("#000000", "labelStyle", "background-color");
        this.setFixedBadgeColors("#000000", "valueStyle", "background-color");
      } else {
        // this.setFixedBadgeColors("#f5f5f5", "labelStyle", "background-color");
        // this.setFixedBadgeColors("#ffffff", "valueStyle", "background-color");
      }
      this.setFixedBadgeColors("#f5f5f5", "labelStyle", "background-color");
      this.setFixedBadgeColors("#ffffff", "valueStyle", "background-color");
      this.setFixedBadgeColors("#000000", "labelStyle", "color");
      this.setFixedBadgeColors("#777777", "valueStyle", "color");
      this.setFixedBadgeColors("#000000", "unitColor", "unitColor");
      window.inputStream.next(["refreshColorPicker"]);
    }
    if (type !== "keeprange") {
     this.addBadgeProperties();
    }
  }

  showHide(id, index) {
    let parentID = "numberOptions" + index;
    let parentContainer = document.getElementById(parentID);
    let innerDivs = parentContainer.getElementsByClassName(
      "inner-range-content"
    );
    let divID = id + index;
    for (let i = 0; i < innerDivs.length; i++) {
      if (
        innerDivs[i].previousElementSibling.querySelector("input[type='radio']")
          .id == divID
      ) {
        innerDivs[i].classList.remove("hide");
      } else innerDivs[i].classList.add("hide");
    }
  }

  formCorrectArray(type) {
    let array;
    array = window["divdrawerconfig"].currentWidget[type];
    if (array) {
      for (let i = 0; i < array.length; i++) {
        let a = array[i];
        if (typeof a == "string") {
          array[i] = a.split(",");
          for (let j = 0; j < array[i].length; j++) {
            let b = array[i][j];
            array[i][j] = b.replace(/["\[\]]/g, "");
          }
        }
      }
      window["divdrawerconfig"].currentWidget[type] = array;
    }
  }

  //Added last interactive element as colorPicker
  setFocusOnColorPicker(event){
    event.preventDefault();
    window["outputStream"].next(["setFocusToWidgetAreaStyleBadge"]);
  }

  setFocus(event, flag, rowIndex, colIndex) {
    if (flag || flag == "true") {
      if (event.target.classList.contains("colorpicker")) {
        let okButton;
        if (event.target.classList.contains("bulletColorButton")) {
          okButton =
            event.target.parentElement.childNodes[4].children[0].lastChild
              .children[0];
        } else {
          okButton =
            event.target.parentElement.childNodes[2].children[0].lastChild
              .children[0];
        }
        okButton.addEventListener("click", this.setColorPickerFocus.bind(this));
        return;
      }

      if (
        event.target.classList.contains("setFocus") ||
        event.target.classList.contains("addRange")
      ) {
        event.preventDefault();
        window["outputStream"].next([
          "setFocusToSetPropertyElements",
          rowIndex,
          colIndex
        ]);
      }
      if(this.chartType == rangesChartType.grid){
        let addanotherCol = document.getElementById("addcolumn")["disabled"]; 
        if(event.currentTarget.id == "shownumber" + (window.divdrawerconfig.currentWidget.columns.length-1)){
          if(addanotherCol == true){
            let othersTab = document.getElementById("widgetProperty-1-Others");
            if(othersTab){
              event.preventDefault();
              othersTab.focus();
            }
          }
        }
        if(rowIndex == window.divdrawerconfig.currentWidget.columns.length-1){
          if(addanotherCol == true){
            if (event.target.parentElement.parentElement.parentElement.classList.contains("colorpicker") || event.target.classList.contains("gridSetFocus")) 
            {
                event.preventDefault();
                window["outputStream"].next([
                  "setFocusToSetPropertyElements",
                  rowIndex,
                  colIndex
                ]);
              }
          }
        }
      }
      if (event.target.id == "defaultColor" && event.target.checked) {
        event.preventDefault();
        window["outputStream"].next(["setFocusToSetPropertyElements"]);
      }
      if (event.target.id == "R1DefaultColors") {
        event.preventDefault();
        window["outputStream"].next(["setFocusToSetPropertyElements"]);
      }
      if(this.chartType == rangesChartType.calendarHeatmap && event.currentTarget.classList.contains("setFocus") || this.chartType == rangesChartType.tagcloud && event.currentTarget.classList.contains("setFocus")){
        event.preventDefault();
        window["outputStream"].next([
          "setFocusToSetPropertyElements",
          rowIndex,
          colIndex
        ]);
    }
  }
  }
  setColorPickerFocus(event) {
    if (
      event.target.parentElement.parentElement.parentElement.parentElement.classList.contains(
        "last-element"
      )
    ) {
      event.preventDefault();
      window["outputStream"].next(["setFocusToSetPropertyElements"]);
      return;
    } else {
      event.preventDefault();
      window["outputStream"].next(["setFocusNextToColorPickerOk", event]);
    }
  }

  setDefaultHeatmapColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      colors: "#000000",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      textPlaceholder: "Range Name"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    this.resetHeatmapToDefaultView();
    object["properties"]["minHeat"] = "#bc5959";
    object["properties"]["maxHeat"] = "#4caf50";
    window.inputStream.next(["refreshColorPicker"]);
  }
  setDefaultTreemapColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "",
      colors: "#000000",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["treemapLessThanColor"] = "#9dc3e6";
    object["properties"]["treemapGreaterThanColor"] = "#9dc3e6";
    object["properties"]["treemapTextColor"] = "#000000";
    object["properties"]["backgroundcolors"] = "['#9dc3e6']";
    object["showLegendRange"] = "true";
    object["properties"]["minMaxTextColor"] = "#000000";
    object["properties"]["minRange"] = "#bc5959";
    object["properties"]["maxRange"] = "#4caf50";
    object["properties"]["treemapGreaterThanValue"] = "1";
    window.inputStream.next(["refreshColorPicker"]);
  }

  setDefaultTreeColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "",
      colors: "#535353",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      rangeNames: "Low"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["colors"] = "['#535353']";    
    object["properties"]["treeLessThanColor"] = "#535353";
    object["properties"]["treeGreaterThanColor"] = "#535353";
    object["properties"]["treeGreaterThanValue"] = "1";    
    window.inputStream.next(["refreshColorPicker"]);
  }

  setHeatmapRangeColors(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
    if (id == "staticColorRange") {
      object["properties"]["colorOption"] = "2";
      object["properties"]["minHeat"] = "#bc5959";
      object["properties"]["maxHeat"] = "#4caf50";
      window.inputStream.next(["refreshColorPicker"]);
    }
    if (id == "customLinearRange") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        textPlaceholder: "Range Name"
      };
      object["properties"]["colorOption"] = "3";
      this.resetHeatmapToDefaultView();
      window.inputStream.next(["refreshColorPicker"]);
    }
  }

  //Reset all Heatmap chart values on "Custom Linear range" and "Default Colors Theam" radio button
  resetHeatmapToDefaultView(){
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["colors"] = "['#000000']";
    object["properties"]["backgroundcolors"] = "['#9dc3e6']";
    object["properties"]["heatmapLessThanBgColor"] = "#9dc3e6";
    object["properties"]["heatmapLessThanTextColor"] = "#000000";
    object["properties"]["heatmapGreaterThanBgColor"] = "#9dc3e6";    
    object["properties"]["heatmapGreaterThanTextColor"] = "#000000";
    object["properties"]["heatmapLessThanInputName"] = "";
    object["properties"]["heatmapGreaterThanInputName"] = "";
    object["properties"]["heatmapLessThanInputValue"] = "1";   
    object["properties"]["heatmapGreaterThanValue"] = "1";   
    object["properties"]["heatmapGreaterThanInputValue"] = "1";  
    object["properties"]["names"] = "";
    object["properties"]["showRangeName"] = "false";
    object["showLegendRange"] = "true";
  }

  setTreemapRangeColor(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
    if (id == "staticColorRange") {
      object["properties"]["colorOption"] = "2";
      object["properties"]["minRange"] = "#bc5959";
      object["properties"]["maxRange"] = "#4caf50";
      object["properties"]["minMaxTextColor"] = "#000000";
      window.inputStream.next(["refreshColorPicker"]);
    }
    if (id == "customLinearRange") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        status: "",
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6"
      };
      object["properties"]["colorOption"] = "3";
      object["properties"]["ranges"] = "[0,1]";
      object["properties"]["treemapGreaterThanColor"] = "#9dc3e6";
      object["properties"]["treemapLessThanColor"] = "#9dc3e6";
      object["properties"]["backgroundcolors"] = "['#9dc3e6']";
      object["properties"]["treemapTextColor"] = "#000000";
      object["showLegendRange"] = "true";
      object["properties"]["treemapGreaterThanValue"] = "1";
      window.inputStream.next(["refreshColorPicker"]);
    }
  }

  setTreeRangeColors(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
  }

  //In setRangeName() function heatmapLessThanInputName & heatmapGreaterThanInputName Input box set functionality handled
  setRangeName(rowId, $event, inputName) {
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.heatmap) {
      let outputRangeNames = "";
      let newName = $event.target.value;
     
     if ( inputName  == 'heatmapLessThanInputName' ) {
      this.AllData.properties.heatmapLessThanInputName =  newName     
     }else if (inputName == 'heatmapGreaterThanInputName') {
      this.AllData.properties.heatmapGreaterThanInputName =  newName
     }else if(inputName == 'names'){
      this.arrInput[rowId]["names"] = newName;
      this.arrInput[rowId]["rangeNames"] = newName;
      for (let i = 0; i < this.arrInput.length; i++) {
        let arrRangeNames = this.arrInput[i]["names"] || this.arrInput[i]["rangeNames"];
        let arrRangeNamesLength;
        if( arrRangeNames != undefined ) {
          arrRangeNamesLength = arrRangeNames.length - 1;
          if (
            arrRangeNames[0] == "[" ||
            arrRangeNames[arrRangeNamesLength] == "]"
          ) {
            let updateName = arrRangeNames.replace(/[\[\]]+/g, "");
            arrRangeNames = updateName;
          }
          let appendsign = "'";
          if (arrRangeNames[0] !== "'") {
            outputRangeNames += appendsign + arrRangeNames + appendsign + ",";
          } else {
            outputRangeNames += arrRangeNames + ",";
          }
        } else {
          outputRangeNames += "''" + ","
        }
      }
      outputRangeNames = outputRangeNames.slice(0, outputRangeNames.length - 1);
      if (outputRangeNames[0] !== "[")
        outputRangeNames = "[" + outputRangeNames + "]";
      window["divdrawerconfig"].currentWidget["properties"][
        "names"
      ] = outputRangeNames;
     }    
    }
  }

  //In getRangeName() function heatmapLessThanInputName & heatmapGreaterThanInputName Input box get functionality handled
  getRangeName(rowId, inputName) {
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.heatmap) {
      let lessThanRangeNames =
        window["divdrawerconfig"].currentWidget["properties"]["heatmapLessThanInputName"] || "";
      let graterThanRangeNames =
        window["divdrawerconfig"].currentWidget["properties"]["heatmapGreaterThanInputName"] || "";
      let rangeNames =
        window["divdrawerconfig"].currentWidget["properties"]["names"];
      rangeNames = rangeNames.split(",");
      let lessThanName = lessThanRangeNames
      let name = rangeNames[rowId];
      let greaterThanName = graterThanRangeNames;
        if (name) {
        if (
          name.startsWith("['") ||
          name.startsWith("'") ||
          name.endsWith("']") ||
          name.endsWith("]")
        ) {
          name = name.replace(/[\[\]/"/']+/g, "");
        }
        return name;
      }else if(inputName == "heatmapLessThanInputName"){
        return lessThanName;
      }
      else if(inputName == "heatmapGreaterThanInputName"){
        return greaterThanName;
      }else return "";
    }   
  }

  getThickness(rowId, inputName) {
    var topologyLessThanThickness = this.AllData.properties["topologyLessThanThickness"];  
    var topologyGreaterThanThickness = this.AllData.properties["topologyGreaterThanThickness"];   
    var thickness = this.AllData.properties["thickness"];
    let returnValue = "1";

    if (thickness !== undefined && thickness[rowId] !== undefined) {
      var thicknessString = thickness.replace(/[\[\]]/g, "");
      var thicknessArr = thicknessString.split(",");
      for (var i = 0; i < thicknessArr.length; i++) {
        if (rowId == i) {
          returnValue =
            thicknessArr[i] !== undefined ? thicknessArr[i] : returnValue;
        } else {
          if (thicknessArr[rowId] !== undefined) {
            returnValue = thicknessArr[rowId];
          }
        }

        return returnValue.replace(/"/g, "");
      }
    } else if(inputName == "topologyLessThanThickness"){
      var topologyLessThanThicknessString = topologyLessThanThickness;
        return topologyLessThanThicknessString;
    } else if(inputName == "topologyGreaterThanThickness"){
      var topologyGreaterThanThicknessString = topologyGreaterThanThickness;
        return topologyGreaterThanThicknessString;
    } else {
      return returnValue;
    }
  }

  addRangeNames() {
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.heatmap) {
      let defRanges = {
        ranges: [null, 1],
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        names: ""
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.calendarHeatmap) {
      let defRanges = {
        ranges: [null, 1],
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        names: ""
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    if (window["divdrawerconfig"].currentWidget.type ==  rangesChartType.topology) {
      let defRanges = { 
        ranges: [null, 1], 
        colors: "#535353", 
        thickness: "1"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
    if (window["divdrawerconfig"].currentWidget.type == "Tree") {
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#535353",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }

    if (window.divdrawerconfig.currentWidget.type == rangesChartType.map) {
      let defRanges = {
        ranges: [null, 1],
        status: "",
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        shape: "Dot"        
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput.push(tempObj);
    }
  }

  getMinMaxHeat(heat) {
    return window["divdrawerconfig"].currentWidget["properties"][heat];
  }
  getMinMaxRange(range) {
    return window["divdrawerconfig"].currentWidget["properties"][range];
  }
  getLowColorTreemap(treemapLessThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      treemapLessThanColor
    ];
  }

  getLowColorTree(treeLessThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      treeLessThanColor
    ];
  }

  getLowColorBullet(bulletLessThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      bulletLessThanColor
    ];
  }

  getLowColorTagcloud(tagcloudLessThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      tagcloudLessThanColor
    ];
  }

  getLowColorTopology(topologyLessThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      topologyLessThanColor
    ];
  }

  getLowColorHeatmapText(heatmapLessThanTextColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanTextColor
    ];
  }

  getLowColorHeatmapBg(heatmapLessThanBgColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanBgColor
    ];
  }

  getRangeNameLessThanInput(heatmapLessThanInputVal) {
     return window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanInputVal
    ];
  }

  getHighColorTreemap(treemapGreaterThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      treemapGreaterThanColor
    ];
  }

  getHighColorTree(treeGreaterThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      treeGreaterThanColor
    ];
  }

  getHighColorBullet(bulletGreaterThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      bulletGreaterThanColor
    ];
  }

  getHighColorTagcloud(tagcloudGreaterThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      tagcloudGreaterThanColor
    ];
  }

  getHighColorTopology(topologyGreaterThanColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      topologyGreaterThanColor
    ];
  }

  getHighColorHeatmapText(heatmapGreaterThanTextColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanTextColor
    ];
  }

  getHighColorHeatmapBg(heatmapGreaterThanBgColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanBgColor
    ];
  }

  getRangeNameGreaterThanInput(heatmapGreaterThanInputVal) {
    return window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanInputVal
    ];
  }  
  
  getMinMaxRangeGreater() {
    let ranges = this.AllData.properties["ranges"].replace(/[\\"],,/g, "");
    let lee = ranges.length;    
    for (let i = 0; i < lee; i++) {
      if (
        ranges.indexOf(",,") > -1 ||
        ranges.indexOf(",]") > -1 ||
        ranges.indexOf("],") > -1
      ) {
        ranges = ranges.replace(/,,/gi, ",");
        ranges = ranges.replace(/,]/gi, "]");
        ranges = ranges.replace(/],/gi, ",");
      }
    }    
    ranges = ranges.replace(/\[[,]/g, "[");
    ranges = ranges.replace(/]]/gi, "]");
    
    let Ranges = ranges.replace(/[\[\]']+/g, "").split(",");
    let strRanges;
    
    Ranges.forEach( (ele,index) => {
      if( index == 0 ) {
        strRanges =  parseFloat(ele); 
      } else {
        strRanges =  strRanges + ',' + parseFloat(ele); 
      }
    });
    strRanges = '[' + strRanges + ']';
    ranges = JSON.parse(strRanges);    
    
    switch(this.chartType){
      case "Treemap" :
        this.AllData.properties.treemapGreaterThanValue = parseInt(
          ranges[ranges.length - 1]
        );
        break;
      case "Tree" :
        this.AllData.properties.treeGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
      );
      break;
      case "bulletmap" :
        this.AllData.properties.bulletGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
        );
        break;
      case "TagCloud" :
        this.AllData.properties.tagcloudGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
        );
        break;
      case "CalendarHeatmap" :
        this.AllData.properties.calendarHeatmapGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
        );
        break;
      case "Heatmap" :
        this.AllData.properties.heatmapGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
        );
        this.AllData.properties.heatmapLessThanInputValue = parseInt(
        ranges[ranges.length - 1]
        );
        this.AllData.properties.heatmapGreaterThanInputValue = parseInt(
        ranges[ranges.length - 1]
        );
        break;
      case "Badge" :
        this.AllData.properties.badgeGreaterThanValue = parseInt(
        ranges[ranges.length - 1]
        );          
    }
    
    return parseInt(ranges[ranges.length - 1]);
  }
  getTreemapTextColor(textcolor) {
    return window["divdrawerconfig"].currentWidget["properties"][textcolor];
  }
  setMinMaxHeat(heat, $event) {
    window["divdrawerconfig"].currentWidget["properties"][heat] = $event;
  }
  setMinMaxRange(range, $event) {
    window["divdrawerconfig"].currentWidget["properties"][range] = $event;
  }
  setHighColorTreemap(treemapGreaterThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      treemapGreaterThanColor
    ] = $event;
  }
  setHighColorTree(treeGreaterThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      treeGreaterThanColor
    ] = $event;
  }

  setHighColorBullet(bulletGreaterThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      bulletGreaterThanColor
    ] = $event;
  }

  setHighColorTagcloud(tagcloudGreaterThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      tagcloudGreaterThanColor
    ] = $event;
  }

  setHighColorTopology(topologyGreaterThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      topologyGreaterThanColor
    ] = $event;
  }

  setHighColorHeatmapText(heatmapGreaterThanTextColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanTextColor
    ] = $event;
  }

  setHighColorHeatmapBg(heatmapGreaterThanBgColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanBgColor
    ] = $event;
  }

  setRangeNameGreaterThanInput(heatmapGreaterThanInputVal, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapGreaterThanInputVal
    ] = $event;
  }


  setLowColorTreemap(treemapLessThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      treemapLessThanColor
    ] = $event;
  }

  setLowColorTree(treeLessThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      treeLessThanColor
    ] = $event;
  }

  setLowColorBullet(bulletLessThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      bulletLessThanColor
    ] = $event;
  }

  setLowColorTagcloud(tagcloudLessThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      tagcloudLessThanColor
    ] = $event;
  }

  setLowColorTopology(topologyLessThanColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      topologyLessThanColor
    ] = $event;
  }

  setLowColorHeatmapBg(heatmapLessThanBgColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanBgColor
    ] = $event;
  }

  setLowColorHeatmapText(heatmapLessThanTextColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanTextColor
    ] = $event;
  }

  setRangeNameLessThanInput(heatmapLessThanInputVal, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      heatmapLessThanInputVal
    ] = $event;
  }

  setTreemapTextColor(textcolor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][textcolor] = $event;
  }

  setHeatMapProperties(prop, $event) {
    let value;
    if ($event.target.checked !== false) value = "true";
    else value = "false";
    if (prop == "showRangeName") {
      window["divdrawerconfig"].currentWidget["properties"][
        "showRangeName"
      ] = value;
    }
    if (prop == "showLegendRange") {
      window["divdrawerconfig"].currentWidget["showLegendRange"] = value;
    }
  }
  setTreeMapProperties(prop, $event) {
    let value;
    if ($event.target.checked !== false) value = "true";
    else value = "false";
    if (prop == "showLegendRange") {
      window["divdrawerconfig"].currentWidget["showLegendRange"] = value;
    }
  }

  setTreeProperties(prop, $event) {
    let value;
    if ($event.target.checked !== false) value = "true";
    else value = "false";
    if (prop == "alertRangeColor") {
      window["divdrawerconfig"].currentWidget["properties"][
        "alertRangeColor"
      ] = value;
    }
  }
  getHeatMapProperties(prop) {
    let value;
    if (prop == "showRangeName") {
      value =
        window["divdrawerconfig"].currentWidget["properties"]["showRangeName"];
    }
    if (prop == "showLegendRange") {
      value = window["divdrawerconfig"].currentWidget["showLegendRange"];
    }
    if (value == "true") return true;
    else return false;
  }
  getTreeMapProperties(prop) {
    let value;
    if (prop == "showLegendRange") {
      value = window["divdrawerconfig"].currentWidget["showLegendRange"];
    }
    if (value == "true") return true;
    else return false;
  }

  getTreeProperties(prop) {
    let value;
    if (prop == "alertRangeColor") {
      value =
        window["divdrawerconfig"].currentWidget["properties"][
          "alertRangeColor"
        ];
    }
    if (value == "true") return true;
    else return false;
  }
  showHideRadioOptions($event, groupClass) {
    let elementsArray = document.getElementsByClassName(groupClass);
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id ==
        $event.target.id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
  }
  setFixedBadgeColors($event, section, type) {
    let color = $event;
    let object = window["divdrawerconfig"].currentWidget;
    let strTochange = object[section];

    if (type !== "unitColor") {
      let arrStrTochange = strTochange.split(";");
      let flag = 0;
      for (let i = 0; i < arrStrTochange.length; i++) {
        let node = arrStrTochange[i];
        let arrParamName = node.split(":");
        let paramName = arrParamName[0];
        if (paramName == type) {
          arrParamName[1] = color;
          arrStrTochange[i] = arrParamName.join(":");
          flag = 1;
        }
      }
      if (flag == 0) {
        //property not found
        let newParam = [];
        newParam[0] = type;
        newParam[1] = section;

        if (arrStrTochange[arrStrTochange.length - 1] == "")
          arrStrTochange[arrStrTochange.length - 1] = newParam.join(":");
        else arrStrTochange[arrStrTochange.length] = newParam.join(":");
      }
      strTochange = arrStrTochange.join(";");
      object[section] = strTochange;
    } else {
      object[section] = color;
    }
  }
  getFixedBadgeColors(section, type) {
    let object = window["divdrawerconfig"].currentWidget;
    let value = object[section];

    if (type !== "unitColor") {
      const arrValue = value.split(";");
      let flag = 0;
      for (let i = 0; i < arrValue.length; i++) {
        let arrParamName = arrValue[i].split(":");
        let paramName = arrParamName[0];
        if (paramName == type) {
          value = arrParamName[1];
          flag = 1;
          if (paramName == "color")
            value = arrParamName[1].replace(" !important", "");
        }
      }
      if (flag == 0) {
        //if property not found
        if (type == "BG") value = "#ffffff";
        else if (type == "Text") value = "#000000";
      }
    } else {
      if (!value) {
        object["unitColor"] = "#000000";
        value = object["unitColor"];
      }
    }

    return value;
  }

  setBulletColor($event) {
    let value = $event;
    window["divdrawerconfig"].currentWidget.properties.bulletColor = value;
  }
  setTreemapColor($event) {
    let value = $event;
    window["divdrawerconfig"].currentWidget.properties.treemapTextColor = value;
  }
  getBulletColor() {
    if (window["divdrawerconfig"].currentWidget.properties.bulletColor)
      return window["divdrawerconfig"].currentWidget.properties.bulletColor;
    else return "#00000";
  }
  getTreemapColor() {
    if (window["divdrawerconfig"].currentWidget.properties.treemapTextColor)
      return window["divdrawerconfig"].currentWidget.properties
        .treemapTextColor;
    else return "#00000";
  }
  setDefaultBulletColor() {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "",
      colors: "#000000",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      rangeNames: "Low"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["colors"] = "['#000000']";
    object["properties"]["bulletColor"] = "#000000";
    object["properties"]["bulletLessThanColor"] = "#000000";
    object["properties"]["bulletGreaterThanColor"] = "#000000";
    object["properties"]["bulletGreaterThanValue"] = "1";   
    window.inputStream.next(["refreshColorPicker"]);
  }
  setBulletRangeColors(id) {
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
  }
  getMinMaxTagColor(color) {
    return window["divdrawerconfig"].currentWidget["properties"][color];
  }
  setMinMaxTagColor(color, $event) {
    window["divdrawerconfig"].currentWidget["properties"][color] = $event;
  }

  setTagCloudColors($event, value) {
    let object = window["divdrawerconfig"].currentWidget;
    object.properties.colorOption = value;

    if (value == "1") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        status: "",
        colors: "#9dc3e6",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput[0] = tempObj;
      object.colorRangeId = "";
      object.properties.minColor = "#4caf50";
      object.properties.maxColor = "#bc5959";
      object.properties.ranges = "[0,1]";
      object.properties.colors = "['#9dc3e6']";
      this.resetTagcloudToDefaultView();  
      window.inputStream.next(["refreshColorPicker"]);
      this.showHideTagCloudColorOptions(
        "",
        "tagcloudRangeLinear,tagcloudRange,DBColorRanges"
      );
    }
    if (value == "2") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        status: "",
        colors: "#9dc3e6",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput[0] = tempObj;
      object.properties.ranges = "[0,1]";
      object.properties.colors = "['#9dc3e6']";
      this.resetTagcloudToDefaultView();
      window.inputStream.next(["refreshColorPicker"]);
      this.showHideTagCloudColorOptions(
        "tagcloudRangeLinear",
        "tagcloudRange,DBColorRanges"
      );
    }
    if (value == "3") {
      object.properties.minColor = "#4caf50";
      object.properties.maxColor = "#bc5959";
      window.inputStream.next(["refreshColorPicker"]);
      this.showHideTagCloudColorOptions(
        "tagcloudRange",
        "tagcloudRangeLinear,DBColorRanges"
      );
    }
    if (value == "4") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        status: "",
        colors: "#9dc3e6",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        rangeNames: "Low"
      };
      const tempObj = JSON.parse(JSON.stringify(defRanges));
      this.arrInput[0] = tempObj;
      object.properties.minColor = "#4caf50";
      object.properties.maxColor = "#bc5959";
      object.properties.ranges = "[0,1]";
      object.properties.colors = "['#9dc3e6']";
      this.resetTagcloudToDefaultView();
      window.inputStream.next(["refreshColorPicker"]);
      this.showHideTagCloudColorOptions(
        "DBColorRanges",
        "tagcloudRange,tagcloudRangeLinear"
      );
    }
  }

  //Function to reset Tagcloud values on radio buttons
  resetTagcloudToDefaultView(){
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["tagcloudLessThanColor"] = "#9dc3e6";
    object["properties"]["tagcloudGreaterThanColor"] = "#9dc3e6";
    object["properties"]["tagcloudGreaterThanValue"] = "1"; 
  }

  showHideTagCloudColorOptions(toShow, toHide) {
    toShow = toShow.split(",");
    toHide = toHide.split(",");
    let className;

    for (let i = 0; i < toShow.length; i++) {
      className = "." + toShow[i];
      if (className !== ".")
        document.querySelector(className).classList.remove("hide");
    }
    for (let i = 0; i < toHide.length; i++) {
      className = "." + toHide[i];
      document.querySelector(className).classList.add("hide");
    }
  }

  setFinalRanges(index, value) {
    /* if (value.ranges[0] !== "[") {
			this.AllData.properties[index]['ranges'] = "[" + value['ranges'];
			if (value.ranges[value.ranges.length - 1] !== "]")
				this.AllData.properties[index]['ranges'] = this.AllData.properties[index]['ranges'] + "]";
		} 
		else{
			if (value.ranges[value.ranges.length - 1] !== "]")
				this.AllData.properties[index]['ranges'] = value['ranges'] + "]";
			else
				this.AllData.properties[index]['ranges'] = value['ranges']
		}
		if (value.colors[0] !== "[") {
			this.AllData.properties[index]['colors'] = "[" + value.colors;
		}
		if (value.colors[value.colors.length - 1] !== "]")
		this.AllData.properties[index]['colors'] = this.AllData.properties[index]['colors'] + "]";
		if(value.colors[0] == "[" && value.colors[value.colors.length - 1] == "]"){
			this.AllData.properties[index]['colors'] = value.colors;
		} */
    value.ranges = value.ranges.replace(/[\[\]]/g, "");
    value.colors = value.colors.replace(/[\[\]]/g, "");
    this.AllData.properties[index]["ranges"] = "[" + value.ranges + "]";
    this.AllData.properties[index]["colors"] = "[" + value.colors + "]";
  }
  getComplexGaugeRange(
    rowIndex,
    inputname,
    inputIndex,
    incrementValueFlag,
    objIndex
  ) {
    let object, array;
    if (objIndex !== undefined) {
      object = this.AllData.properties[objIndex];
      if (objIndex == 0) array = this.parentArrInput;
      else array = this.childArrInput;
    }

    if (object["ranges"]) {
      object["ranges"] = object["ranges"].replace(/[\\"]/g, "");

      let value = "";
      let updatedValue = "";
      if (inputIndex !== undefined) {
        updatedValue = array[rowIndex][inputname][inputIndex];

        if (
          updatedValue[0] == "[" ||
          updatedValue[1] == "]" ||
          updatedValue[0] == "/" ||
          updatedValue[0] == '"' ||
          updatedValue[updatedValue.length - 1] == "]"
        ) {
          value = updatedValue.replace(/[\[\]/"/']+/g, "");
        } else {
          value = updatedValue;
        }
      } else {
        updatedValue = array[rowIndex][inputname];
        if (updatedValue) {
          if (updatedValue[0] == "'" || updatedValue[1] == "'") {
            value = updatedValue.replace(/[\[\]/"/']+/g, "");
          } else {
            value = array[rowIndex][inputname];
          }
        }
      }
      if (incrementValueFlag && inputname == "ranges")
        return parseInt(value) + 1;

      return value;
    }
  }

  setComplexGaugeRange(rowIndex, inputname, inputIndex, $event, objIndex) {
    let array;
    if (objIndex !== undefined) {
      if (objIndex == 0) array = this.parentArrInput;
      else array = this.childArrInput;
    }
    const inputValue = $event.target.value;
    if (inputIndex !== undefined && inputIndex !== null) {
      array[rowIndex][inputname][inputIndex] = inputValue;
    } else {
      array[rowIndex][inputname] = inputValue;
    }
    this.setOutputComplexGaugeString(objIndex);
    this.setOutputComplexGaugeColor(objIndex);
  }

  setOutputComplexGaugeString(objIndex) {
    let strOutputStringRanges = "";
    let strOutputStringColor = "";
    let array;
    //for (let count = 0; count < 2; count++) {
    strOutputStringRanges = "";
    strOutputStringColor = "";
    if (objIndex == 0) array = this.parentArrInput;
    else array = this.childArrInput;
    for (let i = 0; i < array.length; i++) {
      const arrRanges = array[i]["ranges"];
      for (let j = 0; j < arrRanges.length; j++) {
        if (arrRanges[j] !== null) {
          strOutputStringRanges += arrRanges[j] + ",";
        }
      }
      let color = array[i]["colors"];
      if (color == undefined) color = "#e62424";
      strOutputStringColor += color + ",";
    }

    strOutputStringRanges = strOutputStringRanges.slice(
      0,
      strOutputStringRanges.length - 1
    );
    strOutputStringColor = strOutputStringColor.slice(
      0,
      strOutputStringColor.length - 1
    );

    if (strOutputStringRanges[0] == "[") {
      let formatedstring = strOutputStringRanges.replace(/[\[\]']+/g, "");
      strOutputStringRanges = formatedstring;
    }

    this.outputValue["ranges"] = strOutputStringRanges;
    this.outputValue["colors"] = strOutputStringColor;
    //this.emitterChannel.emit({ ACTION: 'UPDATE_RANGES_STATUS', VALUE: { columnIndex: this.colapsTabIndex, params: this.outputValue } });
    this.setFinalRanges(objIndex, this.outputValue);
    //}
  }

  setOutputComplexGaugeColor(objIndex) {
    let strOutputStringRanges = "";
    let strOutputStringColor = "";
    let array;
    //for (let count = 0; count < 2; count++) {
    strOutputStringRanges = "";
    strOutputStringColor = "";
    if (objIndex == 0) array = this.parentArrInput;
    else array = this.childArrInput;
    for (let i = 0; i < array.length; i++) {
      const arrRanges = array[i]["ranges"];
      for (let j = 0; j < arrRanges.length; j++) {
        if (arrRanges[j] !== null) {
          strOutputStringRanges += arrRanges[j] + ",";
        }
      }
      let color = array[i]["colors"];
      let colorLength = color.length - 1;
      if (color[0] == "[" || color[colorLength] == "]") {
        let updatecolor = color.replace(/[\[\]]+/g, "");
        color = updatecolor;
      }
      let appendsign = "'";
      if (color[0] !== "'") {
        strOutputStringColor += appendsign + color + appendsign + ",";
      } else {
        strOutputStringColor += color + ",";
      }
    }
    strOutputStringRanges = strOutputStringRanges.slice(
      0,
      strOutputStringRanges.length - 1
    );
    strOutputStringColor = strOutputStringColor.slice(
      0,
      strOutputStringColor.length - 1
    );
    this.outputValue["ranges"] = strOutputStringRanges;
    this.outputValue["colors"] = strOutputStringColor;
    this.setFinalRanges(objIndex, this.outputValue);

    //}
  }

  removeComplexGaugeRange(rowId, objIndex) {
    let array, object;
    if (objIndex == 0) {
      array = this.parentArrInput;
      object = this.AllData.properties[0];
    } else {
      array = this.childArrInput;
      object = this.AllData.properties[1];
    }
    array.splice(rowId, 1);
    let strRanges = object.ranges;
    let arrStrRanges = strRanges.split(",");
    let strColors = object.colors;
    let arrStrColors = strColors.split(",");

    arrStrRanges.splice(rowId + 1, 1);
    arrStrColors.splice(rowId, 1);

    let updatedRange = arrStrRanges.toString();
    let updatedColors = arrStrColors.toString();

    if (updatedRange[updatedRange.length - 1] !== "]")
      object.ranges = updatedRange + "]";
    else object.ranges = updatedRange;
    if (object.ranges == "[0]") object.ranges = "[0,0]";
    if (updatedColors[updatedColors.length - 1] !== "]")
      object.colors = updatedColors + "]";
    else if (updatedColors[0] !== "[") object.colors = "[" + updatedColors;
    else object.colors = updatedColors;

    if (object.ranges == "[0,0]") {
      if (object["colors"]) {
        object["colors"] = "['#e62424']";
      }
    }
    this.initComplexGaugeRange();
    window["outputStream"].next([
      "setFocusToSetPropertyElements",
      arrStrRanges.length - 2,
      undefined
    ]);
    let rowToFocus = arrStrRanges.length - 2;
    setTimeout(function() {
      if (objIndex == 0)
        document.querySelector("#colorRangeEnd-" + rowToFocus)["focus"]();
      else document.querySelector("#colorRangeEnd1-" + rowToFocus)["focus"]();
    }, 100);
  }
  setDefaultMapColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [null, 0],
      status: "",
      colors: "#9dc3e6",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      rangeNames: "Low"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["ranges"] = "[0,0]";
    object["properties"]["colors"] = "['#9dc3e6']";
  }

  setMapRangeColors(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
  }

  changeThis(event) {
    var cascadeHelpText = document.getElementById("cascadeHelpText");
    if (event.target.checked) {
      this.isDisabled = false;
      cascadeHelpText.style.display = "block";
    } else {
      this.isChecked = false;
      this.isDisabled = true;
      cascadeHelpText.style.display = "none";
    }
  }

  setThickness(rowIndex, inputname, inputIndex, $event) {
    const inputValue = $event.target.value;
    if (inputValue < 1) {
      $event.target.value = "";
    } else {
        if (inputIndex !== undefined && inputIndex !== null && inputname == "thickness") {
          this.arrInput[rowIndex][inputname] = inputValue;
        } else if(inputname == "topologyLessThanThickness"){
          this.arrInput[0][inputname] = inputValue;
        } else if(inputname == "topologyGreaterThanThickness"){
          this.arrInput[0][inputname] = inputValue;
        }
        this.setOutputString();
    }
  }
  getKPIDefaultThemeContainerRadios() {
    let object = window["divdrawerconfig"].currentWidget;
    let KPIDefaultThemeContainer;
    KPIDefaultThemeContainer =
      object.properties.KPIDefaultTheme == "R1CustomColors" ? true : false;
    return KPIDefaultThemeContainer;
  }
  setDefaultThemeContainer(id) {
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"][
      "shapeToBePlotted"
    ] = this.AllData.properties.shapeToBePlotted;
    if (id != "R1DefaultColors" && id != "R1CustomColors") {
      object["properties"]["KPIDefaultTheme"] = "R1DefaultColors";
      this.AllData.properties.KPIDefaultTheme = "R1DefaultColors";
    } else {
      object["properties"]["KPIDefaultTheme"] = id;
      this.AllData.properties.KPIDefaultTheme = id;
    }
  }
  setDefaultShapeStrings(id) {
    let object = window["divdrawerconfig"].currentWidget;

    object["properties"][
      "shapeToBePlotted"
    ] = this.AllData.properties.shapeToBePlotted;

    if (id == "R2Shapes" && object.properties.KPISstrignShapeIcon != "R2Shapes")
      object["properties"]["KPISstrignShapeIcon"] = "R2Shapes";
    if (this.AllData.properties["KPIStringData"] == undefined) {
      this.AllData.properties["KPIStringData"] = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
    }
    object["properties"]["KPIStringData"] = this.AllData.properties[
      "KPIStringData"
    ];
  }

  setDefaultShapeValues(id) {
    let object = window["divdrawerconfig"].currentWidget;
    if (id == "R3Shapes" && object.properties.KPISValuesShapeIcon != "R3Shapes") {
      object["properties"]["KPISValuesShapeIcon"] = "R3Shapes";
  }
    this.AllData.properties.KPIIconRangesData = [{ranges: [0, 1], imageSource: ""}];
      object.properties["gisLessThanicon"]= "";
      object.properties["gisGreaterThanicon"]= "";
  }

  setDefaultTopologyColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      status: "",
      colors: "#535353",
      topologyLessThanColor: "#535353",
      topologyGreaterThanColor: "#535353",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      rangeNames: "Low",
      thickness: "1",
      topologyLessThanThickness:"1",
      topologyGreaterThanThickness:"1"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["colors"] = "['#535353']";    
    object["properties"]["topologyLessThanColor"] = "#535353";
    object["properties"]["topologyGreaterThanColor"] = "#535353";
    object["properties"]["topologyGreaterThanValue"] = "1"; 
    object["properties"]["thickness"] = "1";
    object["properties"]["topologyLessThanThickness"] = "1";
    object["properties"]["topologyGreaterThanThickness"] = "1";
  }
  setTopologyRangeColors(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
  }
  alertRange(event, rowIndex, value) {
    if (event.target.checked) {
      let rangeStart;
      if (rowIndex == 0) {
        rangeStart = document.getElementById("range1-" + rowIndex)["value"];
      } else {
        rangeStart = document.getElementById("range2-" + rowIndex)["value"];
      }
      const rangeEnd = document.getElementById("colorRangeEnd-" + rowIndex)[
        "value"
      ];
      const color = document.getElementById("colorpickerright-" + rowIndex)[
        "value"
      ];
      const Cascaderange = {
        thresholdRange: [rangeStart, rangeEnd],
        thresholdColor: color
      };

      this.emitterChannel.emit({
        ACTION: "UPDATE_ALERT_RANGE",
        VALUE: { Cascaderange }
      });
    }
  }
  setRangeSet() {
    this.rangeSetByDefault = true;
    this.SpecificValueByDefault = false;
  }

  setSpecificValueChecked() {
    this.rangeSetByDefault = false;
    this.SpecificValueByDefault = true;
  }
  showShapes() {
    this.showValueContainer = true;
    this.showIconsContainer = false;
  }
  showIcons() {
    this.showIconsContainer = true;
    this.showValueContainer = false;
  }
  showDefaultThemeContainer() {
    this.AllData.properties.KPISstrignShapeIcon = "R1DefaultColors";
  }
  showShapesPanelContainer() {
    this.AllData.properties.KPISstrignShapeIcon = "R2Shapes";

    if (this.AllData.properties.KPISValuesShapeIcon != "R3Icons") {
      this.AllData.properties.icons = [];
      // data empty for string icon's we change from icon to shape
      let defIcons = {
        nodetype: "",
        imageSource: "",
        isPushed: true
      };
      const tempObj = JSON.parse(JSON.stringify(defIcons));
      this.AllData.properties.icons.push(tempObj);
    }
    this.arrInput = [];
    this.arrMapInput = [];
    if (this.AllData.properties["KPIStringData"] != undefined) {
      this.arrMapInput = this.AllData.properties["KPIStringData"];
    } else {
      let arrDefaultMapInput = {
        value: "",
        shape: "Dot",
        colors: "#000000"
      };
      const tempDefaultMapInput = JSON.parse(
        JSON.stringify(arrDefaultMapInput)
      );
      this.arrMapInput.push(tempDefaultMapInput);
    }
  }
  showIconsPanelContainer() {
    this.chartType = rangesChartType.map;
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["KPISstrignShapeIcon"] = "R2Icons";

    if (this.AllData.properties.icons.length <= 0) {
      this.AllData.properties.icons = [];
      let defIcons = {
        nodetype: "",
        imageSource: "",
        isPushed: true
      };
      const tempObj = JSON.parse(JSON.stringify(defIcons));
      this.AllData.properties.icons.push(tempObj);
    }
    this.inputMapData = this.AllData.properties.icons;

    // Empty the kpi string shapes data when click on string icon
    this.AllData.properties["KPIStringData"] = [
      {
        value: "",
        shape: "Dot",
        colors: "#000000"
      }
    ];
    object["properties"]["KPIStringData"] = this.AllData.properties[
      "KPIStringData"
    ];
  }
  showShapesPanelContainerValues() {
    this.AllData.properties.icons = [];
    this.arrInput = [];
    let defIcons = {
      nodetype: "",
      imageSource: "",
      isPushed: true,
      ranges: [0, 1],
      shape: "Dot"
    };
    const tempObj = JSON.parse(JSON.stringify(defIcons));
    this.AllData.properties.icons.push(tempObj);
    if (
      this.AllData.checkedRadios[0][1] == "kpiValues" &&
      (this.AllData.properties["KPIValuesData"] == undefined ||
        this.AllData.properties["KPIValuesData"].length <= 0)
    ) {
      const arrInputObj = JSON.parse(
        JSON.stringify({
          ranges: [null, 1],
          status: "normal",
          colors: "#000000",
          fontcolors: "#000000",
          backgroundcolors: "#e62424",
          shape: "Dot"
        })
      );
      this.arrInput[0] = arrInputObj;
    } else {
      this.arrInput = this.AllData.properties["KPIValuesData"];
    }
    this.showHideShapesPanelValues = true;
    this.showHideValueIconPanel = false;
  }
  showIconsPanelContainerValues() {
    let object = window["divdrawerconfig"].currentWidget;
    if (this.AllData.properties.KPISValuesShapeIcon == "R3Shapes") {
      this.AllData.properties["KPIValuesData"] = [
        {
          ranges: [null, 1],
          status: "normal",
          colors: "#000000",
          fontcolors: "#000000",
          shape: "Dot"
        }
      ];
      object["properties"]["KPIValuesData"] = this.AllData.properties[
        "KPIValuesData"
      ];      
      object.properties["lessThanshape"] = "Dot",
      object.properties["greaterThanshape"] = "Dot",
      object.properties["gisGreaterThanShapeValue"] = "1",
      object.properties["gisLessThanColor"] = "#000000",
      object.properties["gisGreaterThanColor"] = "#000000"
    }
    this.showHideShapesPanelValues = false;
    this.showHideValueIconPanel = true;
    object["properties"]["KPISValuesShapeIcon"] = "R3Icons";
    if (object.properties.KPISValuesShapeIcon == "R3Icons") {
      if (this.AllData.properties.icons.length <= 0) {
        this.AllData.properties.icons = [];
        let defIcons = {
          nodetype: "",
          imageSource: "",
          isPushed: true
        };
        const tempObj = JSON.parse(JSON.stringify(defIcons));
        this.AllData.properties.icons.push(tempObj);        
        object.properties["gisLessThanicon"]= "",
        object.properties["gisLessThaniconheight"]= "",
        object.properties["gisLessThaniconwidth"]= "",
        object.properties["gisGreaterThanicon"]= "",
        object.properties["gisGreaterThaniconheight"]= "",
        object.properties["gisGreaterThaniconwidth"]= "",
        object.properties["gisGreaterIconsThanValue"]= "1"
      }
      this.AllData.properties.ranges = "[0,1]";
      this.AllData.properties["KPIShapeValuesData"] = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
      object["properties"]["KPIShapeValuesData"] = this.AllData.properties[
        "KPIShapeValuesData"
      ];
      this.arrValueInput = this.AllData.properties["KPIShapeValuesData"];
      this.inputMapData = this.AllData.properties.icons;
      this.AllData.properties.KPIValuesRangeValue = "R3Ranges";
      this.AllData.properties["KPIValuesData"] = [];
      this.AllData.properties.KPIValuesData.splice(
        0,
        this.AllData.properties.KPIValuesData.length - 1
      );
      this.AllData.properties.KPIValuesData = [
        {
          ranges: [0, 1],
          status: "normal",
          colors: "#000000",
          fontcolors: "#000000",
          shape: "Dot"
        }
      ];

      this.arrInput = this.AllData.properties.KPIValuesData;
    }
  }

  getMinMaxGisRangeGreater(){
    if(this.AllData.properties.KPIValuesData != undefined){
      let ranges: any;
      for(let i=0; i < this.AllData.properties.KPIValuesData.length; i++){
         ranges = this.AllData.properties.KPIValuesData[i].ranges;
      }
      window.divdrawerconfig.currentWidget.properties.gisGreaterThanShapeValue= parseInt(
        ranges[ranges.length - 1]
      );
        return parseInt(ranges[ranges.length - 1]); 
      }  

    if(window["divdrawerconfig"].currentWidget.type == rangesChartType.grid || this.chartType == rangesChartType.topology){
        let gridRanges = this.arrInput[this.arrInput.length-1] &&  this.arrInput[this.arrInput.length-1]["ranges"]; 
        if(gridRanges !=undefined){
          let ranges: any;
          for(let i=0; i < gridRanges.length; i++){
             ranges = gridRanges;
          }
          window.divdrawerconfig.currentWidget.properties.gridGreaterThanValue = ranges[ranges.length - 1];
          window.divdrawerconfig.currentWidget.properties.gridColorPerRangeGreaterThanValue = ranges[ranges.length - 1];
          window.divdrawerconfig.currentWidget.properties.topologyGreaterThanValue = ranges[ranges.length - 1];

          return ranges[ranges.length - 1];
        }
    }    
  }

  getMapColorFnPlaceholder(rowIndex, colorInput) {
    if (colorInput == "asPerThemeCustomColor") {
      return this.AllData.properties.asPerThemeCustomColor;
    } else if (
      colorInput == "KPIValuesData" &&
      this.AllData.properties["KPIValuesData"] != undefined
    ) {
      if (this.AllData.properties["KPIValuesData"][rowIndex] != undefined) {
        return this.AllData.properties["KPIValuesData"][rowIndex].colors;
      } else return "#000000";
    } else if (
      colorInput == "gisLessThanColor" &&
      this.AllData.properties["gisLessThanColor"] != undefined
    ) {
      if (this.AllData.properties["gisLessThanColor"] != undefined) {
        return this.AllData.properties["gisLessThanColor"];
      } else return "#000000";
    } else if (
      colorInput == "gisGreaterThanColor" &&
      this.AllData.properties["gisGreaterThanColor"] != undefined
    ) {
      if (this.AllData.properties["gisGreaterThanColor"]!= undefined) {
        return this.AllData.properties["gisGreaterThanColor"];
      } else return "#000000";
    } else if (
      colorInput == "KPIShapeValuesData" &&
      this.AllData.properties["KPIShapeValuesData"] != undefined
    ) {
      if (
        this.AllData.properties["KPIShapeValuesData"][rowIndex] != undefined
      ) {
        return this.AllData.properties["KPIShapeValuesData"][rowIndex].colors;
      } else return "#000000";
    } else if (
      colorInput == "KPIStringData" &&
      this.AllData.properties["KPIStringData"] != undefined
    ) {
      if (this.AllData.properties["KPIStringData"][rowIndex] != undefined) {
        return this.AllData.properties["KPIStringData"][rowIndex].colors;
      } else return "#000000";
    } else {
      return "#000000";
    }
  }
  setMapColorFnPlaceholder(color, rowIndex, colorInput) {
    if (colorInput == "asPerThemeCustomColor") {
      this.AllData.properties.asPerThemeCustomColor = color;
    } else {
      if (
        colorInput == "KPIStringData" &&
        this.AllData.properties["KPIStringData"][rowIndex] != undefined
      )
        this.AllData.properties["KPIStringData"][rowIndex].colors = color;
      if (
        colorInput == "KPIValuesData" &&
        this.AllData.properties["KPIValuesData"][rowIndex] != undefined
      ) {
        this.AllData.properties["KPIValuesData"][rowIndex].colors = color;
      }
      if (
        colorInput == "gisLessThanColor" &&
        this.AllData.properties["gisLessThanColor"] != undefined
      ) {
        this.AllData.properties["gisLessThanColor"] = color;
      }
      if (
        colorInput == "gisGreaterThanColor" &&
        this.AllData.properties["gisGreaterThanColor"]!= undefined
      ) {
        this.AllData.properties["gisGreaterThanColor"] = color;
      }
      if (
        colorInput == "KPIShapeValuesData" &&
        this.AllData.properties["KPIShapeValuesData"][rowIndex] != undefined
      ) {
        this.AllData.properties["KPIShapeValuesData"][rowIndex].colors = color;
      }
    }
  }
  setThresholdRangeValue($event) {
    this.AllData.properties.KPIValuesRangeValue = $event.target.id;
    let object = window["divdrawerconfig"].currentWidget;
    if (this.AllData.properties.KPIValuesRangeValue == "R3Ranges") {
      this.AllData.properties.icons = [];
      let defIcons = {
        nodetype: "",
        imageSource: "",
        isPushed: true,
        ranges: [0, 1],
        shape: "Dot"
      };
      const tempObj = JSON.parse(JSON.stringify(defIcons));
      this.AllData.properties.icons.push(tempObj);
      this.inputMapData = this.AllData.properties.icons;
      this.AllData.properties["KPIShapeValuesData"] = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
      object["properties"]["KPIShapeValuesData"] = this.AllData.properties[
        "KPIShapeValuesData"
      ];
      this.arrValueInput = this.AllData.properties["KPIShapeValuesData"];
    } else if (this.AllData.properties.KPIValuesRangeValue == "R3Values") {
      this.AllData.properties["KPIValuesData"] = [];
      this.AllData.properties.KPIValuesData.splice(
        0,
        this.AllData.properties.KPIValuesData.length - 1
      );
      this.AllData.properties["KPIValuesData"] = [
        {
          ranges: [0, 1],
          status: "normal",
          colors: "#000000",
          fontcolors: "#000000",
          shape: "Dot"
        }
      ];
      this.AllData.properties.ranges = "[0,1]";
      object["properties"]["KPIValuesData"] = this.AllData.properties[
        "KPIValuesData"
      ];
      this.arrInput = this.AllData.properties["KPIValuesData"];
      this.AllData.properties["KPIIconRangesData"] = [];
      this.AllData.properties.KPIIconRangesData = [
        {
          ranges: [0, 1],
          imageSource: ""
        }
      ];
      object["properties"]["KPIIconRangesData"] = this.AllData.properties[
        "KPIIconRangesData"
      ];
      //GIS chart Shapes and Icon ranges and it's values reset to default state when clicked on "R3Values" radio button.
      object.properties["lessThanshape"] = "Dot",
      object.properties["greaterThanshape"] = "Dot",
      object.properties["gisGreaterThanShapeValue"] = "1",
      object.properties["gisLessThanColor"] = "#000000",
      object.properties["gisGreaterThanColor"] = "#000000",
      object.properties["gisLessThanicon"]= "",
      object.properties["gisLessThaniconheight"]= "",
      object.properties["gisLessThaniconwidth"]= "",
      object.properties["gisGreaterThanicon"]= "",
      object.properties["gisGreaterThaniconheight"]= "",
      object.properties.ranges = "[0,1]";
      object.properties["gisGreaterThaniconwidth"]= "",
      object.properties["gisGreaterIconsThanValue"]= "1"
    }
  }

  getThresholdRangeValue() {
    if (
      this.AllData.properties.KPIValuesRangeValue === undefined ||
      this.AllData.properties.KPIValuesRangeValue == ""
    )
      this.AllData.properties.KPIValuesRangeValue = "R3Ranges";
    let KPIThresholdRangeValueFlag;
    KPIThresholdRangeValueFlag =
      this.AllData.properties.KPIValuesRangeValue == "R3Ranges" ? true : false;
    return KPIThresholdRangeValueFlag;
  }
  setvalueKpi(rowIndex, inputName, $event) {
    if (inputName == "lessThanshape") {
      this.AllData.properties.lessThanshape =
        $event.target.value;
    }
    if (inputName == "value") {
      this.AllData.properties["KPIShapeValuesData"][rowIndex].value =
        $event.target.value;
    }
    if (inputName == "shape") {
      this.AllData.properties["KPIShapeValuesData"][rowIndex].shape =
        $event.target.value;
    }
    if (inputName == "greaterThanshape") {
      this.AllData.properties.greaterThanshape =
        $event.target.value;
    }
  }
  getvalueKpi(rowIndex, inputName, $event) {
    if (this.AllData.properties["KPIShapeValuesData"][rowIndex] == undefined) {
      this.AllData.properties["KPIShapeValuesData"][
        rowIndex
      ] = this.arrValueInput[rowIndex];
    }

    this.arrValueInput = this.AllData.properties["KPIShapeValuesData"];
    
    if (inputName == "lessThanshape") {
      return this.AllData.properties.lessThanshape;
    }
    if (inputName == "value") {
      return this.AllData.properties["KPIShapeValuesData"][rowIndex].value;
    }
    if (inputName == "shape") {
      return this.AllData.properties["KPIShapeValuesData"][rowIndex].shape;
    }
    if (inputName == "greaterThanshape") {
      return this.AllData.properties.greaterThanshape;
    }
  }

  setFocusForDelete(event, flag, rowIndex, colIndex) {
    if (rowIndex == 0) {
      setTimeout(function() {
        let inputToFocus = document.getElementById("valueName-0");
        let inputofRange = document.getElementById("rangeInput-0");
        let valueKpiInput = document.getElementById("valueKpi-0");
        let addAnotherRange = document.getElementById(
          "addAnotherRange-" + rowIndex
        );
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + (rowIndex + 1)
        );
        if (inputToFocus) {
          inputToFocus.focus();
        }
        if (inputofRange) {
          inputofRange.focus();
        }
        if (valueKpiInput) {
          valueKpiInput.focus();
        }
        if (addAnotherRange) {
          addAnotherRange.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    } else if (rowIndex == this.arrMapInput.length) {
      let rowindval = rowIndex - 1;

      setTimeout(function() {
        let focusColorRange = document.getElementById(
          "colorRangeEnd-" + rowIndex
        );
        let valKpiFocus = document.getElementById("valueKpi-" + rowIndex);
        let addRangeKpi = document.getElementById("addAnotherKpi-" + rowindval);
        let DelrowIcon = document.getElementById("addAnother-" + rowindval);
        let addRangeRange = document.getElementById(
          "addAnotherRange-" + rowindval
        );
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowindval
        );
        let removeAddedRangeR3Shapes = document.getElementById("removeAddedRangeR3Shapes-"+ rowindval)

        if (focusColorRange) {
          focusColorRange.focus();
        }
        if (valKpiFocus) {
          valKpiFocus.focus();
        }
        if (DelrowIcon) {
          DelrowIcon.focus();
        }
        if (addRangeKpi) {
          addRangeKpi.focus();
        }
        if (addRangeRange) {
          addRangeRange.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
        if(removeAddedRangeR3Shapes){
          removeAddedRangeR3Shapes.focus();
        }
      }, 100);
    } else if (rowIndex == this.arrInput.length) {
      let rowindval = rowIndex - 1;
      setTimeout(function() {
        let addAnotherRange = document.getElementById(
          "addAnotherRange-" + rowindval
        );
        let addRangeKpi = document.getElementById("addAnotherKpi-" + rowindval);
        let valueNameForRow = document.getElementById("valueName-" + rowIndex);
        let valueKpi = document.getElementById("valueKpi-" + rowIndex);
        let focusColorRange = document.getElementById(
          "colorRangeEnd-" + rowIndex
        );
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowindval
        );

        if (addAnotherRange) {
          addAnotherRange.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
        if (addRangeKpi) {
          addRangeKpi.focus();
        }
        if (valueNameForRow) {
          valueNameForRow.focus();
        }
        if (valueKpi) {
          valueKpi.focus();
        }
        if (focusColorRange) {
          focusColorRange.focus();
        }
      }, 100);
    } else if (rowIndex == this.arrValueInput.length) {
      let rowindval = rowIndex - 1;
      setTimeout(function() {
        let addAnotherRange = document.getElementById(
          "addAnotherRange-" + rowindval
        );
        let addRangeKpi = document.getElementById("addAnotherKpi-" + rowindval);
        let rangeValue = document.getElementById("valueName-" + rowIndex);
        let focusColorRange = document.getElementById(
          "colorRangeEnd-" + rowIndex
        );
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowindval
        );
         let removeAddedRangeR3Shapes = document.getElementById("removeAddedRangeR3Shapes-"+ rowindval)
        if (addAnotherRange) {
          addAnotherRange.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
        if (addRangeKpi) {
          addRangeKpi.focus();
        }
        if (rangeValue) {
          rangeValue.focus();
        }
        if (focusColorRange) {
          focusColorRange.focus();
        }
        if(removeAddedRangeR3Shapes){
          removeAddedRangeR3Shapes.focus();
        }
      }, 100);
    } else {
      setTimeout(function() {
        let rowindval = rowIndex - 1;
        let addAnotherRange = document.getElementById(
          "addAnotherRange-" + rowindval
        );
        let focusValue = document.getElementById("valueName-" + rowIndex);
        let focusColorRange = document.getElementById(
          "colorRangeEnd-" + rowIndex
        );
        let removeAddedRangeR3Shapes = document.getElementById("removeAddedRangeR3Shapes-"+ rowindval)
        if (addAnotherRange) {
          addAnotherRange.focus();
        }
        let valKpiFocus = document.getElementById("valueKpi-" + rowIndex);
        if (focusValue) {
          focusValue.focus();
        }
        if (focusColorRange) {
          focusColorRange.focus();
        }
        if (valKpiFocus) {
          valKpiFocus.focus();
        }
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowindval
        );
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
        if(removeAddedRangeR3Shapes){
          removeAddedRangeR3Shapes.focus();
        }
      }, 100);
    }
  }
  setFocusForAddAnother(event, flag, rowIndex, colIndex) {
    let rowToshow = rowIndex + 1;
    setTimeout(function() {
      let valtoFocus = document.getElementById("valueName-" + rowToshow);
      let valKpiFocus = document.getElementById("valueKpi-" + rowToshow);
      let colorrange = document.getElementById("colorRangeEnd-" + rowToshow);
      let rangeEnd = document.getElementById("rangeEnd-" + rowToshow + "-" + colIndex);
      let colorrangeforBg = document.getElementById("colorRangeEnd-" + rowToshow + "-" + colIndex);

      if (valKpiFocus) {
        valKpiFocus.focus();
      }
      if (valtoFocus) {
        valtoFocus.focus();
      }
      if (colorrange) {
        colorrange.focus();
      }
      if (rangeEnd) {
        rangeEnd.focus();
      }
      if(colorrangeforBg){
        colorrangeforBg.focus()
      }
    }, 100);
  }
  setFocusDelete(event, flag, rowIndex) {
    let rowValue = rowIndex - 1;
    if (rowIndex == this.arrInput.length) {
      setTimeout(function() {
        let addanother = document.getElementById(
          "addAnotherTreeMap-" + rowValue
        );
        if (addanother) {
          addanother.focus();
        }
      }, 100);
    }
  }

  setFocusDeleteForComplexGuage(event, flag, rowIndex, colIndex) {
    if (rowIndex == 0) {
      setTimeout(function() {
        let addanother = document.getElementById(
          "gauge-add-range1-" + rowIndex
        );
        let removeAddedRange = document.getElementById(
          "innerAddButton-" + (rowIndex + 1)
        );
        if (addanother) {
          addanother.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    }
    let rowValue = rowIndex - 1;
    setTimeout(function() {
      let addanother = document.getElementById("gauge-add-range1-" + rowValue);
      let removeAddedRange = document.getElementById(
        "innerAddButton-" + rowValue
      );
      if (addanother) {
        addanother.focus();
      }
      if (removeAddedRange) {
        removeAddedRange.focus();
      }
    }, 100);
  }
  inputNumberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  setDefaultcalendarHeatmapColor($event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l].classList.add("hide");
    }
    this.arrInput = [];
    let defRanges = {
      ranges: [0, 1],
      colors: "#000000",
      fontcolors: "#000000",
      backgroundcolors: "#9dc3e6",
      textPlaceholder: "Range Name"
    };
    const tempObj = JSON.parse(JSON.stringify(defRanges));
    this.arrInput[0] = tempObj;
    //Set properties from other sections to default
    object["properties"]["colorOption"] = "1";
    this.resetCalHeatmapToDefaultView();
    object["properties"]["calendarMinHeat"] = "#bc5959";
    object["properties"]["calendarMaxHeat"] = "#4caf50";
    window.inputStream.next(["refreshColorPicker"]);
  } 
  setCalendarHeatmapRangeColors(id, $event) {
    let object = window["divdrawerconfig"].currentWidget;
    //Hide other sections
    let elementsArray = document.querySelectorAll(".prop");
    for (let l = 0; l < elementsArray.length; l++) {
      if (
        elementsArray[l].previousElementSibling.querySelector("input").id == id
      )
        elementsArray[l].classList.remove("hide");
      else elementsArray[l].classList.add("hide");
    }
    if (id == "staticColorRange") {
      object["properties"]["colorOption"] = "2";
      object["properties"]["calendarMinHeat"] = "#bc5959";
      object["properties"]["calendarMaxHeat"] = "#4caf50";
      window.inputStream.next(["refreshColorPicker"]);
    }
    if (id == "customLinearRange") {
      this.arrInput = [];
      let defRanges = {
        ranges: [0, 1],
        colors: "#000000",
        fontcolors: "#000000",
        backgroundcolors: "#9dc3e6",
        textPlaceholder: "Range Name"
      };

      object["properties"]["colorOption"] = "3";
      this.resetCalHeatmapToDefaultView();
      window.inputStream.next(["refreshColorPicker"]);
    }
  }
  getLowColorCalendarHeatmapBg(calendarHeatmapLessThanBgColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapLessThanBgColor
    ];
  }
  setLowColorCalendarHeatmapBg(calendarHeatmapLessThanBgColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapLessThanBgColor
    ] = $event;
  }
  getHighColorcalendarHeatmapBg(calendarHeatmapGreaterThanBgColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapGreaterThanBgColor
    ];
  }
  setHighColorCalendarHeatmapBg(calendarHeatmapGreaterThanBgColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapGreaterThanBgColor
    ] = $event;
  }
  setCalendarHeatmapProperties(prop, $event) {
    let value;
    if ($event.target.checked !== false) value = "true";
    else value = "false";
    if (prop == "showLegendRangeForCalendarHeatmap") {
      window["divdrawerconfig"].currentWidget["showLegendRangeForCalendarHeatmap"] = value;
    }
  }
  getCalendarHeatmapProperties(prop) {
    let value;
    if (prop == "showLegendRangeForCalendarHeatmap") {
      value = window["divdrawerconfig"].currentWidget["showLegendRangeForCalendarHeatmap"];
    }
    if (value == "true") return true;
    else return false;
  }
  resetCalHeatmapToDefaultView(){
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["ranges"] = "[0,1]";
    object["properties"]["backgroundcolors"] = "['#9dc3e6']";
    object["properties"]["colors"] = "['#000000']";
    object["properties"]["calendarHeatmapLessThanBgColor"] = "#9dc3e6";
    object["properties"]["calendarHeatmapGreaterThanBgColor"] = "#9dc3e6"; 
    object["properties"]["calendarHeatmapLessThanTextColor"] = "#000000";
    object["properties"]["calendarHeatmapGreaterThanTextColor"] = "#000000";
    object["properties"]["calendarHeatmapGreaterThanValue"] = "1";
    object["showLegendRangeForCalendarHeatmap"] = "true";
  }
  getMinMaxHeatCalendarHeatmap(heat) {
    return window["divdrawerconfig"].currentWidget["properties"][heat];
  }
  setMinMaxHeatCalendarHeatmap(heat, $event) {
    window["divdrawerconfig"].currentWidget["properties"][heat] = $event;
  }
  setLowColorCalendarHeatmapText(calendarHeatmapLessThanTextColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapLessThanTextColor
    ] = $event;
  }
  
  getLowColorCalendarHeatmapText(calendarHeatmapLessThanTextColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapLessThanTextColor
    ];
  }
  getHighColorCalendarHeatmapText(calendarHeatmapGreaterThanTextColor) {
    return window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapGreaterThanTextColor
    ];
  }
  setHighColorCalendarHeatmapText(calendarHeatmapGreaterThanTextColor, $event) {
    window["divdrawerconfig"].currentWidget["properties"][
      calendarHeatmapGreaterThanTextColor
    ] = $event;
  }
  setfocusForDeleteRangeCalendarHeatmap(event, flag, rowIndex, colIndex){
      let object = window["divdrawerconfig"].currentWidget;
      let rangesCal = JSON.parse(object.properties.ranges);
      if (rowIndex == 0) {
        setTimeout(function() {
        let removeAddedRangeCalendarHeatmap = document.getElementById("removeAddedRangeCalendarHeatmap-0");
        let addAnotherRangeCalendarHeatmap = document.getElementById("addAnotherRangeCalendarHeatmap-0");
        if(removeAddedRangeCalendarHeatmap){
          removeAddedRangeCalendarHeatmap.focus();
        }
        if(addAnotherRangeCalendarHeatmap){
          addAnotherRangeCalendarHeatmap.focus();
        }
      }, 100);
      }else if(rowIndex < rangesCal.length-1){
        setTimeout(function() {
        let rowValueInbetween = rowIndex-1;
        let deleteRangeCalendar = document.getElementById(
        "removeAddedRangeCalendarHeatmap-" + rowValueInbetween
      );
      if(deleteRangeCalendar){
        deleteRangeCalendar.focus();
      }
    }, 100);
      }
      else {
        let rowindval = rowIndex - 1;
        setTimeout(function() {
        let addAnotherRangeCalendarHeatmap1 = document.getElementById("addAnotherRangeCalendarHeatmap-"+ (rowindval));
        if(addAnotherRangeCalendarHeatmap1){
          addAnotherRangeCalendarHeatmap1.focus();
        }
      }, 100);
      }
    }
  setFocusDeleteForGrid(event, flag, rowIndex, colIndex) {
    if (rowIndex == 0) {
      setTimeout(function() {
        let addanother = document.getElementById(
          "gauge-add-range1-" + rowIndex
        );
        let previousAddAnotherIcon = document.getElementById("addAnotherRange-" + rowIndex);  
        if (addanother) {
          addanother.focus();
        }
        if(previousAddAnotherIcon){
          previousAddAnotherIcon.focus();
        }
      }, 100);
    }else if (rowIndex < this.arrInput.length){
      let previousRowValue = rowIndex - 1;
      setTimeout(function() {
      let PreviousRowDeleteIcon = document.getElementById(
        "innerAddButton-" + previousRowValue);
        if(PreviousRowDeleteIcon){
          PreviousRowDeleteIcon.focus();
        }
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + (rowIndex + 1)
        );
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    }
    else if (rowIndex == this.arrInput.length){
      setTimeout(function() {
      let previousAddAnother = document.getElementById("gauge-add-range1-" + (rowIndex - 1));
      let previousAddAnotherIcon = document.getElementById("addAnotherRange-" + (rowIndex - 1));  
      if(previousAddAnother){
          previousAddAnother.focus();
    }
    if(previousAddAnotherIcon){
      previousAddAnotherIcon.focus();
    }
    }, 100);
    }
  }
  radioNameStatus(radioName) {
    let nameofRadioButton = radioName;
    let radioname;
    switch (nameofRadioButton) {
      case "width":
        radioname = "columnWidth";
        break;
      case "prop":
        radioname = "propOption";
        break;
      case "precision":
        radioname = "precisionOption";
        break;
    }
    return radioname;
  }
  radiostate(id, radioName, value, index, isDefaultChecked){
       let radiButtonName = this.radioNameStatus(radioName);
      if(window["divdrawerconfig"].currentWidget["columns"][index][radiButtonName] + index == id){
        return true
      }else{
        return false
      }
  }
  setRadioState(id, radioName, value, $event, index){
    let widgetData = window["divdrawerconfig"].currentWidget;
    if(window["divdrawerconfig"].currentWidget.type == rangesChartType.grid){
      if(radioName == "prop"){
          widgetData["columns"][index]["propOption"] = id;
      }
    }
  }
  removeElement(arrayName,arrayElement)
  {
  // We are not considering 0th index position if user enter 0 in first row in range
  arrayName = JSON.parse("[" + arrayName + "]");  
  
  for(var i = 1; i < arrayName.length; i++ )
    {
      if(arrayName[i] == arrayElement){
        arrayName.splice(i,1);
        this.AllData.columns[i].ranges = arrayName.toString();
      }      
    }
    return arrayName.toString();
  }
}
