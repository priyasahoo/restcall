import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Input,AfterViewChecked,
  ChangeDetectorRef
} from "@angular/core";
import { ChartPropertiesService } from "../services/chartPropertiesForm.service";
import "rxjs/add/operator/toPromise";
import "rxjs/Rx";
import { ColorPickerModule } from "ngx-color-picker";
import { EmitterChanelBusService } from "../services/emitterChanelBus.service";
import { ColorPickerComponent } from "../ColorPicker/color-picker.component";
import { ColorFormats } from "common-enums";
import * as $ from "jquery";
import * as moment from "moment-timezone";
import {
  _DATE_TIME_FORMATS,
  _DEFAULT_LANG_CODE,_DATE_CONFIG
} from "../../../JSON/date-time-config/date-time-formats";
import { ChartTypes } from 'common-enums';
import { rangesChartType } from './custom/ranges.component';
import { DatasourceService } from "../services/datasource.service";

export enum StandardColors {
      Custom ='custom',
      Standard = 'standard',
      Dashboardtheme = 'as-per-theme',
      UserDefined = 'user-defined',
      Alerts = 'Alerts',
      Tnpm1 = 'tnpm1',
      Tnpm2 = 'tnpm2'
  }
  export enum ActionType {
    UP = "up",
    DOWN = "down"
  }

  export enum DataTypes {
    DECIMAL ='decimal',
    LONG = 'long',
    INTEGER = 'int',
    NUMERIC = 'numeric',
    NUMBER = 'number',
    PERCENTAGE = 'percentage',
    ISODATETIME = 'isodatetime',
    DATE = 'date',
    TIMESTAMP = 'timestamp',
    STRING = 'string'
}
@Component({
  selector: "chart-properties",
  templateUrl:
  "./chartPropertiesForm.template.html",
  styleUrls: [
    "./chartPropertiesForm.css"
  ]
})
export class ChartPropertiesForm implements OnInit, AfterViewChecked, OnDestroy {
  private Tooldata: Array<any> = [];
  private AllData;
  private widgetID;
  public AllColors = [];
  public setIconFocus: boolean = true;
  private recentFiveCustomColors = [];
  public ColorRangedataForMonochromatic = [];
  private isCustomColorPickerClicked: Boolean = false;
  private isCustomColorClicked: Boolean = false;
  private isDefaultColorClicked: Boolean = true;

  private datastoreName;
  public mapToBePlotData: any;
  public mapToBePlotDataKeys: any;
  public mapToBePlotValue: any;
  public mapToBePlotDataFlag: Boolean = false;
  public options = {}; 
  public seriesOptions: Array<any> = [[]];
  public defaultOption = ''; 
  private title: string = "Welcome word";
  private content: string =
    "Vivamus sagittis lacus vel augue laoreet rutrum faucibus.";
  private color: string = "#ffffff";
  private columnListData: Array<any> = [];
  private plotListData: Array<any> = [];
  private axesListData: Array<any> = [];
  currentWidgets: any;
  @Input() private isDefaultChecked: any;

  private storeListData: Array<any> = [];
  private visibilityStack: any = {};
  private locale = {};
  private show = true;
  private arrRanges = [[0, 0]];
  private arrStatus = [["default"]];
  private arrInputRow = [];
  private chkArray = [];
  private columnArray = [];
  private strArray = [];
  private isUser = false;
  private sourceType;
  private showValue;
  private isDefaultYaxis = 0;
  private isDefaultYaxis2 = 0;
  private TextAreaplaceholders = [];
  private disableSeriesTypeTab = false;
  dbStores: any;
  private callFunction: Function;
  private arrSubscription: Array<any> = [];
  private emitterChannel: EventEmitter<any>;

  private levelOneRadBtnValue: any;
  private levelTwoRadBtnValue: any;
  private levelThreeRadBtnValue: any;

  public StandardcolorLeft = [];
  public StandardcolorRight = [];
  public tnpm1Colors = [];
  public tnpm2Colors = [];  
  private userDefinedColors: [];  
  public RecentlyDefinedColors = [];

  public defineOtherCustomColors = ["#000000"];
  public arrColorInput: Array<any> = [];

  public isGrid = false;
  public isGridBadge = false;
  private colorFormat: ColorFormats = ColorFormats.hex;
  private defaultDateSampleDropdown: any;

  public layoutJSON =
    window.appnamespace.tabregister[window.appnamespace.currentkey].datapacket
      .layoutJSON;
  private isJSONTemplateLoaded:boolean = false;

  private isTransformationFlag:boolean = false;
  public isFormDataContains : boolean = false;
  private isJSONTemplateDropDown:boolean = false;
  private strJSONTemplateDropDown = '';
  private isDropDownVisible = 'show';
  private arrBoolDropDownVisible = [];

  public dataTypeEnum = [
    {
      "value": "string",
      "name": "string"
    },

    {
      "value": "number",
      "name": "numeric"
    },

    {
      "value": "date",
      "name": "date"
    },

    {
      "value": "time",
      "name": "time"
    },

    {
      "value": "Boolean",
      "name": "Boolean"
    }
  ];

  constructor(
    private _ChartPropertiesService: ChartPropertiesService,
    private emitterService: EmitterChanelBusService,
    private datasourceService: DatasourceService,
    private cdr: ChangeDetectorRef
  ) {
    if (window["divdrawerconfig"].currentWidget.type !== "ComplexGauge") {
      this.arrColorInput = [
        {
          bgColor: "",
          borderColor: "",
          labelColor: ""
        }
      ];
    }
    
    this.defaultDateSampleDropdown = new Date(2001, 0, 14, 14, 15, 32, 630);
    moment.locale(navigator.language || (<any>navigator).userLanguage || _DEFAULT_LANG_CODE);
  }

  public optionsArray = window["divdrawerconfig"].currentWidget.hasOwnProperty("transformations") ? window["divdrawerconfig"].currentWidget.transformations : [];

  ngOnInit() {
    var self = this;
    this.emitterChannel = this.emitterService.getBroadcastChannel(
      "RANGES_STATUS"
    );
    this.locale = this._ChartPropertiesService.locale;
    this.subscribeEmitters();
    this.showHideOnInit();
    this.setVAxisDropdownList();
    this.setPlotDropdownList();
    this.getAxesList();
    setTimeout(() => {
      this.setPlaceholders();
    }, 1000);
    // Added ShowGridline Default Property for applicable chart. 
    let chartType = window["divdrawerconfig"].currentWidget.type;
    switch (chartType) {
      case "Line":  
      case "Area":
      case "Bar":
      case "Column":
      case "Bubble":
      case "Scatter": 
      case "QuadrantMotion":
        this.setDefaultGridlineProperty()
        break;
      case "RangeColumn":
        this.setDefaultXGridlineProperty()
        break;
      default:
        break;
    }

    // Added currentWidgets property for data point limit functionality
    this.currentWidgets = window["divdrawerconfig"].currentWidget;

    if (window["divdrawerconfig"].currentWidget.type !== rangesChartType.grid) {
    if (window["divdrawerconfig"].currentWidget.checkedRadios == undefined) {
      window["divdrawerconfig"].currentWidget["checkedRadios"] = [];
    }
  }
    this.buildCheckedRadiosArray();

    if (window["divdrawerconfig"].currentWidget.type == "Badge") {
      this.setBadgeProperties();
    }

    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      this.isGrid = true;
      if(window["divdrawerconfig"].currentWidget["chkArray"] !== undefined){
        delete window["divdrawerconfig"].currentWidget["chkArray"]
      }
    }

    if (window["divdrawerconfig"].currentWidget.datasource == "default") {
      if (window["divdrawerconfig"].currentWidget.type !== "Bar") {
        if (
          window["divdrawerconfig"].currentWidget.axes !== undefined &&
          window["divdrawerconfig"].currentWidget.series !== undefined
        ) {
          window["divdrawerconfig"].currentWidget.axes[0].labelSeries =
            window["divdrawerconfig"].currentWidget.series[0].name;
        }
      } else {
        if (
          window["divdrawerconfig"].currentWidget.axes !== undefined &&
          window["divdrawerconfig"].currentWidget.series !== undefined
        ) {
          window["divdrawerconfig"].currentWidget.axes[1].labelSeries =
            window["divdrawerconfig"].currentWidget.series[0].name;
        }
      }
    }
    this.AllData = window["divdrawerconfig"].currentWidget;    
    this._ChartPropertiesService.getToolBar().subscribe(ToolData => {
      for (let i = 0; i < ToolData.length; i++) {
        this.Tooldata.push(ToolData[i]);
      }
    });

    this._ChartPropertiesService
      .getGisAvailableOptions()
      .subscribe(gisOptionsData => {
        // Stored newly added js file data { key : value }, { bel+gium : belgium}
        this.mapToBePlotData = gisOptionsData;

        // Get already selected map value
        if(this.AllData.properties != undefined){
          this.mapToBePlotValue = this.AllData.properties.mapToBePlotted;
        }

        // Get all data keys for array iteration in html file
        this.mapToBePlotDataKeys = Object.keys(this.mapToBePlotData);

        // sort the api gis data
        // sort if file name is small and capital letters
        this.mapToBePlotDataKeys.sort(function(key, nextkey) {
          key = key.toLowerCase();
          nextkey = nextkey.toLowerCase();
          if (key == nextkey) return 0;
          if (key > nextkey) return 1;
          return -1;
        });

        // Set flag as true when we got the more than one record
        if (this.mapToBePlotDataKeys.length > 0 && this.AllData.type == 'Map') {
          this.mapToBePlotDataFlag = true;
        }
      });

    window["appnamespace"].DBAPI.getRecentFiveCustomColors().then(function(
      recentFiveCustomColors
    ) {
      self.recentFiveCustomColors = recentFiveCustomColors;
      // this.RecentlyDefinedColors = recentFiveCustomColors;
    });

    window["appnamespace"].DBAPI.fetchColorRangesFromOED().then(function(
      AllColors
    ) {
      self.AllColors = AllColors;
      self.getStandardLeftColors();
      self.getStandardRightColors();
      self.decideStateOfColorSelectionRadioButtons();
      self.getTnpmColors();
      self.getRecentlyDefinedColors();
    });

    // added condition as it was affecting chart properties ..defect fix 68788
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
      if (!window["divdrawerconfig"].currentWidget.columns[0]["id"]) {
        window["divdrawerconfig"].currentWidget.columns[0]["id"] = window[
          "generateUniqueID"
        ]();
      }
    }

    let dynamicvalue = window["divdrawerconfig"].currentWidget.datasource;
    if (dynamicvalue === "default") {
      this.sourceType = "default";
    } else {
      this.sourceType = "connector";
    }

    this.locale = this._ChartPropertiesService.locale;
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.map) {
          let currentDashStoreQuery = [];
          let currentwidStore;
          let listenerQueryIndex = 0;
          let currentWidgetId = window["divdrawerconfig"].currentWidget.id;
          // var currenttab =
          // window.appnamespace.tabregister[window.appnamespace.currentkey];
          let currentTab = window.appnamespace.tabregister[window.appnamespace.currentkey];
          currentDashStoreQuery =currentTab.datapacket.layoutJSON.stores;
          var layoutjson = currentTab.datapacket.layoutJSON;
          let widgetIds =[];
          if(currentDashStoreQuery){
            let requiredIndex;
            for(let i=0; i<layoutjson.widgets.length; i++){
              widgetIds.push(layoutjson.widgets[i].id)
              if(widgetIds[i] == currentWidgetId)
              requiredIndex = i;
            }
            if(requiredIndex !== undefined){
            if(currentDashStoreQuery.length>0){
              currentwidStore = currentDashStoreQuery[requiredIndex]; 
              listenerQueryIndex = currentwidStore.query.indexOf('where');

              // find is where clause is in sql or not
              let findWhereFromCurrentQuery = currentwidStore.query;
              findWhereFromCurrentQuery = findWhereFromCurrentQuery.toLowerCase();
              listenerQueryIndex = findWhereFromCurrentQuery.indexOf('where');
            } 
              // if we found then return the position and if it is gretter than zero then we set flag
              // we use this flag to identify is that widget listener ot not.
              // it is required for when we take the multiple widgets as drill down dashboard
              if(listenerQueryIndex > 0){ 
                window["divdrawerconfig"].currentWidget.waitForMaster = "true";
              } else{
                window["divdrawerconfig"].currentWidget.waitForMaster = "false";
              }
            }
          }
          let polygonUnitPosition = window["divdrawerconfig"].currentWidget.properties.KPIs;   
          if(!("polygonTooltip_unitPosition" in polygonUnitPosition)) {
            window["divdrawerconfig"].currentWidget.properties.KPIs["polygonTooltip_unitPosition"] = "Suffix";
          }

          if (
            this.AllData &&
            this.AllData.properties &&
            this.AllData.properties.mapBackgroundColors == undefined
          ) {
            let object = window["divdrawerconfig"].currentWidget;
            object["properties"]["colorsRadio"] = "AsPerThemeColors";
            this.arrColorInput = [];
            this.AllData.properties.mapBackgroundColors = [];
            let mapBackColors = {
              bgColor: "",
              borderColor: "",
              labelColor: ""
            };
            const tempObj = JSON.parse(JSON.stringify(mapBackColors));
            this.arrColorInput.push(tempObj);
            this.arrColorInput =
              this.arrColorInput == undefined
                ? this.AllData.properties.mapBackgroundColors
                : this.arrColorInput;
            this.arrColorInput = this.AllData.properties.mapBackgroundColors;
          } else {
            this.arrColorInput = this.AllData.properties.mapBackgroundColors;
          }
        } 
    this.colorPickerCSS(300);
    setTimeout(() => {
      this.checkIsepochForNPI();
    }, 300);
    if( window["divdrawerconfig"].currentWidget.hasOwnProperty('transformations') && window["divdrawerconfig"].currentWidget.transformations.length > 0 ) {
      this.isTransformationFlag = true;
      this.dataStoreService();      
    } else {
      this.isTransformationFlag = false;
      this.hideTransformationFields();
    }

  }

  ngAfterViewChecked(){
    if(!this.isJSONTemplateLoaded){
      this.setDateTimeFormatPicker();
      this.retainValueOfIconPositionHorizontalVerticalAlignment();
    }
    this.cdr.detectChanges();
  }
  // Added ShowGridline Default Property for both X and Y axis.
	setDefaultXGridlineProperty() {
    let xGridlineVal = window["divdrawerconfig"].currentWidget.properties.gridlines;
    if(xGridlineVal == undefined) {
      window["divdrawerconfig"].currentWidget.properties["gridlines"] = "true";
        }
  }
  setDefaultGridlineProperty() {
    let axesArr = window["divdrawerconfig"].currentWidget.axes;
    for (let i = 0; i < axesArr.length; i++) {
      if(axesArr[i].gridlines == undefined) {
        axesArr[i]["gridlines"] = "true";
      } 
    }
  }
  
  /**
   * @description This function is render the html options to the date time format sample dropdown
   * and on reopening of chart propeties will attached the last saved value to it.
   */

  setDateTimeFormatPicker() {
    let series = [],
    isValidChart = true,
    classNameAndKeyName = "labelFormat";

    let labelsAvailable = $("." + classNameAndKeyName);
    if(labelsAvailable.length > 0){
      this.isJSONTemplateLoaded = true;
    } else {
      return;
    }
    let widgets = this.currentWidgets;
    let widgetId = window.divdrawerconfig.currentWidget.id;
    let chartsValidForDateTime = [
      "Area",
      "Line",
      "Baseline",
      "Grid",
      "Bar",
      "Column"
    ];

    if (
      widgets.id == widgetId &&
      chartsValidForDateTime.indexOf(widgets.type) != -1
    ) {
      if (widgets.type == chartsValidForDateTime[2]) {
        series = widgets["properties"];
      } else {
        series = widgets["series"] || widgets["columns"]; // columns for grid and series for all other charts except baseline
      }
      isValidChart = false;
    }
    if (isValidChart) {
      return;
    }

    for (let index = 0; index < labelsAvailable.length; index++) {
      var labelFormat = $("." + classNameAndKeyName)[index];
      let selectElement = $(labelFormat).find("select");
      let jQSelectEle = $(selectElement);
      if (jQSelectEle.find("option[value!='']").length != 0) {
        continue;
      }
      let seriesElement = series[index];
      let formatValue =
        series[classNameAndKeyName] ||
        (seriesElement &&
          (seriesElement[classNameAndKeyName] || seriesElement["labelformat"]));
      let labelType =
        series["labeltype"] || (seriesElement && seriesElement["labeltype"]);

      this.appendHTMLtoDateDropDown(
        selectElement,
        _DATE_TIME_FORMATS.DATE,
        "DATE"
      );
      this.addSeperatorDateDropDown(
        selectElement,
        "-------------------------------------------"
      );

      this.appendHTMLtoDateDropDown(
        selectElement,
        _DATE_TIME_FORMATS.TIME,
        "TIME"
      );
      this.addSeperatorDateDropDown(
        selectElement,
        "-------------------------------------------"
      );

      this.appendHTMLtoDateDropDown(
        selectElement,
        _DATE_TIME_FORMATS.DATE_AND_TIME,
        "DATE_AND_TIME"
      );

      if (labelType 
        && 
        ((seriesElement && seriesElement.isepoch && seriesElement.isepoch != "false")
        || (this.currentWidgets.type == chartsValidForDateTime[2] 
            || this.currentWidgets.type == chartsValidForDateTime[3])
        )) 
      {
        this.changeType("", "", "", labelType, selectElement);
      }
      if (formatValue) {
        jQSelectEle.val(formatValue);
        if (!jQSelectEle.val()) {
          let newValue = jQSelectEle.find("option[data-upgradevalue='" + formatValue + "']").val();
          if (this.currentWidgets.type == "Baseline") {
            this.currentWidgets.properties.labelFormat = newValue;
          } else if (this.currentWidgets.series) {
            this.currentWidgets.series[index].labelFormat = newValue;
          } else if (this.currentWidgets.columns) {
            this.currentWidgets.columns[index].labelformat = newValue;
          }
          jQSelectEle.val(newValue);
          // for upgrade case handling for lyra into gemini
          let selectedLabelType = jQSelectEle.find("option[value='" + newValue + "']");
          if (selectedLabelType.css('display') == "none") {
            let category = selectedLabelType.attr("data-category");
            if (category == "DATE_AND_TIME") {
              $("#labeltype" + index).val("date and time");
              labelType = "date and time";
            } else {
              $("#labeltype" + index).val(category.toLowerCase());
              labelType = category.toLowerCase();
            }
            if (labelType) {
              this.changeType("", "", "", labelType, selectElement);
            }
            jQSelectEle.val(newValue);
            if (this.currentWidgets.type == "Baseline") {
              this.currentWidgets.properties.labeltype = labelType;
            } else if (this.currentWidgets.series) {
              this.currentWidgets.series[index].labeltype = labelType;
            } else if (this.currentWidgets.columns) {
              this.currentWidgets.columns[index].labeltype = labelType;
            }
          }
        }
      } else {
        jQSelectEle.val("");
      }
    }
  }

  /**
   * @param selectElement :is the DOM element where options are generated
   * @param jsonData JSON defined in date-time=formats.js which has date time
   * and Date and time formats stored
   */
  appendHTMLtoDateDropDown(
    selectElement: HTMLElement,
    jsonData: any[],
    category: string
  ) {
    jsonData.forEach((item, i) => {
      var value = item.value;
      selectElement.append($('<option>', {
        value: value,
        text: moment(this.defaultDateSampleDropdown).format(value),
        "data-category": category,
        "data-upgradeValue": item.upgradeValue
      }));
    });
  }

  /**
   * @description : this method is for separation for dropdown with specified value
   * @param selectElement :is the DOM element where options are generated
   * @param value : value to show in option on UI
   */
  addSeperatorDateDropDown(selectElement: HTMLElement, value: string) {
    selectElement.append(
      $("<option>", {
        value: value,
        text: value,
        disabled: "disabled"
      })
    );
  }

  checkIsepochForNPI() {
    if (
      window.widget.getWidgetStores(window["divdrawerconfig"].currentWidget)
    ) {
      const storeArr = window.widget.getWidgetStoresData(
        window.widget.getWidgetStores(window["divdrawerconfig"].currentWidget)
      );
      storeArr.forEach(stores => {
        if (!stores.hasOwnProperty("__form_data__")) {
          return;
        }
        if (
          stores.__form_data__.connectorType.selectedValues[0].component ==
          "npi"
        ) {
          let isEpochElement = document.querySelectorAll(
            "input[name='isepoch']"
          );
          isEpochElement.forEach((elm: HTMLInputElement) => {
            elm.checked = true;
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.unSubscribeEmmitters();
  }

  colorPickerCSS(delay: number = 0) {
    if (delay == 0) {
      let ele = $("chart-properties .html-color-picker-normal-size");
      if (ele.length > 0) {
        ele.css({
          width: "20px",
          height: "20px"
        });
      }
    } else {
      setTimeout(() => {
        let ele = $("chart-properties .html-color-picker-normal-size");
        if (ele.length > 0) {
          ele.css({
            width: "20px",
            height: "20px"
          });
        }
      }, delay);
    }
  }

  subscribeEmitters() {
    this.arrSubscription["RANGE_STATUS"] = this.emitterChannel.subscribe(
      message => {
        if (message.ACTION === "UPDATE_RANGES_STATUS") {
          if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
            this.AllData.columns[message.VALUE.columnIndex]["ranges"] =
              message.VALUE.params.ranges;
            let j;
            for (
              j = 0;
              j < window["divdrawerconfig"].currentWidget.columns.length;
              j++
            ) {
              
            }
              if (
                window["divdrawerconfig"].currentWidget.columns[message.VALUE.columnIndex].propOption + message.VALUE.columnIndex ==
                "icons" + message.VALUE.columnIndex
              ) {
                if (
                  message.VALUE.params.status !== undefined &&
                  message.VALUE.params.status !== "" || 
                  message.VALUE.params.gridDropDownLessThanStatus !== undefined &&
                  message.VALUE.params.gridDropDownLessThanStatus !== "" ||
                  message.VALUE.params.gridDropDownGreaterThanStatus !== undefined &&
                  message.VALUE.params.gridDropDownGreaterThanStatus !== ""
                ) {
                  this.AllData.columns[message.VALUE.columnIndex]["status"] =
                    message.VALUE.params.status;
                  this.AllData.columns[message.VALUE.columnIndex]["gridDropDownLessThanStatus"] =
                    message.VALUE.params.gridDropDownLessThanStatus;
                  this.AllData.columns[message.VALUE.columnIndex]["gridDropDownGreaterThanStatus"] =
                    message.VALUE.params.gridDropDownGreaterThanStatus;
                }
              }
              if (
                window["divdrawerconfig"].currentWidget.columns[message.VALUE.columnIndex].propOption + message.VALUE.columnIndex ==
                "colors" + message.VALUE.columnIndex
              ) {
                this.AllData.columns[message.VALUE.columnIndex]["colors"] =
                  message.VALUE.params.colors;
                this.AllData.columns[message.VALUE.columnIndex]["fontcolors"] =
                  message.VALUE.params.fontcolors;
                this.AllData.columns[message.VALUE.columnIndex]["gridLessThancolors"] =
                  message.VALUE.params.gridLessThancolors;
                this.AllData.columns[message.VALUE.columnIndex]["gridLessThanfontcolors"] =
                  message.VALUE.params.gridLessThanfontcolors;
                this.AllData.columns[message.VALUE.columnIndex]["gridGreaterThancolors"] =
                  message.VALUE.params.gridGreaterThancolors;
                this.AllData.columns[message.VALUE.columnIndex]["gridGreaterThanfontcolors"] =
                  message.VALUE.params.gridGreaterThanfontcolors;
              }
            // }
          } else if (message.ACTION === "UPDATE_ALERT_RANGE") {
            this.AllData.properties.Cascaderange.thresholdRange =
              "[" + message.VALUE.Cascaderange.thresholdRange.join(",") + "]";
            this.AllData.properties.Cascaderange.thresholdColor =
              message.VALUE.Cascaderange.thresholdColor;
          } else {
            if (message.VALUE.params.ranges[0] !== "[") {
              this.AllData.properties["ranges"] =
                "[" + message.VALUE.params.ranges;
              if (
                message.VALUE.params.ranges[
                  message.VALUE.params.ranges.length - 1
                ] !== "]"
              )
                this.AllData.properties["ranges"] =
                  this.AllData.properties["ranges"] + "]";
              this.AllData.properties["thickness"] =
                "[" + message.VALUE.params.thickness;
              this.AllData.properties["topologyLessThanThickness"] =
                message.VALUE.params.topologyLessThanThickness;
              this.AllData.properties["topologyGreaterThanThickness"] =
                message.VALUE.params.topologyGreaterThanThickness;
              if (
                message.VALUE.params.thickness[
                  message.VALUE.params.thickness.length - 1
                ] !== "]"
              )
                this.AllData.properties["thickness"] =
                  this.AllData.properties["thickness"] + "]";

              this.AllData.properties["colors"] =
                "[" + message.VALUE.params.colors;
              if (
                message.VALUE.params.colors[
                  message.VALUE.params.colors.length - 1
                ] !== "]"
              )
                this.AllData.properties["colors"] =
                  this.AllData.properties["colors"] + "]";
            } else {
              this.AllData.properties["ranges"] =
                message.VALUE.params.ranges + "]";
            }
          }

          // this.AllData.columns[ message.VALUE.columnIndex ]['colors'] = message.VALUE.params.colors;
        } else {
          if (message.ACTION === "UPDATE_RANGES_COLORS") {
            if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
              this.AllData.columns[message.VALUE.columnIndex]["ranges"] =
                message.VALUE.params.ranges;
              this.AllData.columns[message.VALUE.columnIndex]["colors"] =
                message.VALUE.params.colors;
              this.AllData.columns[message.VALUE.columnIndex]["fontcolors"] =
                message.VALUE.params.fontcolors;
            } else if (
              window["divdrawerconfig"].currentWidget.type === "Topology"
            ) {
              this.AllData.properties["thickness"] =
                "[" + message.VALUE.params.thickness + "]";
              this.AllData.properties["topologyLessThanThickness"] =
                message.VALUE.params.topologyLessThanThickness;
              this.AllData.properties["topologyGreaterThanThickness"] =
                message.VALUE.params.topologyGreaterThanThickness;
              this.AllData.properties["colors"] =
                "[" + message.VALUE.params.colors + "]";
            } else {
              if (message.VALUE.params.colors[0] !== "[") {
                this.AllData.properties["colors"] =
                  "[" + message.VALUE.params.colors + "]";
              } else {
                this.AllData.properties["colors"] =
                  message.VALUE.params.colors + "]";
              }
              if (this.AllData.properties["backgroundcolors"]) {
                if (message.VALUE.params.backgroundcolors[0] !== "[") {
                  this.AllData.properties["backgroundcolors"] =
                    "[" + message.VALUE.params.backgroundcolors + "]";
                } else {
                  this.AllData.properties["backgroundcolors"] =
                    message.VALUE.params.backgroundcolors + "]";
                }
              }
              if (this.AllData.properties["labelColors"]) {
                if (message.VALUE.params.labelColors[0] !== "[") {
                  this.AllData.properties["labelColors"] =
                    "[" + message.VALUE.params.labelColors + "]";
                } else {
                  this.AllData.properties["labelColors"] =
                    message.VALUE.params.labelColors + "]";
                }
              }
              //Badge chart -"labelColorsLessThan" color values store in JSON 
              if (this.AllData.properties["labelColorsLessThan"]) {
                  this.AllData.properties["labelColorsLessThan"] =
                    message.VALUE.params.labelColorsLessThan;
              }
              //Badge chart -"labelColorsGreaterThan" color values store in JSON 
              if (this.AllData.properties["labelColorsGreaterThan"]) {
                  this.AllData.properties["labelColorsGreaterThan"] =
                    message.VALUE.params.labelColorsGreaterThan;
              }
              if (this.AllData.properties["labelBgColors"]) {
                if (message.VALUE.params.labelBgColors[0] !== "[") {
                  this.AllData.properties["labelBgColors"] =
                    "[" + message.VALUE.params.labelBgColors + "]";
                } else {
                  this.AllData.properties["labelBgColors"] =
                    message.VALUE.params.labelBgColors + "]";
                }
              }
               //Badge chart -"labelBgColorsLessThan" color values store in JSON
              if (this.AllData.properties["labelBgColorsLessThan"]) {
                  this.AllData.properties["labelBgColorsLessThan"] =
                    message.VALUE.params.labelBgColorsLessThan;
              }
              //Badge chart -"labelBgColorsGreaterThan" color values store in JSON 
              if (this.AllData.properties["labelBgColorsGreaterThan"]) {
                  this.AllData.properties["labelBgColorsGreaterThan"] =
                    message.VALUE.params.labelBgColorsGreaterThan;
              }
              if (this.AllData.properties["valueColors"]) {
                if (message.VALUE.params.valueColors[0] !== "[") {
                  this.AllData.properties["valueColors"] =
                    "[" + message.VALUE.params.valueColors + "]";
                } else {
                  this.AllData.properties["valueColors"] =
                    message.VALUE.params.valueColors + "]";
                }
              }
              if (this.AllData.properties["valueColorsLessThan"]) {
                  this.AllData.properties["valueColorsLessThan"] =
                    message.VALUE.params.valueColorsLessThan;
              }
              if (this.AllData.properties["valueColorsGreaterThan"]) {
                  this.AllData.properties["valueColorsGreaterThan"] =
                    message.VALUE.params.valueColorsGreaterThan;
              }
              if (this.AllData.properties["valueBgColors"]) {
                if (message.VALUE.params.valueBgColors[0] !== "[") {
                  this.AllData.properties["valueBgColors"] =
                    "[" + message.VALUE.params.valueBgColors + "]";
                } else {
                  this.AllData.properties["valueBgColors"] =
                    message.VALUE.params.valueBgColors + "]";
                }
              }
              if (this.AllData.properties["valueBgColorsLessThan"]) {
                  this.AllData.properties["valueBgColorsLessThan"] =
                    message.VALUE.params.valueBgColorsLessThan;
              }
              if (this.AllData.properties["valueBgColorsGreaterThan"]) {
                  this.AllData.properties["valueBgColorsGreaterThan"] =
                    message.VALUE.params.valueBgColorsGreaterThan;
              }
              if (this.AllData.properties["unitColors"]) {
                if (message.VALUE.params.unitColors[0] !== "[") {
                  this.AllData.properties["unitColors"] =
                    "[" + message.VALUE.params.unitColors + "]";
                } else {
                  this.AllData.properties["unitColors"] =
                    message.VALUE.params.unitColors + "]";
                }
              }
              if (this.AllData.properties["unitColorsLessThan"]) {
                  this.AllData.properties["unitColorsLessThan"] =
                    message.VALUE.params.unitColorsLessThan;
              }
              if (this.AllData.properties["unitColorsGreaterThan"]) {
                  this.AllData.properties["unitColorsGreaterThan"] =
                    message.VALUE.params.unitColorsGreaterThan;
              }
            }
          }
        }
      }
    );
  }

  unSubscribeEmmitters() {
    for (const emitter of this.arrSubscription) {
      emitter.unsubscribe();
    }
  }
  /* function to get value from allData by mapwith
   * @ strMapWith: input map with the value of allData
   * @ index: if map with has array or comma separated
   * @ separator: the separator eg. ',', '.', '-'
   */
  getInputValue(inputData, index) {
    let value = { ...this.AllData };

    let arrMapWith;

    if (inputData.mapWith !== undefined) {
      arrMapWith = inputData.mapWith.split(".");
    }

    if (inputData.mapWith !== "") {
      for (let i = 0; i < arrMapWith.length; i++) {
        const mapper = arrMapWith[i];
        value = value[mapper];
      }
    } else {
      value = { ...this.AllData };
    }

    // custom handler

    if (
      inputData.getValueHandler !== undefined &&
      inputData.getValueHandler !== ""
    ) {
      return this[inputData.getValueHandler](inputData, value, index);
    }

    if (window["divdrawerconfig"].currentWidget.type == "ComplexGauge") {
      if (inputData.mapWith == "series" && inputData.mapWithIndex == 1) {
        if (window["divdrawerconfig"].currentWidget.series.length == 1)
          return "";
      }
    }

    if (index === undefined && value !== undefined) {
      if (inputData.mapWithIndex !== undefined) {
        value = value[inputData.mapWithIndex][inputData.name];
      } else {
        value = value[inputData.name];
      }
    } else if (index !== undefined) {
      if (value[index] == undefined) return "";
      value = value[index][inputData.name];
    }

    if (inputData.valueSeparator !== undefined && value !== undefined) {
      const arrValue = value.split(inputData.valueSeparator);
      let flag = 0;
      for (let i = 0; i < arrValue.length; i++) {
        let arrParamName = arrValue[i].split(":");
        let paramName = arrParamName[0];
        if (paramName == inputData.subInputName) {
          value = arrParamName[1];
          flag = 1;
          if (paramName == "color")
            value = arrParamName[1].replace(" !important", "");
        }
      }
      if (flag == 0) {
        //if property not found
        if (inputData.id == "valbgcolor" || inputData.id == "bgcolor")
          value = "#ffffff";
        else if (inputData.id == "labelstylecolor") value = "#000000";
      }
    }

    if (inputData.name == "gap" && inputData.mapWith == "plots") {
      switch (value) {
        case "3":
          value = "small";
          break;
        case "5":
          value = "medium";
          break;
        case "10":
          value = "large";
          break;
      }
    }
    if (inputData.type == "checkbox") {
      if (value == inputData.trueValue) value = true;
      else value = false;
    }
    if (inputData.name == "width" && inputData.mapWith == "columns") {
      if (value !== undefined) value = value.replace(/%/g, "");
    }
    if (inputData.name == "fontsize" && inputData.mapWith == "properties") {
      value = value.replace(/'/g, "");
    }
    if (
      inputData.appendItemBracket == "true" ||
      inputData.id == "legendnondynamic"
    ) {
      if (value !== undefined) {
        value = value.replace(/item\[\'/g, "");
        value = value.replace(/\'\]/g, "");
      }
    }
    if (inputData.appendItemDot == "true") {
      if (value !== undefined) {
        value = value.replace(/item./g, "");
      }
    }
    if (inputData.id == "columnsize") {
      if (value == undefined) {
        if (
          this.AllData.plots[index].minBarSize == "1" &&
          this.AllData.plots[index].maxBarSize == "5"
        ) {
          value = "small";
        } else if (
          this.AllData.plots[index].minBarSize == "3" &&
          this.AllData.plots[index].maxBarSize == "10"
        ) {
          value = "medium";
        } else if (
          this.AllData.plots[index].minBarSize == "5" &&
          this.AllData.plots[index].maxBarSize == "15"
        ) {
          value = "small";
        }
      }
    }
    if (inputData.type == "textarea") {
      this.storePlaceholders(inputData, index);
    }

    let returnValue: any;
    let blankValue: any;
    returnValue = "";
    blankValue = "";

    if (typeof value === "string") {
      if (this.locale[value]) {
        if (inputData.name !== "title" && inputData.type !== "select")
          value = this.locale[value];
      }

      try {
        returnValue = JSON.parse(value);
      } catch (e) {
        if (inputData.type === "checkbox" && value == "") returnValue = false;
        if (inputData.type === "checkbox" && value == "true")
          returnValue = true;
        else returnValue = value;
      }
    } else if (value === undefined) {
      if (inputData.type === "checkbox") returnValue = false;
      else returnValue = blankValue;
    } else {
      returnValue = value;
    }

    if( inputData.id == 'mapToBePlotted' ) {
      let arrobjMapToBePlot = inputData.enum.find( objMapToBePlot => ( objMapToBePlot.value === returnValue));
      if( arrobjMapToBePlot != undefined ) {
      returnValue = arrobjMapToBePlot.name;
      }
    }
    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);

    return returnValue;
  }

  showHideGridBadgeColumnValue() {
    if (window["divdrawerconfig"].currentWidget.type ==  rangesChartType.grid || window["divdrawerconfig"].currentWidget.type ==  rangesChartType.Badge) {
      this.isGridBadge = true;
      let storeName;
      if( window["divdrawerconfig"].currentWidget.transformations != undefined ) {
      storeName = window["divdrawerconfig"].currentWidget.transformations[0].dataStore;
      }
      let formDataObj = this.layoutJSON.stores.find( e=> { return (e.name && e.name != "" && (e.name === storeName )) });
      let isFormDataContains;
      if( formDataObj != undefined ) {
      isFormDataContains = ( formDataObj['__form_data__'] != undefined ) ? true : false; 
      }
      if(this.isTransformationFlag && isFormDataContains) {
        $(".transformation-no-formdata").hide();
        $(".transformation-formdata").show();
      } else {
        $(".transformation-no-formdata").show();
        $(".transformation-formdata").hide();
      }
    } else {
      this.isGridBadge = false;
    }
  }

  /* function to set value in allData by mapwith
   * @ strMapWith: input map with the value of allData
   * @ value: value of input on update
   * @ index: if map with has array or comma separated
   * @ separator: the separator eg. ',', '.', '-'
   */
  setInputValue(inputData, $event, index) {
    let isYAxis = 0;
    if( inputData.isYaxis === undefined ) {
      inputData.isYaxis = 'false';
    }
    if (inputData.isYaxis == "true") isYAxis = 1;

    let arrMapWith = inputData.mapWith.split(".");
    let object = this.AllData;
    let inputValue: any;

    if (inputData.type === "color" || inputData.type === "colorLarge") {
      inputValue = $event;
    } else if ($event.target.type === "checkbox") {
      if (
        $event.target.checked === undefined ||
        $event.target.checked === null ||
        $event.target.checked === ""
      ) {
        inputValue = inputData.falseValue;
      } else if ($event.target.checked !== false) {
        inputValue = inputData.trueValue;
      } else {
        inputValue = inputData.falseValue;
      }
    } else if ($event.target.type === "number") {
      if ($event.keyCode == 69) {
        return;
      } else {
        inputValue = $event.target.value;
      }
    } else {
      inputValue = $event.target.value;

      if (
        inputData.name === "shortenNumber" ||
        inputData.name === "includeZero"
      ) {
        inputValue = $event.target.value === "on" ? "true" : "false";
      }

      if (inputData.name === "inTooltip" || inputData.name == "inBracket") {
        inputValue = $event.target.value === "on" ? "true" : "false";

        object.properties.inTooltip =
          inputData.name == "inTooltip" ? "true" : "false";
        object.properties.inBracket =
          inputData.name == "inBracket" ? "true" : "false";
      }

      if (
        inputData.name === "defaultShapes" ||
        inputData.name === "kpiString" ||
        inputData.name == "kpiValue" ||
        inputData.name === "defaultAsPerTheme" ||
        inputData.name === "kpiStringShapes" ||
        inputData.name === "kpiValueShapes" ||
        inputData.name === "customColorPicker" ||
        inputData.name === "icon" ||
        inputData.name === "iconValues" ||
        inputData.name === "rangeValue"
      ) {
        inputValue = $event.target.value === "on" ? "true" : "false";

        object.properties.kpiString =
          inputData.name == "kpiString" ? "true" : "false";
        object.properties.kpiValue =
          inputData.name == "kpiValue" ? "true" : "false";
        object.properties.defaultShapes =
          inputData.name == "defaultShapes" ? "true" : "false";
      }
    }

    // custom handler
    if (
      inputData.setValueHandler !== undefined &&
      inputData.setValueHandler !== ""
    ) {
      return this[inputData.setValueHandler](inputData, inputValue, index);
    }

    if (inputData.mapWith !== "") {
      while (arrMapWith.length > 0) {
        object = object[arrMapWith.shift()];
      }
    } else {
      object = this.AllData;
    }

    if (index === undefined && inputData.valueSeparator === undefined) {
      if (inputData.mapWithIndex !== undefined) {
        if (inputData.appendItemBracket == "true") {
          if (!inputValue.startsWith("item['")) {
            inputValue = "item['" + inputValue + "']";
            if (inputValue == "item['']" || inputValue == "item['item[']")
              inputValue = "";
          }
        }
        if (inputData.appendItemDot == "true") {
          if (
            !inputValue.startsWith("item.") &&
            !inputValue.startsWith("item['")
          ) {
            inputValue = "item." + inputValue;
            if (inputValue == "item." || inputValue == "item.item.")
              inputValue = "";
          }
        }

        if (inputData.name === "startatmin")
          object[inputData.mapWithIndex]["includeZero"] = false;
        if (inputData.name === "dynamic-min") {
          delete object[inputData.mapWithIndex]["min"];
          object[inputData.mapWithIndex]["includeZero"] = false;
        }
        if (inputData.name === "dynamic-max") {
          delete object[inputData.mapWithIndex]["max"];
        }
        //write better condition
        if (
          inputData.name !== "yt" &&
          inputData.name !== "setlabel-x" &&
          inputData.name !== "setlabel-y" &&
          inputData.name !== "setstep-x" &&
          inputData.name !== "setstep-y" &&
          inputData.name !== "endatmax"
        ) {
          object[inputData.mapWithIndex][inputData.name] = inputValue;
        }

        if (
          inputData.name == "axisType" &&
          window["divdrawerconfig"].currentWidget.type == "Radar"
        ) {
          object[inputData.mapWithIndex][inputData.name] = inputData.value;
        }

        if (inputData.name == "tooltipText") {
          window["divdrawerconfig"].currentWidget.tooltipText = inputValue;
        }

        if (inputData.name === "includeZero")
          object[inputData.mapWithIndex]["min"] = "0";
      } else {
        if (inputData.name === "columnHeaderName") {
          object["series"][0]["labelValue"] = inputValue;
        } else if (
          inputData.name == "fontsize" &&
          inputData.mapWith == "properties"
        ) {
          object[inputData.name] = "'" + inputValue + "'";
        } else {
          if (inputData.appendItemBracket == "true") {
            if (!inputValue.startsWith("item['")) {
              inputValue = "item['" + inputValue + "']";
              if (inputValue == "item['']" || inputValue == "item['item[']")
                inputValue = "";
            }
          }
          object[inputData.name] = inputValue;
        }
      }
      if (
        inputData.name == "majorTicks" ||
        inputData.name == "minorTicks" ||
        inputData.name == "microTicks" ||
        inputData.id == "autosetstepx" ||
        inputData.id == "autosetstepy" ||
        inputData.id == "autosetlabelx" ||
        inputData.id == "autosetlabely"
      ) {
        this.setTicksandLabels(inputData, index, inputValue);
      }
      if (inputData.type == "radio") {
        let i;
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"] == undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"] = [];
        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            inputData.radioName
          )
            break;
        }

        if (
          i == window["divdrawerconfig"].currentWidget["checkedRadios"].length
        ) {
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] = [];
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] =
            inputData.radioName;
        }

        if (inputData.enum !== undefined) {
          //For radio buttons with enum
          for (let j = 0; j < inputData.enum.length; j++) {
            if ($event.target.id.includes(inputData.enum[j].name))
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
                inputData.enum[j].name;
          }
        } else
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            inputData.id;
      }
    } else if (index !== undefined) {
      object = object[index];
      if (object !== undefined && object !== null) {
        if (inputData.valueSeparator === undefined) {
          if (inputData.appendItemBracket == "true") {
            if (!inputValue.startsWith("item['")) {
              inputValue = "item['" + inputValue + "']";
              if (inputValue == "item['']" || inputValue == "item['item[']")
                inputValue = "";
            }
          }

          if (inputData.appendItemDot == "true") {
            if (
              !inputValue.startsWith("item.") &&
              !inputValue.startsWith("item['")
            ) {
              inputValue = "item." + inputValue;
              if (inputValue == "item." || inputValue == "item.item.")
                inputValue = "";
            }
          }
          if (inputData.name === "decimalpointlabel")
            object["shortenNumber"] = false;
          else if (inputData.name === "startatmin")
            object["includeZero"] = false;
          else if (inputData.name === "dynamic-min") {
            delete object["min"];
            object["includeZero"] = false;
          } else if (inputData.name === "dynamic-max") {
            delete object["max"];
          } else if (inputData.name === "width") {
            inputValue = inputValue.concat("%");
            object[inputData.name] = inputValue;
          } else if (
            inputData.name !== "yt" &&
            inputData.name !== "setlabel-x" &&
            inputData.name !== "setlabel-y" &&
            inputData.name !== "setstep-x" &&
            inputData.name !== "setstep-y" &&
            inputData.name !== "endatmax" &&
            inputData.radioName !== "width" &&
            inputData.name !== "cellformat"
          ) {
            object[inputData.name] = inputValue;
          }

          if (inputData.name === "shortenNumber") object["precision"] = 0;

          if (inputData.name === "includeZero") object["min"] = "0";

          if (index == 0 && inputData.name == "store") {
            if (
              window["divdrawerconfig"].currentWidget.datasource == "default"
            ) {
              if (window["divdrawerconfig"].currentWidget.type !== "Bar") {
                if (
                  window["divdrawerconfig"].currentWidget.axes[0] !== undefined
                )
                  window[
                    "divdrawerconfig"
                  ].currentWidget.axes[0].labelSeries = inputValue;
              } else
                window[
                  "divdrawerconfig"
                ].currentWidget.axes[1].labelSeries = inputValue;
            }
          }
          if (
            window["divdrawerconfig"].currentWidget.type !== "Bubble" ||
            window["divdrawerconfig"].currentWidget.type !== "Scatter"
          ) {
            if (inputData.name == "store") {
              object["name"] = inputValue;
            }
          }
        }
      }
      if (
        inputData.name == "majorTicks" ||
        inputData.name == "minorTicks" ||
        inputData.name == "microTicks" ||
        inputData.id == "autosetstepy" ||
        inputData.id == "autosetlabely"
      ) {
        this.setTicksandLabels(inputData, index, inputValue);
      }

      if (inputData.type == "radio") {
        let i;
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"] == undefined && window["divdrawerconfig"].currentWidget.type !== rangesChartType.grid
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"] = [];
         if( window["divdrawerconfig"].currentWidget.type !== rangesChartType.grid){
        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            inputData.radioName
          )
            break;
        }
        if (
          i == window["divdrawerconfig"].currentWidget["checkedRadios"].length
        ) {
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] = [];
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] =
            inputData.radioName;
        }
        let modifiedIndex = index;
        if (isYAxis == 0) modifiedIndex = index + 1;

        if (inputData.enum !== undefined) {
          //For radio buttons with enum
          for (let j = 0; j < inputData.enum.length; j++) {
            if ($event.target.id.includes(inputData.enum[j].name))
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][
                modifiedIndex
              ] = inputData.enum[j].name;
          }
        } else {
          if (isYAxis == 0)
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][
              modifiedIndex
            ] = inputData.id + (modifiedIndex - 1);
          else
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][
              modifiedIndex
            ] = inputData.id + modifiedIndex;
        }
      }
    }
    if(window["divdrawerconfig"].currentWidget.type == rangesChartType.grid){
      this.gridJSONFormat(inputData,index);
    }
  }

    if (inputData.valueSeparator !== undefined) {
      let value = inputValue;
      let strTochange = object[inputData.name];
      let arrStrTochange = strTochange.split(inputData.valueSeparator);
      let flag = 0;
      for (let i = 0; i < arrStrTochange.length; i++) {
        let node = arrStrTochange[i];
        let arrParamName = node.split(":");
        let paramName = arrParamName[0];
        if (paramName == inputData.subInputName) {
          arrParamName[1] = value;
          arrStrTochange[i] = arrParamName.join(":");
          flag = 1;
        }
      }
      if (flag == 0) {
        //property not found
        let newParam = [];
        newParam[0] = inputData.subInputName;
        newParam[1] = inputValue;

        if (arrStrTochange[arrStrTochange.length - 1] == "")
          arrStrTochange[arrStrTochange.length - 1] = newParam.join(":");
        else arrStrTochange[arrStrTochange.length] = newParam.join(":");
      }
      strTochange = arrStrTochange.join(inputData.valueSeparator);
      object[inputData.name] = strTochange;

      if (inputData.type == "radio") {
        let i;
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"] == undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"] = [];
        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            inputData.radioName
          )
            break;
        }

        if (
          i == window["divdrawerconfig"].currentWidget["checkedRadios"].length
        ) {
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] = [];
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] =
            inputData.radioName;
        }

        if (inputData.enum !== undefined) {
          //For radio buttons with enum
          for (let j = 0; j < inputData.enum.length; j++) {
            if ($event.target.id.includes(inputData.enum[j].name))
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
                inputData.enum[j].name;
          }
        } else
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            inputData.id;
      }
    }
    if (index == 0) {
      if (
        inputData.id == "serieslabelnondynamic" ||
        inputData.id == "serieslabeldynamic" ||
        inputData.id == "seriesvalue" ||
        inputData.id == "legenddynamic" ||
        inputData.id == "plot"
      ) {
        if (inputValue !== "" && inputData.id !== "plot")
          this.toggleSeriesTypeTab(true);
        else if (inputData.id == "plot" && inputValue !== "default")
          this.toggleSeriesTypeTab(true);
        else this.toggleSeriesTypeTab(false);
      }
    }
  }

  // This method won't allow characters like +, -, . and e for data points limit input type number field
  // If user tries to type above chars on keydown event then it'll return
  validateNumbers(e) {
    const keyCodeArr = [69, 189, 187, 190, 107, 109, 110];
    return keyCodeArr.indexOf(e.keyCode) === -1;
  }

  addcolumnComponent(columntab) {
    if (columntab.tabs[0].mapwith == "columns") {
      let columnArray = window["divdrawerconfig"].currentWidget.columns;

      let columnprops = {
        name: "",
        id: "",
        field: "",
        cellformat: "leftalign",
        precision: "2",
        shortenNumber: "",
        dataType: "",
        labelunit: "",
        labeltype: "",
        ranges: "",
        status: "",
        properties: "maximum:0,minimum:0",
        labelformat: "MMM d, yyyy",
        width: ""
      };
      columnArray.push(columnprops);
      for (
        var i = 0;
        i < window["divdrawerconfig"].currentWidget.columns.length;
        i++
      ) {
        window["divdrawerconfig"].currentWidget.columns[i]["id"] =
          window["generateUniqueID"]() + i;
      }
      this.buildCheckedRadiosArray();
    } else if (columntab.tabs[0].mapwith == "series") {
      let seriesArray = window["divdrawerconfig"].currentWidget.series;
      let seriesProps = {
        label: "",
        labelColumn: "",
        name: "",
        plot: "default",
        replacevalueparam: "",
        seriesColumn: "",
        sortorder: "",
        sortparam: "",
        store: "",
        value: ""
      };
      seriesArray.push(seriesProps);
      this.getValueDynamic();
      this.toggleSeriesTypeTab(true);
      this.setPlotDropdownList();
    } else if (columntab.tabs[0].mapwith == "plots") {
      let plotArray = window["divdrawerconfig"].currentWidget.plots;
      let addButton = document.getElementById("addPlots");
      addButton["disabled"] = false;
      if (plotArray.length == 2) {
        addButton["disabled"] = true;
        return;
      }

      let plotProps = {
        name: "nondefault",
        type: "",
        markers: "false",
        markerSize: "",
        hAxis: "x",
        vAxis: "y",
        gap: "3",
        minBarSize: "3",
        maxBarSize: "10",
        tension: " "
      };
      plotArray.push(plotProps);
      addButton["disabled"] = true;
      this.setVAxisDropdownList();
      this.setPlotDropdownList();
    } else if (columntab.tabs[0].mapwith == "axes") {
      let axesArray = window["divdrawerconfig"].currentWidget.axes;
      let axesProps: any;

      let addButton = document.querySelector("#Y-AXIS button.add_column");
      addButton["disabled"] = false;
      if (axesArray.length == 3) {
        addButton["disabled"] = true;
        return;
      }
      if (
        window["divdrawerconfig"].currentWidget.type === "Area" ||
        window["divdrawerconfig"].currentWidget.type === "Line"
      ) {
        axesProps = {
          name: "yright",
          title: "",
          vertical: "true",
          includeZero: "false",
          fixUpper: "",
          fixLower: "",
          majorTicks: "true",
          minorTicks: "true",
          microTicks: "false",
          majorLabels: "true",
          isRightYaxis: "true",
          droplabels: "true",
          leftBottom: "false",
          gridlines: "true"
        };
      }

      if (
        window["divdrawerconfig"].currentWidget.type === "Bar" ||
        window["divdrawerconfig"].currentWidget.type === "Column"
      ) {
        axesProps = {
          name: "yright",
          title: "",
          vertical: "true",
          includeZero: "false",
          majorTicks: "true",
          minorTicks: "true",
          microTicks: "false",
          majorLabels: "true",
          fixLower: "",
          fixUpper: "",
          min: "",
          max: "",
          isRightYaxis: "true",
          droplabels: "true",
          leftBottom: "false",
          gridlines: "true"
        };
      }

      axesArray.push(axesProps);
      this.setVAxisDropdownList();
      if (axesArray[1]["gridlines"] == "true") {
        axesArray[2]["gridlines"] = "true"
      } else {
        axesArray[2]["gridlines"] = "false"
      }
      let yaxispanel = document.querySelector("#Y-AXIS1");
      let yaxispanelparentdiv = yaxispanel.parentElement;
      yaxispanelparentdiv.classList.remove("hide");

      addButton["disabled"] = true;
    }
    setTimeout(() => {
      this.showHideGridBadgeColumnValue()
    }, 500);
  }

  deleteElement(tab, index, columntab) {
    if (columntab.tabs[0].mapwith == "columns") {
      const addButton = <HTMLInputElement>document.getElementById("addcolumn");
      this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[0].tabContent[0].tabs.splice(
        index,
        1
      );
      window["divdrawerconfig"].currentWidget.columns.splice(index, 1);
      if(index != window.divdrawerconfig.currentWidget.columns.length){
        let gridAccordian = document.getElementById("gridColumnAccordian" + index);
        if(gridAccordian){
          gridAccordian.focus();
        }
      }else{
        if(!addButton.disabled){
          addButton.focus();
        }else{
          window["outputStream"].next(["setFocusToSetPropertyElements"])
        }
      }
    }
    if (columntab.tabs[0].mapwith == "series") {
      const addButton = <HTMLElement>(
        document.querySelector("button[id='addSERIES']")
      );
      if (window["divdrawerconfig"].currentWidget.type == "Bubble")
        this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[3].tabContent[0].tabs.splice(
          index,
          1
        );
      else if (window["divdrawerconfig"].currentWidget.type == "Scatter")
        this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[2].tabContent[0].tabs.splice(
          index,
          1
        );
      else if (window["divdrawerconfig"].currentWidget.type == "Radar")
        this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[1].tabContent[0].tabs.splice(
          index,
          1
        );
      else
        this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[3].tabContent[0].tabs[1].tabContent[0].tabs.splice(
          index,
          1
        );
      window["divdrawerconfig"].currentWidget.series.splice(index, 1);
      this.getValueDynamic();
      try {
        this.toggleSeriesTypeTab(false);
      } catch (e) {}
      addButton.focus();
    }
    if (columntab.tabs[0].mapwith == "plots") {
      let plotArray = window["divdrawerconfig"].currentWidget.plots;
      let addButton = document.getElementById("addPlots");
      this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[2].tabContent[0].tabs = this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[2].tabContent[0].tabs.splice(
        index - 1,
        1
      );

      window["divdrawerconfig"].currentWidget.plots.splice(index, 1);

      if (plotArray.length < 2) addButton["disabled"] = false;
      addButton.focus();
      this.setPlotDropdownList();
    }
    if (columntab.tabs[0].mapwith == "axes") {
      let axesArray = window["divdrawerconfig"].currentWidget.axes;
      let addButton = <HTMLElement>(
        document.querySelector("#Y-AXIS button.add_column")
      );

      this.Tooldata[0].tab.tabs[1].tabContent[0].tab.tabs[1].tabContent[0].tabs.splice(
        1,
        1
      );
      window["divdrawerconfig"].currentWidget.axes.splice(2, 1);

      if (axesArray.length < 3) addButton["disabled"] = false;
      this.setVAxisDropdownList();
      let yaxispanel = document.querySelector("#Y-AXIS1");
      let yaxispanelparentdiv = yaxispanel.parentElement;
      yaxispanelparentdiv.classList.add("hide");
      addButton.focus();
    }
  }

  onInputValueChangeHandler(inputData, $event, index) {
    switch (inputData.onChangeHandler) {
      case "removeItem":
        this.removeItem(inputData, $event, index);
        break;

      case "removeKey":
        this.removeKey(inputData, $event, index);
        break;
      case "getColumnList":
        this.getColumnList();
        break;
      case "getAxesList":
        this.getAxesList();
        break;
      case "getDataDefinationList":
        this.getDataDefinationList();
        break;
      case "getValueUsingClass":
        this.getValueUsingClass(inputData, $event, index);
        break;
      case "validationChecker":
        this.validationChecker(inputData, $event, index);
        break;
      case "showHideElements":
        this.showHideElements(inputData, $event);
        break;
      case "showHideElements,setRoundingOptions":
        this.showHideElements(inputData, $event);
        break;
      case "showHideElementsinArray":
        this.showHideElementsinArray(inputData, $event);
        break;
      case "showHideElementsinArray,resetDateFormatsValue":
          this.showHideElementsinArray(inputData, $event);
          this.resetDateFormatsValue(inputData, $event);
      break;
      case "showHideElementsMap":
        this.showHideElementsMap(inputData, $event);
      case "showHideElementsinArray,setRoundingOptions":
        this.showHideElementsinArray(inputData, $event);
        break;
      case "autoManualScenario":
        this.autoManualScenarioHandler(inputData, $event, index);
        this.showHideElementsinArray(inputData, $event);
        break;
      case "autoManualScenario,setRoundingOptions":
        this.autoManualScenarioHandler(inputData, $event, index);
        this.showHideElementsinArray(inputData, $event);
        break;
      case "disableElements":
        this.disableElements(inputData, $event, index);
        break;
      case "removeKey,disableElements":
        this.removeKey(inputData, $event, index);
        this.disableElements(inputData, $event, index);
        break;
      case "toggleElement":
        this.toggleElement(inputData, $event, index);
        break;
      case "changeType":
        this.changeType(inputData, $event, index);
        break;
      case "dateSampleFormat":
        this.dateSampleFormat(inputData, $event, index);
        break;
      case "autotoggle":
        this.autotoggle(inputData, $event, index);
        break;
      case "columnsizeValue":
        this.columnsizeValue(inputData, $event, index);
        break;
      case "getValueDynamic":
        this.getValueDynamic();
        break;
      case "columnGapValue":
        this.columnGapValue(inputData, $event, index);
        break;
      case "showHideElements,nobagecolor":
        this.showHideElements(inputData, $event);

        break;
      case "removeKey,showHideElementsinArray":
        this.removeKey(inputData, $event, index);
        this.showHideElementsinArray(inputData, $event);
        break;
      case "removeKey,showHideElements":
        this.removeKey(inputData, $event, index);
        this.showHideElements(inputData, $event);
        break;
      case "updateCSSStyle":
        this.updateCSSStyle(inputData, $event);
        break;
      case "showIcon":
        this.showIcon(inputData, $event);
        break;
      case "setQuadrantColors,showHideElements":
        this.setQuadrantColors(inputData);
        this.showHideElements(inputData, $event);
        break;
      case "showHideBorderStyles":
        this.showHideBorderStyles($event);
      case "enambleDisableGridlines":
        this.enableDisableGridlines($event);  
    }
  }

  removeItem(inputData, $event, index) {
    let arrMapWith = inputData.mapWith.split(".");
    let object = this.AllData;
    let inputValue: any;
    let JsonKey: any;
    while (arrMapWith.length > 0) {
      object = object[arrMapWith.shift()];
    }
    if (inputData.name == "chartFamily") {
      if ($event.target.checked) {
        object[inputData.name] = inputData.trueValue;
      } else {
        delete object[inputData.name];
      }
    }
  }

  removeKey(inputData, $event, index) {
    let object = this.AllData;
    let inputValue: any;
    let JsonKey: any;

    if ($event.target.checked) {
      if (index === undefined && inputData.valueSeparator === undefined) {
        if (inputData.mapWithKey == "legend") {
          window["divdrawerconfig"].currentWidget.legend = {
            show: "true",
            style: "font-size:10px;margin-left:2%;",
            horizontal: "true",
            type: "interactive"
          };
          let i = this.findIndexInCheckedRadiosArray("horizontal");
          window.divdrawerconfig.currentWidget.checkedRadios[i][1] =
            "Horizontal";
        } else if (inputData.name == "autoTickStep") {
          if (window["divdrawerconfig"].currentWidget.properties) {
            window["divdrawerconfig"].currentWidget.properties[0].tickStep = "";
          }
        } else if (inputData.name == "autoTickStep1") {
          if (window["divdrawerconfig"].currentWidget.properties) {
            window["divdrawerconfig"].currentWidget.properties[1].tickStep = "";
          }
        } else if (inputData.name == "showxTicks") {
          object = window["divdrawerconfig"].currentWidget.axes[0];
          object["showTicksBottom"] = "true";
          object["showTicksTop"] = "false";
        } else if (inputData.name == "showyTicks") {
          object = window["divdrawerconfig"].currentWidget.axes[1];
          object["showTicksLeft"] = "true";
          object["showTicksRight"] = "false";
        } else if (inputData.name == "inBracket") {
          delete object["properties"].tooltiplabelid;
        } else if (
          inputData.name == "showTreemapName" ||
          inputData.name == "showTreemapValue"
        ) {
          if (
            window["divdrawerconfig"].currentWidget.properties
              .showTreemapName == "false" &&
            window["divdrawerconfig"].currentWidget.properties
              .showTreemapValue == "false"
          ) {
            window["divdrawerconfig"].currentWidget.treemapShowLabel = "false";
          }
        } else delete object[inputData.mapWith];
      } else {
        if (inputData.name == "autoWidth") {
          delete object["columns"][index]["width"];
        }
      }
      if (inputData.mapWithKey == "toolbar")
        delete object[inputData.mapWithKey];
    } else if (index === undefined && inputData.valueSeparator === undefined) {
      if (
        inputData.name == "showTreemapName" ||
        inputData.name == "showTreemapValue"
      ) {
        if (
          window["divdrawerconfig"].currentWidget.properties.showTreemapName ==
            "false" &&
          window["divdrawerconfig"].currentWidget.properties.showTreemapValue ==
            "false"
        ) {
          window["divdrawerconfig"].currentWidget.treemapShowLabel = "false";
          let addtreemapShowLabel = document.querySelector(".treemapShowLabel");
          let treemapShowLabelCheckbox = document.getElementById(
            "treemapShowLabel"
          );
          if (
            treemapShowLabelCheckbox !== undefined &&
            treemapShowLabelCheckbox !== null
          ) {
            document.getElementById("treemapShowLabel").focus();
            addtreemapShowLabel.classList.add("hide");
          }
        }
      } else if (inputData.mapWithKey !== "chartFamily") {
        object[inputData.mapWith] = {};
      }
      let itemArray =
        window["divdrawerconfig"].currentWidget[inputData.mapWith];
      let Itemprops = { name: "Grid" };
      if (inputData.mapWithKey == "chartidentity") {
        itemArray.push(Itemprops);
      } else if (inputData.mapWithKey == "toolbar") {
        if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type === "Bar" ||
          window["divdrawerconfig"].currentWidget.type === "Column"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            chartFamily: "graphical",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type === "pie" ||
          window["divdrawerconfig"].currentWidget.type === "Donut"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            chartFamily: "circular",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type == rangesChartType.gauge ||
          window["divdrawerconfig"].currentWidget.type == rangesChartType.heatmap ||
          window["divdrawerconfig"].currentWidget.type == rangesChartType.chord ||
          window["divdrawerconfig"].currentWidget.type == rangesChartType.calendarHeatmap
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Venn") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "venn"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Radar") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "radar_grid"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "TagCloud") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "tagcloud"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Bubble") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "bubble_grid"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Scatter") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "scatter_grid"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type == "bulletmap"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "bulletmap"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type == "QuadrantMotion"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "quadrantmotion_grid"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type == "RangeColumn"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append",
            chartFamily: "Rangecolumn"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Sankey") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            chartFamily: "sankey_grid",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Sunburst") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            chartFamily: "sunburst_grid",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (
          window["divdrawerconfig"].currentWidget.type == "ComplexGauge"
        ) {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            titleUpdation: "append",
            collapse: "false"
          };
        } else if (window["divdrawerconfig"].currentWidget.type === "Tree") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Web") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            titleUpdation: "append",
            collapse: "false"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Topology") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Baseline") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else if (window["divdrawerconfig"].currentWidget.type == "Treemap") {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        } else {
          window["divdrawerconfig"].currentWidget.toolbar = {
            isMaster: "false",
            title: "",
            chartFamily: "graphical_time",
            maximize: "true",
            collapse: "false",
            titleUpdation: "append"
          };
        }
      } else if (inputData.mapWithKey == "legend") {
        delete object[inputData.mapWithKey];
      } else if (inputData.mapWithKey == "chartFamily") {
        delete object[inputData.mapWith][inputData.mapWithKey];
      }
      if (inputData.name == "addUnit") {
        if (window["divdrawerconfig"].currentWidget.unit)
          window["divdrawerconfig"].currentWidget.unit = "";
        else if (
          window["divdrawerconfig"].currentWidget.type == "ComplexGauge"
        ) {
          window["divdrawerconfig"].currentWidget.properties[0].unit = "";
        } else if (window["divdrawerconfig"].currentWidget.weightageUnit)
          window["divdrawerconfig"].currentWidget.weightageUnit = "";
        else if (window["divdrawerconfig"].currentWidget.innerRadius) {
          window["divdrawerconfig"].currentWidget.innerRadius = "";
          window["divdrawerconfig"].currentWidget.centerContent = "";
        } else if (window["divdrawerconfig"].currentWidget.properties.unit) {
          window["divdrawerconfig"].currentWidget.properties.unit = "%";
        } else if (
          window["divdrawerconfig"].currentWidget.sizeUnit ||
          window["divdrawerconfig"].currentWidget.valueUnit
        ) {
          window["divdrawerconfig"].currentWidget.sizeUnit = "";
          window["divdrawerconfig"].currentWidget.valueUnit = "";
        }
        if (
          window["divdrawerconfig"].currentWidget.properties.valueUnitPosition
        )
          window["divdrawerconfig"].currentWidget.properties.valueUnitPosition =
            "suffix";

        if (
          window["divdrawerconfig"].currentWidget.valueUnitPositionTreemap ||
          window["divdrawerconfig"].currentWidget.sizeUnitPositionTreemap
        ) {
          window["divdrawerconfig"].currentWidget.valueUnitPositionTreemap =
            "suffix";
          window["divdrawerconfig"].currentWidget.sizeUnitPositionTreemap =
            "suffix";
          window["divdrawerconfig"].currentWidget.sizeUnit = "";
          window["divdrawerconfig"].currentWidget.valueUnit = "";
        }
      }
      if (inputData.name == "addTarget") {
        if (window["divdrawerconfig"].currentWidget.properties.targetValue)
          window["divdrawerconfig"].currentWidget.properties.targetValue = "";
        if (window["divdrawerconfig"].currentWidget.properties.targetColor)
          window["divdrawerconfig"].currentWidget.properties.targetColor =
            "#000000";
        if (
          window["divdrawerconfig"].currentWidget.properties.targetValueTooltip
        )
          window[
            "divdrawerconfig"
          ].currentWidget.properties.targetValueTooltip = "Target Value";
        if (
          window["divdrawerconfig"].currentWidget.properties
            .targetCompletionTooltip
        )
          window[
            "divdrawerconfig"
          ].currentWidget.properties.targetCompletionTooltip =
            "Target Completion";
      }
      if (inputData.name == "addTitle") {
        if (window["divdrawerconfig"].currentWidget.properties.title)
          window["divdrawerconfig"].currentWidget.properties.title = "";
      }
      if (window["divdrawerconfig"].currentWidget.type === "QuadrantMotion") {
        let object;
        if (inputData.name == "showxaxistitle") {
          object = window["divdrawerconfig"].currentWidget.axes[0];
          object["title"] = "";
          object["bottomPosition"] = "true";
          object["bottomX"] = "30";
          object["bottomY"] = "10";
          object["topPosition"] = "false";
          object["topX"] = "30";
          object["topY"] = "-5";
        }
        if (inputData.name == "showxTicks") {
          object = window["divdrawerconfig"].currentWidget.axes[0];
          object["showTicksBottom"] = "false";
          object["showTicksTop"] = "false";
        }
        if (inputData.name == "showyaxistitle") {
          object = window["divdrawerconfig"].currentWidget.axes[1];
          object["title"] = "";
          object["leftPosition"] = "true";
          object["leftX"] = "-7";
          object["leftY"] = "-50";
          object["rightPosition"] = "false";
          object["rightX"] = "7";
          object["rightY"] = "-50";
        }
        if (inputData.name == "showyTicks") {
          object = window["divdrawerconfig"].currentWidget.axes[1];
          object["showTicksLeft"] = "false";
          object["showTicksRight"] = "false";
        }
        if (inputData.name == "quadrantTitle") {
          object = window["divdrawerconfig"].currentWidget.properties;
          let titles = [
            "leftTopTitle",
            "leftBottomTitle",
            "rightTopTitle",
            "rightBottomTitle"
          ];
          for (let i = 0; i < 4; i++) {
            object[titles[i]] = "";
          }
        }
        if (inputData.name == "titleMotion") {
          object = window["divdrawerconfig"].currentWidget.properties;
          let titles = ["leftControlTitle", "rightControlTitle"];
          for (let i = 0; i < 2; i++) {
            object[titles[i]] = "";
          }
        }
      }
      if (inputData.name == "treemapTooltip") {
        if (
          window["divdrawerconfig"].currentWidget.properties.sizeTooltip ||
          window["divdrawerconfig"].currentWidget.properties.sizeTooltip == ""
        )
          window["divdrawerconfig"].currentWidget.properties.sizeTooltip =
            "Size";
        if (
          window["divdrawerconfig"].currentWidget.properties.valueTooltip ||
          window["divdrawerconfig"].currentWidget.properties.valueTooltip == ""
        )
          window["divdrawerconfig"].currentWidget.properties.valueTooltip =
            "Value";

        window["divdrawerconfig"].currentWidget.valueUnitPositionTreemap =
          "suffix";

        window["divdrawerconfig"].currentWidget.sizeUnitPositionTreemap =
          "suffix";

        window["divdrawerconfig"].currentWidget.sizeUnit = "";
        window["divdrawerconfig"].currentWidget.valueUnit = "";

        let addunitTreemap = document.querySelector(".addUnit");
        if (window["divdrawerconfig"].currentWidget.addUnit) {
          window["divdrawerconfig"].currentWidget.addUnit = "false";
          addunitTreemap.classList.add("hide");
        }
      }
      if (inputData.name == "treemapShowLabel") {
        if (window["divdrawerconfig"].currentWidget.properties.showTreemapName)
          window["divdrawerconfig"].currentWidget.properties.showTreemapName =
            "true";
        if (window["divdrawerconfig"].currentWidget.properties.showTreemapValue)
          window["divdrawerconfig"].currentWidget.properties.showTreemapValue =
            "true";
      }
    }
  }

  getColumnList() {
    let columnListData = [];
    let columnList =
      window["appnamespace"].tabregister[window["appnamespace"].currentkey]
        .datapacket.layoutJSON.stores[0].__form_data__.metrics.selectedValues;
    this.columnListData = columnList;
  }

  getAxesList() {
    let axesListData = [];
    let axesList = window["divdrawerconfig"].currentWidget.axes;
    if (axesList !== undefined) {
      if (axesList.length == 3)
        this.axesListData = ["Default Y-Axis", "Right Y-Axis"];
      else this.axesListData = ["Default Y-Axis"];
    }
  }

  getDataDefinationList() {
    let storeListData = [];
    let storeList =
      window["appnamespace"].tabregister[window["appnamespace"].currentkey]
        .datapacket.layoutJSON.stores;
    this.storeListData = storeList;
  }

  getValueUsingClass(inputData, $event, index) {
    this.formCorrectArray("chkArray");
    if (inputData.name === "cellformat") {
      const value = $event.target.value;
      if(window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"].split(",").length >1 && window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"].split(",")[0] != "bold" && window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"].split(",")[0] != "italic" && window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"].split(",")[0] != "underline"){
        var str = window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"];
        var res = str.replace(window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"].split(",")[0], value);
        window["divdrawerconfig"].currentWidget["columns"][index]["cellformat"] = res;
      }else{
      window["divdrawerconfig"].currentWidget[inputData.mapWith][index][
        inputData.name
      ] = value;
      }
    } else {
      if ($event.target.checked !== false) {
        let preval = window["divdrawerconfig"].currentWidget[inputData.mapWith][index][inputData.mapWithname];
        let postval = inputData.value;
        window["divdrawerconfig"].currentWidget[inputData.mapWith][index][inputData.mapWithname] = preval.concat(',', postval);
      } else {
        let number = inputData.value;
        let extentions = window["divdrawerconfig"].currentWidget[
          inputData.mapWith
        ][index][inputData.mapWithname].split(",");

        for (let i = 0; i < 4; i++) {
          if (extentions[i] === number) {
            let itemToBeRemoved = number;
      var filteredArray = extentions.filter(item => !itemToBeRemoved.includes(item))
            window["divdrawerconfig"].currentWidget[inputData.mapWith][index][
              inputData.mapWithname
            ] = filteredArray.toString();
          }
        }
      }
    }
  }

  getStoreDetails() {
    if (
      window["appnamespace"].tabregister[window["appnamespace"].currentkey]
        .datapacket.layoutJSON.stores[0].datasource == "default"
    ) {
    }
  }

  validationChecker(inputData, $event, index) {
    let value = $event.target.value;
    let id = $event.target.id;
    let element = document.getElementById(id);
    let notValid = false;

    if (inputData.valCategory == "AS") {
      let format1 = /[!@#$%^`~&*()+\-=\[\]{};':"\\|,.<>\/?]/;
      let format2 = /^[^_]*$/;

      if (!format1.test(value) && format2.test(value)) {
        notValid = false;
      } else {
        notValid = true;
      }
    }

    // Data Point Limit Validation For Real Time Widget
    if (
      inputData.hasOwnProperty("id") &&
      inputData.id.toLowerCase() == "datapointslimit"
    ) {
      if (!value) {
        notValid = true;
      }
      // Fix for Defect #72667 - Limit is decreased as Performance issue observed with real time dashboard having more data points
      if (value < 10 || value > 999) {
        notValid = true;
      }
    }

    if (notValid) {
      this.setValidationRules(element, "true", "block");
      element.classList.add("invalid-field");
    } else {
      this.setValidationRules(element, "false", "none");
      element.classList.remove("invalid-field");
    }
  }

  // This will display alert tooltip message in template for widget title and data points limit field inside set properties
  setValidationRules(element: any, value: string, display: string) {
    if (element && element.parentElement.querySelector(".alert-danger")) {
      element.parentElement.querySelector(".alert-danger")[
        "style"
      ].display = display;
    }

    if (element && element.parentElement.querySelector(".alert-pattern")) {
      element.parentElement.querySelector(".alert-pattern")[
        "style"
      ].display = display;
    }
    window.divdrawerconfig.currentWidget.invalidData = value;
  }

  intiateArray() {
    this.chkArray = [];
  }

  enableDisableGridlines($event){
    let axesArray = window["divdrawerconfig"].currentWidget.axes;    
    if(axesArray){
    if ($event.target.checked == true) {
      axesArray[1]["gridlines"] = "true";
      axesArray[2]["gridlines"] = "true";
    } else {
      axesArray[1]["gridlines"] = "false";
      axesArray[2]["gridlines"] = "false";
    } 
  }     
  }

  showHideElements(inputdata, $event) {
    let elementsArray: any;
    let object = this.AllData;

    if (inputdata.name == "paginationConf") {
      elementsArray = document.querySelectorAll(".paginationCheck");
      let primarykeybox = document.querySelector(".isServerCheck");
      let isServercheckbox = document.querySelector(
        "div.paginationCheck input"
      );
      for (let l = 0; l < elementsArray.length; l++) {
        if ($event.target.checked) elementsArray[l].classList.remove("hide");
        else {
          elementsArray[l].classList.add("hide");
          primarykeybox.classList.add("hide");
          isServercheckbox["checked"] = false;
          object.properties.isServer = "";
          object.properties.primaryKey = "";
        }
      }
    }

    if (inputdata.name == "type" && inputdata.mapWith == "plots") {
      elementsArray = document.querySelectorAll('select[id^="chartType"]');
      let x, class1, class2;

      for (x = 0; x < elementsArray.length; x++) {
        if (
          $event.target.value === "Lines" ||
          $event.target.value === "Areas"
        ) {
          class1 = "linePlotSelect";
          class2 = "columnPlotSelect";
        }
        if (
          $event.target.value === "ClusteredBars" ||
          $event.target.value === "ClusteredColumns" ||
          $event.target.value === "StackedColumns" ||
          $event.target.value === "StackedBars"
        ) {
          class1 = "columnPlotSelect";
          class2 = "linePlotSelect";
        }

        let dataTypeValueArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
          class1
        );

        for (let y = 0; y < dataTypeValueArray.length; y++) {
          if ($event.target === elementsArray[x]) {
            let e = elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              class1
            )[y];
            let e2 = elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              class2
            )[y];
            e.classList.remove("hide");
            e2.classList.add("hide");
          }
        }
      }
    }

    if (
      inputdata.id.includes("manualsetlabel") ||
      inputdata.id.includes("manualsetstep")
    ) {
      let selector1, selector2: any;
      if (inputdata.id.includes("manualsetlabel")) {
        selector1 = '*[id^="manualsetlabel"]';
        selector2 = "manualsetlabelCheck";
      }
      if (inputdata.id.includes("manualsetstep")) {
        selector1 = '*[id^="manualsetstep"]';
        selector2 = "manualsetstepCheck";
      }
      elementsArray = document.querySelectorAll(selector1);
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let showHideElementsArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
          selector2
        );
        let majortick = document.querySelectorAll("input[name='majorTicks']");
        let minortick = document.querySelectorAll("input[name='minorTicks']");
        let microtick = document.querySelectorAll("input[name='microTicks']");

        for (let y = 0; y < showHideElementsArray.length; y++) {
          if ($event.target === elementsArray[x]) {
            let e = elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              selector2
            )[y];
            if ($event.target.value == "on") {
              if (e.classList.contains("majorTickCheck")) {
                if (majortick[x]["checked"]) e.classList.remove("hide");
              }
              if (e.classList.contains("minorTickCheck")) {
                if (minortick[x]["checked"]) e.classList.remove("hide");
              }
              if (e.classList.contains("microTickCheck")) {
                if (microtick[x]["checked"]) e.classList.remove("hide");
              }
            } else {
              if (e.classList.contains("majorTickCheck")) {
                if (!majortick[x]["checked"]) e.classList.add("hide");
              }
              if (e.classList.contains("minorTickCheck")) {
                if (!minortick[x]["checked"]) e.classList.add("hide");
              }
              if (e.classList.contains("microTickCheck")) {
                if (!microtick[x]["checked"]) e.classList.add("hide");
              }
            }
          }
        }
      }
    }

    //show/hide major steps and labels input depending on major tick on/off

    if (
      inputdata.id.includes("majorTicks-x") ||
      inputdata.id.includes("minorTicks-x") ||
      inputdata.id.includes("microTicks-x")
    ) {
      let selector1, selector2: any;
      if (inputdata.id.includes("majorTicks-x")) {
        selector1 = "div.majorTicks-x input";
        selector2 = "div.majorTickCheck";
      }
      if (inputdata.id.includes("minorTicks-x")) {
        selector1 = "div.minorTicks-x input";
        selector2 = "div.minorTickCheck";
      }
      if (inputdata.id.includes("microTicks-x")) {
        selector1 = "div.microTicks-x input";
        selector2 = "div.microTickCheck";
      }

      elementsArray = document.querySelectorAll(selector1);
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let showHideElementsArray = document.querySelectorAll(selector2);
        let manualSetStepsRadioArray = document.querySelectorAll(
          '*[id^="manualsetstep"]'
        );
        let manualSetLabelsRadioArray = document.querySelectorAll(
          '*[id^="manualsetlabel"]'
        );

        if (x == 0) {
          for (let y = 0; y < 2; y++) {
            if ($event.target === elementsArray[x]) {
              let e = showHideElementsArray[y];
              if ($event.target.checked) {
                if (e.classList.contains("manualsetstepCheck"))
                  if (manualSetStepsRadioArray[0]["checked"] === true)
                    e.classList.remove("hide");
                if (e.classList.contains("manualsetlabelCheck"))
                  if (manualSetLabelsRadioArray[0]["checked"] === true)
                    e.classList.remove("hide");
              } else e.classList.add("hide");
            }
          }
        }
      }
    }

    if (
      inputdata.id.includes("majorTicks-y") ||
      inputdata.id.includes("minorTicks-y") ||
      inputdata.id.includes("microTicks-y")
    ) {
      let selector1, selector2: any;
      if (inputdata.id.includes("majorTicks-y")) {
        selector1 = "div.majorTicks-y input";
        selector2 = "div.majorTickCheck";
      }
      if (inputdata.id.includes("minorTicks-y")) {
        selector1 = "div.minorTicks-y input";
        selector2 = "div.minorTickCheck";
      }
      if (inputdata.id.includes("microTicks-y")) {
        selector1 = "div.microTicks-y input";
        selector2 = "div.microTickCheck";
      }
      elementsArray = document.querySelectorAll(selector1);
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let showHideElementsArray = document.querySelectorAll(selector2);
        let manualSetStepsRadioArray = document.querySelectorAll(
          '*[id^="manualsetstep"]'
        );
        let manualSetLabelsRadioArray = document.querySelectorAll(
          '*[id^="manualsetlabel"]'
        );

        if (x == 0) {
          for (let y = 2; y < 4; y++) {
            if ($event.target === elementsArray[x]) {
              let e = showHideElementsArray[y];
              if ($event.target.checked) {
                if (e.classList.contains("manualsetstepCheck"))
                  if (manualSetStepsRadioArray[1]["checked"] === true)
                    e.classList.remove("hide");
                if (e.classList.contains("manualsetlabelCheck"))
                  if (manualSetLabelsRadioArray[1]["checked"] === true)
                    e.classList.remove("hide");
              } else e.classList.add("hide");
            }
          }
        }
        if (x == 1) {
          for (let y = 4; y < 6; y++) {
            if ($event.target === elementsArray[x]) {
              let e = showHideElementsArray[y];
              if ($event.target.checked) {
                if (e.classList.contains("manualsetstepCheck"))
                  if (manualSetStepsRadioArray[2]["checked"] === true)
                    e.classList.remove("hide");
                if (e.classList.contains("manualsetlabelCheck"))
                  if (manualSetLabelsRadioArray[2]["checked"] === true)
                    e.classList.remove("hide");
              } else e.classList.add("hide");
            }
          }
        }
      }
    }

    if (
      inputdata.id.includes("axisCount") ||
      inputdata.id.includes("ticksandlabels") ||
      inputdata.name.includes("gaugeHeading") ||
      inputdata.name.includes("mapHeading")
    ) {
      elementsArray = document.querySelectorAll(inputdata.queryselectorValue);
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let showHideElementsArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
          inputdata.targetClass
        );

        for (let y = 0; y < showHideElementsArray.length; y++) {
          if ($event.target === elementsArray[x]) {
            let e = elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              inputdata.targetClass
            )[y];

            if (
              e.parentElement.previousSibling.firstElementChild.classList.contains(
                "in"
              )
            ) {
              e.classList.add("hide");
              e.parentElement.previousSibling.firstElementChild.classList.toggle(
                "in"
              );
              this.setIconFocus = true;
            } else {
              e.classList.remove("hide");
              e.parentElement.previousSibling.firstElementChild.classList.toggle(
                "in"
              );
              this.setIconFocus = false;
            }
          }
        }
      }
    }
    if (inputdata.id == "linearYAxis" || inputdata.id == "logYAxis") {
      let elementsToShow = document.querySelectorAll(inputdata.targetClass);
      let elementsToHide = document.querySelectorAll(inputdata.targetClassHide);
      for (let l = 0; l < elementsToShow.length; l++) {
        if ($event.target.checked) elementsToShow[l].classList.remove("hide");
        else elementsToShow[l].classList.add("hide");
      }
      for (let l = 0; l < elementsToHide.length; l++) {
        if ($event.target.checked) elementsToHide[l].classList.add("hide");
        else elementsToHide[l].classList.remove("hide");
      }
    }
    if (inputdata.radioName == "quadrantColors") {
      let targetElements = document.querySelectorAll(".customColors");
      for (let l = 0; l < targetElements.length; l++) {
        if ($event.target.checked) {
          if (inputdata.name == "defaultColors")
            targetElements[l].classList.add("hide");
          else targetElements[l].classList.remove("hide");
        }
      }
    }
    if (
      inputdata.radioName == "tickStep" ||
      inputdata.radioName == "tickStep1"
    ) {
      let targetElements = document.getElementsByClassName(
        inputdata.targetClass
      );
      for (let l = 0; l < targetElements.length; l++) {
        if ($event.target.checked) {
          if (inputdata.label == "Auto")
            targetElements[l].classList.add("hide");
          else targetElements[l].classList.remove("hide");
        }
      }
    } else {
      let elementsArray: any;
      elementsArray = document.querySelectorAll(inputdata.targetClass);
      for (let l = 0; l < elementsArray.length; l++) {
        if ($event.target.checked) elementsArray[l].classList.remove("hide");
        else elementsArray[l].classList.add("hide");
      }
    }

    if (window["divdrawerconfig"].currentWidget.treemapShowLabel == "true") {
      if (
        window["divdrawerconfig"].currentWidget.properties.showTreemapName ==
        "false"
      )
        window["divdrawerconfig"].currentWidget.properties.showTreemapName =
          "true";
      if (
        window["divdrawerconfig"].currentWidget.properties.showTreemapValue ==
        "false"
      )
        window["divdrawerconfig"].currentWidget.properties.showTreemapValue =
          "true";
    }
  }

  resetDateFormatsValue(inputdata, $event){
    let dateFormatElement = $($($($event.target).closest(".col-lg-60"))[0].nextSibling).find("select");
    if($($event.target).is(":checked")){
      $(dateFormatElement[1]).addClass("invalid-field"); // date format
      $(dateFormatElement[2]).addClass("invalid-field"); // sample format
    } else {
      $(dateFormatElement[1]).removeClass("invalid-field"); // date format
      $(dateFormatElement[2]).removeClass("invalid-field"); // sample format
      if(this.currentWidgets.type == "Baseline"){
        delete this.currentWidgets.properties.labelFormat
        delete this.currentWidgets.properties.labeltype
        this.currentWidgets.properties.labeltype = _DATE_CONFIG.BASELINE_DEFAULT_LABEL_TYPE;
        this.currentWidgets.properties.labelFormat = _DATE_CONFIG.BASELINE_DEFAULT_LABEL_FORMAT;
      }else {
        let id = $($event.currentTarget).attr("id");
        let index = parseInt(id.charAt(id.length - 1));
        delete this.currentWidgets.series[index].labelFormat
        delete this.currentWidgets.series[index].labeltype
        if(this.currentWidgets.series[index].hasOwnProperty(_DATE_CONFIG.DEFAULT_LABEL_TYPE)){
          this.currentWidgets.series[index].labeltype = this.currentWidgets.series[index][_DATE_CONFIG.DEFAULT_LABEL_TYPE];
        }
        if(this.currentWidgets.series[index].hasOwnProperty(_DATE_CONFIG._DEFAULT_LABEL_FORMAT)){
          this.currentWidgets.series[index].labelFormat = this.currentWidgets.series[index][_DATE_CONFIG._DEFAULT_LABEL_FORMAT];
        }
      }
      
    }
    dateFormatElement.val("");
  }

  // to show/hide elements which exist in multiple locations. Eg, in plot1 and plot2
  showHideElementsinArray(inputdata, $event) {
    let elementsArray: any;

    elementsArray = document.querySelectorAll(inputdata.queryselectorValue);
    let x;
    for (x = 0; x < elementsArray.length; x++) {
      let showHideElementsArray = elementsArray[
        x
      ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
        inputdata.targetClass
      );

      for (let y = 0; y < showHideElementsArray.length; y++) {
        if ($event.target === elementsArray[x]) {
          let e = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
            inputdata.targetClass
          )[y];
          if (inputdata.hideElements == "true") {
            if ($event.target.value == "on") e.classList.add("hide");
            else e.classList.remove("hide");
          } else {
            if (inputdata.type === "radio") {
              if ($event.target.value == "on") e.classList.remove("hide");
              else e.classList.add("hide");
            }
            if (inputdata.type === "checkbox") {
              if ($event.target.checked) e.classList.remove("hide");
              else e.classList.add("hide");
            }
          }
        }
      }
    }
  }

  disableElements(inputdata, $event, index) {
    if (inputdata.name == "hideTitlebar") {
      let elementsArray = document.querySelectorAll("div.hideTitleCheck *");
      for (let l = 0; l < elementsArray.length; l++) {
        if ($event.target.checked) {
          elementsArray[l]["disabled"] = "disabled";
          elementsArray[l].setAttribute("style", "color: #a9a9a9;");
          elementsArray[l].classList.remove("invalid-field");

          // Raise an event to flush the dynamic-widget-title's value.
          let currentWidgetIndex =
            window["divdrawerconfig"].currentWidget.index;
          window.inputStream.next([
            "flushDynamicWidgetTitle",
            currentWidgetIndex
          ]);
        } else {
          elementsArray[l]["disabled"] = false;
          elementsArray[l].removeAttribute("style");
        }
      }
    } else if (inputdata.name == "decimalpointlabel") {
      let elementsArray = document.querySelectorAll(
        '*[id^="decimalpointlabel"]'
      );
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        if ($event.target.value === "on") {
          let dataTypeValueArray = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "precision"
          );
          for (let y = 0; y < dataTypeValueArray.length; y++) {
            if ($event.target === elementsArray[x]) {
              let e = elementsArray[
                x
              ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
                "precision"
              )[y];
              e.removeAttribute("disabled");
            }
          }
        }
      }
    } else if (inputdata.name == "shortenNumber") {
      let elementsArray = document.querySelectorAll('*[id^="shortenNumber"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        if ($event.target.value === "on") {
          let dataTypeValueArray = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "precision"
          );
          for (let y = 0; y < dataTypeValueArray.length; y++) {
            if ($event.target === elementsArray[x])
              elementsArray[
                x
              ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
                "precision"
              )[y]["disabled"] = "true";
          }
        }
      }
    } else if (inputdata.id.includes("startatmin")) {
      let elementsArray = document.querySelectorAll('*[id^="startatmin"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let minArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "div.startatmin input[type='number']"
        );
        for (let y = 0; y < minArray.length; y++) {
          if ($event.target === elementsArray[x]) {
            elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
              "div.startatmin input[type='number']"
            )[y]["disabled"] = false;
          }
        }
      }
    } else if (inputdata.id.includes("dynamic-min")) {
      let elementsArray = document.querySelectorAll('*[id^="dynamic-min"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let minArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "div.startatmin input[type='number']"
        );
        for (let y = 0; y < minArray.length; y++) {
          if ($event.target == elementsArray[x]) {
            elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
              "div.startatmin input[type='number']"
            )[y]["disabled"] = true;
          }
        }
      }
    } else if (inputdata.id.includes("startatzero")) {
      let elementsArray = document.querySelectorAll('*[id^="startatzero"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let minArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "div.startatmin input[type='number']"
        );

        for (let y = 0; y < minArray.length; y++) {
          if ($event.target == elementsArray[x]) {
            elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
              "div.startatmin input[type='number']"
            )[y]["disabled"] = true;
          }
        }
      }
    } else if (inputdata.id.includes("endatmax")) {
      let elementsArray = document.querySelectorAll('*[id^="endatmax"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let maxArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "div.endatmax input[type='number']"
        );

        for (let y = 0; y < maxArray.length; y++) {
          if ($event.target === elementsArray[x]) {
            elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
              "div.endatmax input[type='number']"
            )[y]["disabled"] = false;
          }
        }
      }
    } else if (inputdata.id.includes("dynamic-max")) {
      let elementsArray = document.querySelectorAll('*[id^="dynamic-max"]');
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let minArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          "div.endatmax input[type='number']"
        );

        for (let y = 0; y < minArray.length; y++) {
          if ($event.target == elementsArray[x]) {
            elementsArray[
              x
            ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
              "div.endatmax input[type='number']"
            )[y]["disabled"] = true;
          }
        }
      }
    } else {
      let elementsArray: any;
      elementsArray = document.querySelectorAll(inputdata.queryselectorValue);
      for (let l = 0; l < elementsArray.length; l++) {
        if ($event.target.checked) {
          elementsArray[l].removeAttribute("disabled");
          elementsArray[l].removeAttribute("style");
        } else {
          elementsArray[l]["disabled"] = "true";
          elementsArray[l].setAttribute("style", "color: #a9a9a9;");
        }
      }
    }
  }

  autoManualScenarioHandler(inputData, $event, index) {
    let object = this.AllData;

    if (window["divdrawerconfig"].currentWidget.type == "Bar") {
      if ($event.target.id.includes("autosetTick-y")) {
        let i;
        object.axes[1].majorTicks = "true";
        object.axes[1].minorTicks = "true";
        object.axes[1].microTicks = "false";
        object.axes[1].majorLabels = "true";
        object.axes[1].minorLabels = "false";
        object.axes[1].microLabels = "false";

        object.axes[1].droplabels = "true";
        if (object.axes[1].majorTickStep !== undefined)
          delete object.axes[1].majorTickStep;
        if (object.axes[1].minorTickStep !== undefined)
          delete object.axes[1].minorTickStep;
        if (object.axes[1].microTickStep !== undefined)
          delete object.axes[1].microTickStep;

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setstep-y"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetstepy";

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setlabel-y"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetlabely";
      }
      if ($event.target.id.includes("autosetTick-x")) {
        let i;
        object.axes[0].majorTicks = "true";
        object.axes[0].minorTicks = "false";
        object.axes[0].microTicks = "false";
        object.axes[0].majorLabels = "true";
        object.axes[0].minorLabels = "false";
        object.axes[0].microLabels = "false";

        object.axes[0].droplabels = "true";
        if (object.axes[0].majorTickStep !== undefined)
          delete object.axes[0].majorTickStep;
        if (object.axes[0].minorTickStep !== undefined)
          delete object.axes[0].minorTickStep;
        if (object.axes[0].microTickStep !== undefined)
          delete object.axes[0].microTickStep;

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setstep-x"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetstepx";

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setlabel-x"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetlabelx";
      }
    } else {
      if (index == 1) {
        let i;
        if ($event.target.id.includes("autosetTick-y")) {
          object.axes[1].majorTicks = "true";
          object.axes[1].minorTicks = "true";
          object.axes[1].microTicks = "false";
          object.axes[1].majorLabels = "true";
          object.axes[1].minorLabels = "false";
          object.axes[1].microLabels = "false";

          object.axes[1].droplabels = "true";
          if (object.axes[1].majorTickStep !== undefined)
            delete object.axes[1].majorTickStep;
          if (object.axes[1].minorTickStep !== undefined)
            delete object.axes[1].minorTickStep;
          if (object.axes[1].microTickStep !== undefined)
            delete object.axes[1].microTickStep;

          for (
            i = 0;
            i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
            i++
          ) {
            if (
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
              "setstep-y"
            )
              break;
          }
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
            undefined
          )
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
              "autosetstepy1";

          for (
            i = 0;
            i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
            i++
          ) {
            if (
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
              "setlabel-y"
            )
              break;
          }
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
            undefined
          )
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
              "autosetlabely1";
        }
      }

      if (index == 2) {
        let i;
        if ($event.target.id.includes("autosetTick-y")) {
          if (object.axes[2] !== undefined) {
            object.axes[2].majorTicks = "true";
            object.axes[2].minorTicks = "true";
            object.axes[2].microTicks = "false";
            object.axes[2].majorLabels = "true";
            object.axes[2].minorLabels = "false";
            object.axes[2].microLabels = "false";

            object.axes[2].droplabels = "true";
            if (object.axes[2].majorTickStep !== undefined)
              delete object.axes[2].majorTickStep;
            if (object.axes[2].minorTickStep !== undefined)
              delete object.axes[2].minorTickStep;
            if (object.axes[2].microTickStep !== undefined)
              delete object.axes[2].microTickStep;

            for (
              i = 0;
              i <
              window["divdrawerconfig"].currentWidget["checkedRadios"].length;
              i++
            ) {
              if (
                window["divdrawerconfig"].currentWidget["checkedRadios"][
                  i
                ][0] == "setstep-y"
              )
                break;
            }
            if (
              window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
              undefined
            )
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][2] =
                "autosetstepy2";

            for (
              i = 0;
              i <
              window["divdrawerconfig"].currentWidget["checkedRadios"].length;
              i++
            ) {
              if (
                window["divdrawerconfig"].currentWidget["checkedRadios"][
                  i
                ][0] == "setlabel-y"
              )
                break;
            }
            if (
              window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
              undefined
            )
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][2] =
                "autosetlabely2";
          }
        }
      }

      if ($event.target.id.includes("autosetTick-x")) {
        let i;
        object.axes[0].majorTicks = "true";
        object.axes[0].minorTicks = "false";
        object.axes[0].microTicks = "false";
        object.axes[0].majorLabels = "true";
        object.axes[0].minorLabels = "false";
        object.axes[0].microLabels = "false";

        object.axes[0].droplabels = "true";
        if (object.axes[0].majorTickStep !== undefined)
          delete object.axes[0].majorTickStep;
        if (object.axes[0].minorTickStep !== undefined)
          delete object.axes[0].minorTickStep;
        if (object.axes[0].microTickStep !== undefined)
          delete object.axes[0].microTickStep;

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setstep-x"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetstepx";

        for (
          i = 0;
          i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
          i++
        ) {
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
            "setlabel-x"
          )
            break;
        }
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i] !==
          undefined
        )
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] =
            "autosetlabelx";
      }
    }
  }

  toggleElement(inputData, $event, index) {
    const value = $event.target.value;
    if (value === "string" || value === "Boolean") {
      let numberEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "number"
      );
      let i;
      for (i = 0; i < numberEle.length; i++) {
        numberEle[i].style.display = "none";
      }
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "date"
      );
      let j;
      for (j = 0; j < dateEle.length; j++) {
        dateEle[j].style.display = "none";
      }
      this.AllData.columns[index].labeltype = "string";
    } else if (value === "date") {
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "date"
      );
      let k;
      for (k = 0; k < dateEle.length; k++) {
        dateEle[k].style.display = "block";
      }
      let numberEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "number"
      );
      let l;
      for (l = 0; l < numberEle.length; l++) {
        numberEle[l].style.display = "none";
      }
      let coldata = window.divdrawerconfig.currentWidget.columns[index];
      if(coldata){
        coldata.labelformat = "";
        coldata.labeltype = "";
        coldata.labelunit = "";
      }
    } else if (value === "number") {
      let numberEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "number"
      );
      let m;
      for (m = 0; m < numberEle.length; m++) {
        numberEle[m].style.display = "block";
      }
      this.AllData.columns[index].labeltype = "number";
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "date"
      );
      let n;
      for (n = 0; n < dateEle.length; n++) {
        dateEle[n].style.display = "none";
      }
    } else {
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "date"
      );
      let o;
      for (o = 0; o < dateEle.length; o++) {
        dateEle[o].style.display = "block";
      }
      let numberEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "number"
      );
      let p;
      for (p = 0; p < numberEle.length; p++) {
        numberEle[p].style.display = "none";
      }
      let coldata = window.divdrawerconfig.currentWidget.columns[index];
      if(coldata){
        coldata.labelformat = "";
        coldata.labeltype = "";
        coldata.labelunit = "";
      }
    }
  }
  /**
   * @param inputdata chart template json data
   * @param $event event triger from element 
   * @param type 
   */  
  dateSampleFormat(inputdata,$event,type){
    $($event.target).removeClass("invalid-field"); // date sample format
    if(!$("#labeltype"+ type).val()){
      $("#labeltype"+ type).addClass("invalid-field");
    }
  }

  changeType(
    inputdata,
    $event,
    type,
    displayFormatValue?: any,
    selectEle?: any
  ) {
    let value, dateEle, options, selectedVal;

    if (displayFormatValue || selectEle) {
      value = displayFormatValue;
      selectedVal = selectEle;
      options = $(selectEle).find("option");
    } else {
      value = $event.target.value;
      dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        "labelFormat"
      );
      options = dateEle[0].lastElementChild.lastElementChild.options;
      selectedVal = $(dateEle[0].lastElementChild.lastElementChild);
      $($event.target).removeClass("invalid-field"); // date format
      $(selectedVal).addClass("invalid-field"); // date sample format
    }
    options = $(options).filter( "[value!='']" );
    $(options).css("display", "block");

    for (let i = 0; i < options.length; i++) {
      let cateogory = $(options[i]).attr("data-category");
      if (value == "date" && cateogory == "DATE") {
        continue;
      } else if (value == "time" && cateogory == "TIME") {
        continue;
      } else if (value == "date and time" && cateogory == "DATE_AND_TIME") {
        continue;
      }
      if (value == ''){
        continue;
      }
      options[i].style.display = "none";
    }
    selectedVal.val("");
    window.appnamespace.tabregister[window.appnamespace.currentkey]
              .clickedButton = selectedVal;
  }

  //If connector is used, this function sets some fields to readonly
  setReadonly(inputData, colapsTabIndex) {
    // if( inputData.id == 'datadefination' ) {
    //   return true;
    // }
    if (inputData.disableOndynamic === "true"){
      if(window["divdrawerconfig"].currentWidget.type.toLowerCase() == ChartTypes.BADGE.toLowerCase() && inputData.name == "value"){
        return this.getEnableDisableStatus('badgeField');
      }  else if (inputData.name === "store" && inputData.mapWith === "series"){
        return this.getEnableDisableStatus('storeInputField',colapsTabIndex);
      } else if (this.sourceType !== "default" && this.sourceType !== undefined){
        return true;
      }
    }

    if (inputData.disableOnSavedDD === "true") {
      if (this.sourceType == "default") {
        if (inputData.name == "store") if (colapsTabIndex == 0) return true;
      }
    }

    if (inputData.name === "field") {
      return this.getEnableDisableStatus('gridField',colapsTabIndex)
    }
    if (inputData.mapWith === "series") {
      
      if (
        inputData.name === "labelColumn" ||
        inputData.name === "value" ||
        inputData.name === "seriesColumn" || 
        inputData.name == "label" ||
        inputData.name == "name"
      ) {
        return this.getEnableDisableStatus('seriesField',colapsTabIndex)
      }
    }
    if (inputData.name === "type" && inputData.mapWith === "plots") {
      if (colapsTabIndex === 0) return true;
    }

    if (inputData.hasOwnProperty("disabled") && inputData.disabled && inputData.disabled !== null) return inputData.disabled;
    else return false;
  }

  getEnableDisableStatus(type, colapsTabIndex?) {
    let disableStatus = false
    let currentWidget = window["divdrawerconfig"].currentWidget
    switch (type) {
      case 'badgeField': {
        if (currentWidget.hasOwnProperty('transformations') && currentWidget.transformations.length > 0){
          return false;
        } else if (currentWidget.hasOwnProperty("isOmniQueryModified")) {
          let isOmniQueryModified = JSON.parse(currentWidget.isOmniQueryModified);
          disableStatus = !isOmniQueryModified;
        } else if (this.sourceType !== "default" && this.sourceType !== undefined){
          return true;
        }
      }
        break;
      case 'storeInputField': {
        let addButton = document.querySelector("button[id='addSERIES']");
        if (currentWidget.hasOwnProperty('transformations') && currentWidget.transformations.length > 0) {
          $("button[id='addSERIES']").prop('disabled', false);
          return false;
        } else if (this.sourceType !== "default" && addButton && addButton["disabled"] == false && currentWidget.series[colapsTabIndex].labelColumn == "") {
          currentWidget.series[colapsTabIndex].isManuallyAdded = true;
          disableStatus = false
        } else if (addButton && currentWidget.series[colapsTabIndex].hasOwnProperty("isManuallyAdded")) {
          disableStatus = addButton["disabled"];
        } else if (this.sourceType !== "default" && this.sourceType !== undefined){
          return true;
        }
      }
        break
      case 'gridField': {
        let addButton = document.querySelector("button[id='addcolumn']");
        if (currentWidget.hasOwnProperty('transformations') && currentWidget.transformations.length > 0){
          $("button[id='addcolumn']").prop('disabled', false);
          return false;
        } else if (currentWidget.columns[colapsTabIndex].hasOwnProperty("isOmniQueryModified")) {
          let isOmniQueryModified = JSON.parse(currentWidget.columns[colapsTabIndex].isOmniQueryModified);
          if (addButton && isOmniQueryModified) addButton["disabled"] = false
          disableStatus = !isOmniQueryModified
        } else if (this.sourceType !== "default" && addButton && addButton["disabled"] == false && currentWidget.columns[colapsTabIndex].field == "") {
          currentWidget.columns[colapsTabIndex].isManuallyAdded = true;
          disableStatus = false
        } else if (addButton && currentWidget.columns[colapsTabIndex].hasOwnProperty("isManuallyAdded")) {
          disableStatus = addButton["disabled"];
        } else if (this.sourceType !== "default" && this.sourceType !== undefined) {
          disableStatus = true;
        }
      }
        break;
      case 'seriesField': {
        let addButton = document.querySelector("button[id='addSERIES']");
        if ( colapsTabIndex != undefined && currentWidget.series[colapsTabIndex] != undefined ) {
          if (currentWidget.hasOwnProperty('transformations') && currentWidget.transformations.length > 0) {
            $("button[id='addSERIES']").prop('disabled', false);
            return false;
          } else if (colapsTabIndex != undefined && currentWidget.series[colapsTabIndex].hasOwnProperty("isOmniQueryModified")) {
            let isOmniQueryModified = JSON.parse(currentWidget.series[colapsTabIndex].isOmniQueryModified);
            if (addButton && isOmniQueryModified) addButton["disabled"] = false
            disableStatus = !isOmniQueryModified
          } else if (colapsTabIndex != undefined && this.sourceType !== "default" && addButton && addButton["disabled"] == false && currentWidget.series[colapsTabIndex].labelColumn == "") {
            currentWidget.series[colapsTabIndex].isManuallyAdded = true;
            disableStatus = false
          } else if (colapsTabIndex != undefined && addButton && currentWidget.series[colapsTabIndex].hasOwnProperty("isManuallyAdded")) {
            disableStatus = addButton["disabled"];
          } else if (this.sourceType !== "default" && this.sourceType !== undefined) {
            disableStatus = true;
          }
        }
      }
        break;
      default:
        break;
    }
    return disableStatus;
  }
  getDefaultSelection(inputData, colapsTabIndex) {
    let a;
    if (inputData.name === "vAxis" && inputData.mapWith === "plots") {
      if (colapsTabIndex === 0) return "Default Left Y-axis";
      else return "Right Y-axis";
    } else {
      if (inputData.defaultSelection !== null)
        return inputData.defaultSelection;
      else return "";
    }
  }

  getDisabled(inputData, colapsTabIndex) {
    if (inputData.name === "type" && inputData.mapWith === "plots") {
      if (colapsTabIndex === 0) return true;
      else return false;
    }
    if (inputData.id == "borderStyle") {
      if (window["divdrawerconfig"].currentWidget.layoutClass == "noBorder")
        return true;
      else return false;
    }
    if (window["divdrawerconfig"].currentWidget.type == "QuadrantMotion") {
      let checkbox;
      if (inputData.name == "bottomX" || inputData.name == "bottomY") {
        checkbox = document.getElementById("bottomPosition");
        if (checkbox["checked"] == true) return false;
        else return true;
      } else if (inputData.name == "topX" || inputData.name == "topY") {
        checkbox = document.getElementById("topPosition");
        if (checkbox["checked"] == true) return false;
        else return true;
      } else if (inputData.name == "leftX" || inputData.name == "leftY") {
        checkbox = document.getElementById("leftPosition");
        if (checkbox["checked"] == true) return false;
        else return true;
      } else if (inputData.name == "rightX" || inputData.name == "rightY") {
        checkbox = document.getElementById("rightPosition");
        if (checkbox["checked"] == true) return false;
        else return true;
      } else {
        if (inputData.disabled !== null) return inputData.disabled;
        else return false;
      }
    } else {
      if (inputData.disabled !== null) return inputData.disabled;
      else return false;
    }
  }
  getDisabledForButton(tabDetails) {
    if (tabDetails.tabs[0].tabTitle == "Y-AXIS") {
      if( window["divdrawerconfig"].currentWidget.axes != undefined ) {
        if (window["divdrawerconfig"].currentWidget.axes.length == 3) return true;
      }
    }
    if (tabDetails.tabs[0].tabTitle == "Plot") {
      if (window["divdrawerconfig"].currentWidget.axes != undefined) {
        if (window["divdrawerconfig"].currentWidget.plots.length == 2)
          return true;
      }
    }

    // Below is the condition to disable add another series button for realtime widget from series->series in set data definition
    if (
      tabDetails.tabs[0].tabTitle.toLowerCase() == "series" &&
      window["divdrawerconfig"].currentWidget.isRealTime
    ) {
      return true;
    }
  }

  autotoggle(inputData, $event, index) {
    let toggleMapWith = inputData.toggleClass;
    if ($event.target["checked"]) {
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        toggleMapWith
      );
      let k;
      for (k = 0; k < dateEle.length; k++) {
        dateEle[k].style.display = "block";
      }
    } else {
      let dateEle = $event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
        toggleMapWith
      );
      let k;
      for (k = 0; k < dateEle.length; k++) {
        dateEle[k].style.display = "none";
      }
    }
  }
  columnsizeValue(inputData, $event, index) {
    //let dataTypeElem = document.getElementById('columnsize');
    let inputValue = $event.target.value;
    //let dataTypeValue = dataTypeElem['value'];
    if (inputValue === "small") {
      this.AllData.plots[index].minBarSize = "1";
      this.AllData.plots[index].maxBarSize = "5";
    } else if (inputValue === "medium") {
      this.AllData.plots[index].minBarSize = "3";
      this.AllData.plots[index].maxBarSize = "10";
    } else if (inputValue === "large") {
      this.AllData.plots[index].minBarSize = "5";
      this.AllData.plots[index].maxBarSize = "15";
    }
  }
  columnGapValue(inputData, $event, index) {
    //let dataTypeElem = document.getElementById('gap');
    let inputValue = $event.target.value;

    if (inputValue === "small") {
      this.AllData.plots[index].gap = "3";
    } else if (inputValue === "medium") {
      this.AllData.plots[index].gap = "5";
    } else if (inputValue === "large") {
      this.AllData.plots[index].gap = "10";
    }
  }

  getValueDynamic() {
    this.dataStoreService(500);
  }

  toggleSeriesTypeTab(disableFlag) {
    var radioButtons;
    if (window["divdrawerconfig"].currentWidget.datasource == "default") {
      if (disableFlag) {
        radioButtons = document.querySelectorAll(".seriestyperadio input");
        for (let i = 0; i < radioButtons.length; i++) {
          radioButtons[i]["disabled"] = true;
          radioButtons[i].setAttribute("style", "color: #a9a9a9;");
        }

        window["divdrawerconfig"].currentWidget["disableSeriesTypeTab"] =
          "true";
      } else {
        if (window["divdrawerconfig"].currentWidget.series.length == 1) {
          let empty = true;
          var labelField = document.querySelector('input[name="label"]');
          var labelFieldDynamic = document.querySelector(
            'input[name="labelColumn"]'
          );
          var valueField = document.querySelector('input[name="value"]');
          var dynamiclegendField = document.querySelector(
            'input[name="seriesColumn"]'
          );
          var plotField = document.querySelector('select[id^="plot"]');
          if (labelField !== undefined) {
            if (labelField["value"] !== "") empty = false;
          }
          if (labelFieldDynamic !== undefined) {
            if (labelFieldDynamic["value"] !== "") empty = false;
          }
          if (valueField !== undefined) {
            if (valueField["value"] !== "") empty = false;
          }
          if (dynamiclegendField !== undefined) {
            if (dynamiclegendField["value"] !== "") empty = false;
          }
          if (plotField !== undefined) {
            if (plotField["value"] !== "default") empty = false;
          }

          if (empty) {
            radioButtons = document.querySelectorAll(".seriestyperadio input");
            for (let i = 0; i < radioButtons.length; i++) {
              radioButtons[i]["disabled"] = false;
              radioButtons[i].removeAttribute("style");
            }

            window["divdrawerconfig"].currentWidget["disableSeriesTypeTab"] =
              "false";
          }
        }
      }
    }
  }

  showHideOnInit() {
    setTimeout(() => {
      //show/hide isServer and support bulk data load options
      if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
        let isServerbox = document.querySelector(".paginationCheck");
        let primarykeybox = document.querySelector(".isServerCheck");
        let isServercheckbox = document.querySelector(
          "div.paginationCheck input"
        );
        let paginationcheckbox = document.querySelector("#paginationConf");
        if (paginationcheckbox["checked"]) isServerbox.classList.remove("hide");
        else {
          isServerbox.classList.add("hide");
          primarykeybox.classList.add("hide");
          isServercheckbox["checked"] = false;
        }
        if (isServercheckbox["checked"]) primarykeybox.classList.remove("hide");
        else primarykeybox.classList.add("hide");
      }

      //Hide add another column when data definition is connector

      if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid) {
        if (
          window["divdrawerconfig"].currentWidget.datasource !== "default" &&
          window["divdrawerconfig"].currentWidget.datasource !== undefined
        ) {
          document.getElementById("addcolumn")["disabled"] = true;
        }
      }

      //Hide add another series when data definition is connector

      if (
        window["divdrawerconfig"].currentWidget.datasource !== "default" &&
        window["divdrawerconfig"].currentWidget.datasource !== undefined
      ) {
        let addButton = document.querySelector("button[id='addSERIES']");
        if (addButton !== undefined && addButton !== null)
          addButton["disabled"] = true;
      }

      //to show/hide isEpoch and data depth

      let isEpochElement = document.querySelectorAll("input[name='isepoch']");
      let isNestedElement = document.querySelectorAll("input[name='isnested']");
      for (let i = 0; i < isEpochElement.length; i++) {
        let e = isEpochElement[i];
        if (e !== null && e !== undefined) {
          let dateEle = e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "epoch"
          );
          let k;
          for (k = 0; k < dateEle.length; k++) {
            if (e["checked"]) dateEle[k].classList.remove("hide");
            else dateEle[k].classList.add("hide");
          }
        }
      }
      for (let i = 0; i < isNestedElement.length; i++) {
        let e = isNestedElement[i];
        if (e !== null && e !== undefined) {
          let dateEle = e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "dataDepth"
          );
          let k;
          for (k = 0; k < dateEle.length; k++) {
            if (e["checked"]) dateEle[k].classList.remove("hide");
            else dateEle[k].classList.add("hide");
          }
        }
      }

      //to show hide fields based on dynamic/manual series
      if (window["divdrawerconfig"].currentWidget.dynamicseries === "true") {
        let elementsArray = document.querySelectorAll(".nondynamicfield");
        for (let l = 0; l < elementsArray.length; l++) {
          elementsArray[l]["style"].display = "none";
        }
        let dynamicfield = document.querySelectorAll(".dynamicfield");
        for (let l = 0; l < dynamicfield.length; l++) {
          dynamicfield[l]["style"].display = "block";
        }
      } else {
        let dynamicfield = document.querySelectorAll(".dynamicfield");
        for (let l = 0; l < dynamicfield.length; l++) {
          dynamicfield[l]["style"].display = "none";
        }
        let elementsArray = document.querySelectorAll(".nondynamicfield");
        for (let l = 0; l < elementsArray.length; l++) {
          elementsArray[l]["style"].display = "block";
        }
      }
      //series first tab
      if (
        document.getElementsByClassName("dynamicpanel")[0] !== null &&
        document.getElementsByClassName("dynamicpanel")[0] !== undefined
      ) {
        if (
          window["divdrawerconfig"].currentWidget.datasource === "default" ||
          window["divdrawerconfig"].currentWidget.datasource == undefined
        ) {
          document.getElementsByClassName("dynamicpanel")[0]["style"].display =
            "none";
          document.getElementsByClassName("manualpanel")[0]["style"].display =
            "block";
          document.getElementById("othrDetails")["style"].display = "none";
        } else {
          document.getElementsByClassName("dynamicpanel")[0]["style"].display =
            "block";
          let manualPanel = document.getElementsByClassName("manualpanel")[0];
          let parentNode = manualPanel.parentElement;
          parentNode.removeChild(manualPanel);
          document.getElementById("othrDetails")["style"].display = "block";
        }
        if (window["divdrawerconfig"].currentWidget.dynamicseries == "true")
          document.getElementById("othrDetails")["style"].display = "block";
      }

      //For grid-columns-datatype
      let dataTypeElem = document.querySelectorAll("select.dataType");

      for (let x = 0; x < dataTypeElem.length; x++) {
        let dataTypeValue = dataTypeElem[x]["value"];
        if (dataTypeValue === "date" || dataTypeValue === "time") {
          let dataTypeValueArray = dataTypeElem[
            x
          ].parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "date"
          );
          for (let y = 0; y < dataTypeValueArray.length; y++) {
            dataTypeElem[
              x
            ].parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              "date"
            )[y]["style"].display = "block";
          }
        } else if (dataTypeValue === "number") {
          let dataTypeValueArray = dataTypeElem[
            x
          ].parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            "number"
          );
          for (let y = 0; y < dataTypeValueArray.length; y++) {
            dataTypeElem[
              x
            ].parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
              "number"
            )[y]["style"].display = "block";
          }
        }
      }
      //keep elements in toolbar tab disabled if hide toolbar is checked
      let hideToolbarCheck = document.querySelector("div.hideTitlebar input");
      if (hideToolbarCheck !== null && hideToolbarCheck !== undefined) {
        let elementsArray = document.querySelectorAll("div.hideTitleCheck *");
        for (let l = 0; l < elementsArray.length; l++) {
          if (hideToolbarCheck["checked"]) {
            elementsArray[l]["disabled"] = "disabled";
            elementsArray[l].setAttribute("style", "color: #a9a9a9;");
          } else {
            elementsArray[l]["disabled"] = false;
            elementsArray[l].removeAttribute("style");
          }
        }
      }
      //keep elements in legends tab disabled if show legends is unchecked
      let legendElements = document.querySelectorAll("div.showlegend *");
      let showLegendsBox = document.querySelector("#showlegends");
      for (let l = 0; l < legendElements.length; l++) {
        if (showLegendsBox["checked"]) {
          legendElements[l].removeAttribute("disabled");
          legendElements[l].removeAttribute("style");
        } else {
          legendElements[l]["disabled"] = "true";
          legendElements[l].setAttribute("style", "color: #a9a9a9;");
        }
      }

      //Hide right y-axis initially
      let yaxispanel = document.querySelector("#Y-AXIS1");
      if (
        yaxispanel !== null &&
        yaxispanel !== undefined &&
        window["divdrawerconfig"].currentWidget.axes.length !== 3
      ) {
        let yaxispanelparentdiv = yaxispanel.parentElement;
        yaxispanelparentdiv.classList.add("hide");
      }

      //To show/hide Column header name in x-axis
      let columnHeaderCheckbox = document.getElementById("columnheader");
      if (columnHeaderCheckbox !== null && columnHeaderCheckbox !== undefined) {
        let dateEle = columnHeaderCheckbox.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
          "columnheader"
        );
        let k;
        for (k = 0; k < dateEle.length; k++) {
          if (columnHeaderCheckbox["checked"])
            dateEle[k]["style"].display = "block";
          else dateEle[k]["style"].display = "none";
        }
      }

      //To show/unit Add unit panel in badge
      let addUnitPanel = document.querySelector(".addUnit");
      let addUnitCheckbox = document.getElementById("unitbar");
      if (addUnitCheckbox !== undefined && addUnitCheckbox !== null)
        if (addUnitCheckbox["checked"]) addUnitPanel.classList.remove("hide");
      //To show/unit Add target panel in bullet
      let addTargetPanel = document.querySelector(".addTarget");
      let addTargetCheckbox = document.getElementById("addtarget");
      if (addTargetCheckbox !== undefined && addTargetCheckbox !== null)
        if (addTargetCheckbox["checked"])
          addTargetPanel.classList.remove("hide");
      //To show/unit Add title panel in bullet
      let addTitlePanel = document.querySelector(".addTitle");
      let addTitleCheckbox = document.getElementById("addTitle");
      if (addTitleCheckbox !== undefined && addTitleCheckbox !== null)
        if (addTitleCheckbox["checked"]) addTitlePanel.classList.remove("hide");
      //To show show tooltip in Treemap chart
      let addTreemap = document.querySelector(".treemapTooltip");
      let addTreemapCheckbox = document.getElementById("treemapTooltip");
      if (addTreemapCheckbox !== undefined && addTreemapCheckbox !== null)
        if (addTreemapCheckbox["checked"]) addTreemap.classList.remove("hide");
      //To show show labels in Treempa chart
      let addtreemapShowLabel = document.querySelector(".treemapShowLabel");
      let treemapShowLabelCheckbox = document.getElementById(
        "treemapShowLabel"
      );
      if (
        treemapShowLabelCheckbox !== undefined &&
        treemapShowLabelCheckbox !== null
      )
        if (treemapShowLabelCheckbox["checked"])
          addtreemapShowLabel.classList.remove("hide");

      //to show/hide fields in Plots according to chart type
      let elementsArray = document.querySelectorAll('select[id^="chartType"]');
      let class1, class2;

      for (let x = 0; x < elementsArray.length; x++) {
        if (
          elementsArray[x]["value"] === "Lines" ||
          elementsArray[x]["value"] === "Areas"
        ) {
          class1 = "linePlotSelect";
          class2 = "columnPlotSelect";
        }
        if (
          elementsArray[x]["value"] === "ClusteredBars" ||
          elementsArray[x]["value"] === "ClusteredColumns" ||
          elementsArray[x]["value"] === "StackedColumns" ||
          elementsArray[x]["value"] === "StackedBars"
        ) {
          class1 = "columnPlotSelect";
          class2 = "linePlotSelect";
        }

        let dataTypeValueArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
          class1
        );

        for (let y = 0; y < dataTypeValueArray.length; y++) {
          let e = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            class1
          )[y];
          let e2 = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
            class2
          )[y];
          if( e != undefined) {
            e.classList.remove("hide");
          }
          if(e2 != undefined) {
            e2.classList.add("hide");
          }
        }
      }
      if (
        window["divdrawerconfig"].currentWidget["disableSeriesTypeTab"] ==
        "true"
      ) {
        var seriesTypeRadioButtons = document.querySelectorAll(
          ".seriestyperadio input"
        );
        for (let i = 0; i < seriesTypeRadioButtons.length; i++) {
          seriesTypeRadioButtons[i]["disabled"] = true;
          seriesTypeRadioButtons[i].setAttribute("style", "color: #a9a9a9;");
        }
      }
      if (window["divdrawerconfig"].currentWidget.type == "Badge") {
        let elementsArray = document.querySelectorAll(".allBorder");
        if (window["divdrawerconfig"].currentWidget.layoutClass == "noBorder") {
          for (let i = 0; i < elementsArray.length; i++) {
            elementsArray[i].classList.add("hide");
          }
        }
      }
      if (window["divdrawerconfig"].currentWidget.type == "QuadrantMotion") {
        let targetElements = document.querySelectorAll(".showxaxistitle");
        let checkbox = document.getElementById("showxaxistitle");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
        targetElements = document.querySelectorAll(".showxTicks");
        checkbox = document.getElementById("showxTicks");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
        targetElements = document.querySelectorAll(".showyaxistitle");
        checkbox = document.getElementById("showyaxistitle");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
        targetElements = document.querySelectorAll(".showyTicks");
        checkbox = document.getElementById("showyTicks");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
        targetElements = document.querySelectorAll(".quadrantTitle");
        checkbox = document.getElementById("quadrantTitle");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
        targetElements = document.querySelectorAll(".titleMotion");
        checkbox = document.getElementById("titleMotion");
        if (checkbox["checked"] == true) {
          for (let i = 0; i < targetElements.length; i++) {
            targetElements[i].classList.remove("hide");
          }
        }
      }
      let radioButtons: any = document.querySelectorAll(
        '.set-properties-wrapper input[type="radio"]:checked'
      );
      /*  radioButtons.forEach((elem)=>{
			elem.click();		
			
				}) */
      for (let j = 0; j < radioButtons.length; j++) {
        radioButtons[j].click();
      }

      this.showHideGridBadgeColumnValue();
      if(!this.isTransformationFlag){
        this.hideTransformationFields();
      } else {
        this.hideNonTransformationFields()
      }
    }, 1000);
  }

  getCheckedRadio(inputData, index, enumChecked, enumIndex) {
    let isYAxis = 0;
    if (index !== undefined) {
      if (
        inputData.radioName == "yt" ||
        inputData.radioName == "minCount" ||
        inputData.radioName == "maxCount" ||
        inputData.radioName == "setstep-y" ||
        inputData.radioName == "setlabel-y"
      ) {
        isYAxis = 1;
      }
    }

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
          inputData.radioName
        )
          break;
      }
      if (i < window["divdrawerconfig"].currentWidget["checkedRadios"].length) {
        if (index == undefined) {
          if (
            inputData.enum == undefined &&
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] ==
              inputData.id
          )
            return true;
          else if (inputData.enum !== undefined) {
            for (let j = 0; j < inputData.enum.length; j++) {
              if (j == enumIndex) {
                if (
                  window["divdrawerconfig"].currentWidget["checkedRadios"][
                    i
                  ][1].includes(inputData.enum[j].name)
                )
                  return true;
                else return false;
              }
            }
          } else return false;
        }
        if (index !== undefined) {
          if (isYAxis == 0) index++;
          if (
            window["divdrawerconfig"].currentWidget["checkedRadios"][i][
              index
            ] !== undefined
          ) {
            let ElementId;
            if (isYAxis == 0) ElementId = inputData.id + (index - 1);
            else ElementId = inputData.id + index;
            if (
              inputData.enum == undefined &&
              window["divdrawerconfig"].currentWidget["checkedRadios"][i][
                index
              ] == ElementId
            ) {
              return true;
            } else if (inputData.enum !== undefined) {
              for (let j = 0; j < inputData.enum.length; j++) {
                if (j == enumIndex) {
                  if (
                    window["divdrawerconfig"].currentWidget["checkedRadios"][i][
                      index
                    ].includes(inputData.enum[j].name)
                  )
                    return true;
                }
              }
            } else return false;
          } else {
            if (inputData.checked !== undefined) return inputData.checked;
            else if (enumChecked !== undefined) {
              if (enumChecked == "true") return true;
              else return false;
            }
          }
        } else {
          if (inputData.checked !== undefined) return inputData.checked;
          else if (enumChecked !== undefined) {
            if (enumChecked == "true") return true;
          } else return false;
        }
      } else {
        if (inputData.checked !== undefined) return inputData.checked;
        else if (enumChecked !== undefined) {
          if (enumChecked == "true") return true;
        } else return false;
      }
    } else if (inputData.checked !== undefined) return inputData.checked;
    else if (enumChecked !== undefined) {
      if (enumChecked == "true") return true;
    } else return false;
  }
  // When set properties is opened first time after chart is dragged, all settings should appear as per default JSON
  buildCheckedRadiosArray() {
    if(window["divdrawerconfig"].currentWidget.type !== rangesChartType.grid ){
    this.formCorrectArray("checkedRadios");
    }
    let widgetData = window["divdrawerconfig"].currentWidget;
    let i;
    let object: any;

    if (
      widgetData.type == "Column" ||
      widgetData.type == "Line" ||
      widgetData.type == "Area" ||
      widgetData.type == "Bar"
    ) {
      if (widgetData.type !== "Bar") {
        //Setting "Auto-set Axis Ticks and Labels to Display" for X-axis
        object = widgetData["axes"][0];
        if (
          object["majorTicks"] == "true" &&
          (object["minorTicks"] == "false" ||
            object["minorTicks"] == undefined) &&
          (object["microTicks"] == "false" ||
            object["microTicks"] == undefined) &&
          object["majorLabels"] == "true" &&
          (object["minorLabels"] == "false" ||
            object["minorLabels"] == undefined) &&
          (object["microLabels"] == "false" ||
            object["microLabels"] == undefined) &&
          object["majorTickStep"] == undefined &&
          object["minorTickStep"] == undefined &&
          object["microTickStep"] == undefined
        ) {
          i = this.findIndexInCheckedRadiosArray("t");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "t";
          }
          widgetData["checkedRadios"][i][1] = "autosetTick-x";
        }
        //else set "manually-set Axis Ticks and Labels to Display" for X-axis
        else {
          i = this.findIndexInCheckedRadiosArray("t");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "t";
          }
          widgetData["checkedRadios"][i][1] = "manualsetTick-x";

          if (
            (object["majorTickStep"] !== undefined &&
              object["majorTickStep"] !== "") ||
            (object["minorTickStep"] !== undefined &&
              object["minorTickStep"] !== "") ||
            (object["microTickStep"] !== undefined &&
              object["microTickStep"] !== "")
          ) {
            i = this.findIndexInCheckedRadiosArray("setstep-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-x";
            }
            widgetData["checkedRadios"][i][1] = "manualsetstepx";
            if (object["majorTickStep"] !== undefined)
              object["majorTicks"] = "true";
          } else {
            i = this.findIndexInCheckedRadiosArray("setstep-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-x";
            }
            widgetData["checkedRadios"][i][1] = "autosetstepx";
          }
          if (
            object["minorLabels"] == "true" ||
            object["microLabels"] == "true"
          ) {
            i = this.findIndexInCheckedRadiosArray("setlabel-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setlabel-x";
            }
            widgetData["checkedRadios"][i][1] = "manualsetlabelx";
          }
        }
        //ticks and labels, axis count setting of y-axis
        //Setting "Auto-set Axis Ticks and Labels to Display" for Y-axis
        for (let j = 1; j < 3; j++) {
          if (widgetData["axes"][j] !== undefined) {
            object = widgetData["axes"][j];
            if (
              object["majorTicks"] == "true" &&
              object["minorTicks"] == "true" &&
              (object["microTicks"] == "false" ||
                object["microTicks"] == undefined) &&
              object["majorLabels"] == "true" &&
              (object["minorLabels"] == "false" ||
                object["minorLabels"] == undefined) &&
              (object["microLabels"] == "false" ||
                object["microLabels"] == undefined) &&
              object["majorTickStep"] == undefined &&
              object["minorTickStep"] == undefined &&
              object["microTickStep"] == undefined
            ) {
              i = this.findIndexInCheckedRadiosArray("yt");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "yt";
              }
              widgetData["checkedRadios"][i][j] = "autosetTick-y" + j;
            }
            //else set "manually-set Axis Ticks and Labels to Display" for Y-axis
            else {
              i = this.findIndexInCheckedRadiosArray("yt");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "yt";
              }
              widgetData["checkedRadios"][i][j] = "manualsetTick-y" + j;

              if (
                (object["majorTickStep"] !== undefined &&
                  object["majorTickStep"] !== "") ||
                (object["minorTickStep"] !== undefined &&
                  object["minorTickStep"] !== "") ||
                (object["microTickStep"] !== undefined &&
                  object["microTickStep"] !== "")
              ) {
                i = this.findIndexInCheckedRadiosArray("setstep-y");
                if (widgetData["checkedRadios"][i] == undefined) {
                  widgetData["checkedRadios"][i] = [];
                  widgetData["checkedRadios"][i][0] = "setstep-y";
                }
                widgetData["checkedRadios"][i][j] = "manualsetstepy" + j;
                if (object["majorTickStep"] !== undefined)
                  object["majorTicks"] = "true";
              } else {
                i = this.findIndexInCheckedRadiosArray("setstep-y");
                if (widgetData["checkedRadios"][i] == undefined) {
                  widgetData["checkedRadios"][i] = [];
                  widgetData["checkedRadios"][i][0] = "setstep-y";
                }
                widgetData["checkedRadios"][i][j] = "autosetstepy" + j;
              }
              if (
                object["minorLabels"] == "true" ||
                object["microLabels"] == "true"
              ) {
                i = this.findIndexInCheckedRadiosArray("setlabel-y");
                if (widgetData["checkedRadios"][i] == undefined) {
                  widgetData["checkedRadios"][i] = [];
                  widgetData["checkedRadios"][i][0] = "setlabel-y";
                }
                widgetData["checkedRadios"][i][j] = "manualsetlabely" + j;
              }
            }
            if (object["includeZero"] == "true") {
              i = this.findIndexInCheckedRadiosArray("minCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "minCount";
              }
              widgetData["checkedRadios"][i][j] = "startatzero" + j;
            } else if (object["min"] !== undefined && object["min"] !== "") {
              i = this.findIndexInCheckedRadiosArray("minCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "minCount";
              }
              widgetData["checkedRadios"][i][j] = "startatmin" + j;
            }
            if (object["max"] !== undefined && object["max"] !== "") {
              i = this.findIndexInCheckedRadiosArray("maxCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "maxCount";
              }
              widgetData["checkedRadios"][i][j] = "endatmax" + j;
            }
          }
        }
      } else {
        //Setting "Auto-set Axis Ticks and Labels to Display" for X-axis
        object = widgetData["axes"][0];
        if (
          object["majorTicks"] == "true" &&
          (object["minorTicks"] == "false" ||
            object["minorTicks"] == undefined) &&
          (object["microTicks"] == "false" ||
            object["microTicks"] == undefined) &&
          object["majorLabels"] == "true" &&
          (object["minorLabels"] == "false" ||
            object["minorLabels"] == undefined) &&
          (object["microLabels"] == "false" ||
            object["microLabels"] == undefined) &&
          object["majorTickStep"] == undefined &&
          object["minorTickStep"] == undefined &&
          object["microTickStep"] == undefined
        ) {
          i = this.findIndexInCheckedRadiosArray("t");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "t";
          }
          widgetData["checkedRadios"][i][1] = "autosetTick-x";
        }
        //else set "manually-set Axis Ticks and Labels to Display" for X-axis
        else {
          i = this.findIndexInCheckedRadiosArray("t");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "t";
          }
          widgetData["checkedRadios"][i][1] = "manualsetTick-x";

          if (
            (object["majorTickStep"] !== undefined &&
              object["majorTickStep"] !== "") ||
            (object["minorTickStep"] !== undefined &&
              object["minorTickStep"] !== "") ||
            (object["microTickStep"] !== undefined &&
              object["microTickStep"] !== "")
          ) {
            i = this.findIndexInCheckedRadiosArray("setstep-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-x";
            }
            widgetData["checkedRadios"][i][1] = "manualsetstepx";
            if (object["majorTickStep"] !== undefined)
              object["majorTicks"] = "true";
          } else {
            i = this.findIndexInCheckedRadiosArray("setstep-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-x";
            }
            widgetData["checkedRadios"][i][1] = "autosetstepx";
          }
          if (
            object["minorLabels"] == "true" ||
            object["microLabels"] == "true"
          ) {
            i = this.findIndexInCheckedRadiosArray("setlabel-x");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setlabel-x";
            }
            widgetData["checkedRadios"][i][1] = "manualsetlabelx";
          }
        }
        /*if (object['includeZero'] == "true") {
					i = this.findIndexInCheckedRadiosArray("minCount");
					if (widgetData["checkedRadios"][i] == undefined) {
						widgetData["checkedRadios"][i] = [];
						widgetData["checkedRadios"][i][0] = "minCount";
					}
					widgetData["checkedRadios"][i][1] = "startatzero";

				}
				else if (object['min'] !== undefined && object['min'] !== "") {
					i = this.findIndexInCheckedRadiosArray("minCount");
					if (widgetData["checkedRadios"][i] == undefined) {
						widgetData["checkedRadios"][i] = [];
						widgetData["checkedRadios"][i][0] = "minCount";
					}
					widgetData["checkedRadios"][i][1] = "startatmin";
				}
				if (object['max'] !== undefined && object['max'] !== "") {
					i = this.findIndexInCheckedRadiosArray("maxCount");
					if (widgetData["checkedRadios"][i] == undefined) {
						widgetData["checkedRadios"][i] = [];
						widgetData["checkedRadios"][i][0] = "maxCount";
					}
					widgetData["checkedRadios"][i][1] = "endatmax";
				}*/
        //ticks and labels, axis count setting of y-axis
        //Setting "Auto-set Axis Ticks and Labels to Display" for Y-axis

        object = widgetData["axes"][1];
        if (
          object["majorTicks"] == "true" &&
          object["minorTicks"] == "true" &&
          (object["microTicks"] == "false" ||
            object["microTicks"] == undefined) &&
          object["majorLabels"] == "true" &&
          (object["minorLabels"] == "false" ||
            object["minorLabels"] == undefined) &&
          (object["microLabels"] == "false" ||
            object["microLabels"] == undefined) &&
          object["majorTickStep"] == undefined &&
          object["minorTickStep"] == undefined &&
          object["microTickStep"] == undefined
        ) {
          i = this.findIndexInCheckedRadiosArray("yt");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "yt";
          }
          widgetData["checkedRadios"][i][1] = "autosetTick-y";
        }
        //else set "manually-set Axis Ticks and Labels to Display" for Y-axis
        else {
          i = this.findIndexInCheckedRadiosArray("yt");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "yt";
          }
          widgetData["checkedRadios"][i][1] = "manualsetTick-y";

          if (
            (object["majorTickStep"] !== undefined &&
              object["majorTickStep"] !== "") ||
            (object["minorTickStep"] !== undefined &&
              object["minorTickStep"] !== "") ||
            (object["microTickStep"] !== undefined &&
              object["microTickStep"] !== "")
          ) {
            i = this.findIndexInCheckedRadiosArray("setstep-y");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-y";
            }
            widgetData["checkedRadios"][i][1] = "manualsetstepy";
            if (object["majorTickStep"] !== undefined)
              object["majorTicks"] = "true";
          } else {
            i = this.findIndexInCheckedRadiosArray("setstep-y");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setstep-y";
            }
            widgetData["checkedRadios"][i][1] = "autosetstepy";
          }
          if (
            object["minorLabels"] == "true" ||
            object["microLabels"] == "true"
          ) {
            i = this.findIndexInCheckedRadiosArray("setlabel-y");
            if (widgetData["checkedRadios"][i] == undefined) {
              widgetData["checkedRadios"][i] = [];
              widgetData["checkedRadios"][i][0] = "setlabel-y";
            }
            widgetData["checkedRadios"][i][1] = "manualsetlabely";
          }
          if (widgetData.type == "Bar") {
            if (object["includeZero"] == "true") {
              i = this.findIndexInCheckedRadiosArray("minCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "minCount";
              }
              widgetData["checkedRadios"][i][1] = "startatzero";
            } else if (object["min"] !== undefined && object["min"] !== "") {
              i = this.findIndexInCheckedRadiosArray("minCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "minCount";
              }
              widgetData["checkedRadios"][i][1] = "startatmin";
            }
            if (object["max"] !== undefined && object["max"] !== "") {
              i = this.findIndexInCheckedRadiosArray("maxCount");
              if (widgetData["checkedRadios"][i] == undefined) {
                widgetData["checkedRadios"][i] = [];
                widgetData["checkedRadios"][i][0] = "maxCount";
              }
              widgetData["checkedRadios"][i][1] = "endatmax";
            }
          }
        }
      }
      //Setting type of series

      i = this.findIndexInCheckedRadiosArray("dynamicseries");
      if (widgetData["checkedRadios"][i] == undefined) {
        widgetData["checkedRadios"][i] = [];
        widgetData["checkedRadios"][i][0] = "dynamicseries";
      }
      if (window["divdrawerconfig"].currentWidget.dynamicseries == "true")
        widgetData["checkedRadios"][i][1] = "Define a Dynamic Series";
      else widgetData["checkedRadios"][i][1] = "Define a Manual Series";

      //Setting legend-horizontal
      object = widgetData["legend"];
      if (object !== undefined) {
        if (object["horizontal"] == "false") {
          i = this.findIndexInCheckedRadiosArray("horizontal");
          if (widgetData["checkedRadios"][i] == undefined) {
            widgetData["checkedRadios"][i] = [];
            widgetData["checkedRadios"][i][0] = "horizontal";
          }
          widgetData["checkedRadios"][i][1] = "Vertical";
        }
      }
    }
    if (widgetData.type == rangesChartType.grid) {
      for (let j = 0; j < widgetData.columns.length; j++) {
        object = widgetData.columns[j];
        if(object["width"] == "" && object["width"] !== undefined){
            widgetData["columns"][j]["columnWidth"] = "autoWidth";
        }else if(object["width"] == undefined){
          widgetData["columns"][j]["columnWidth"] = "autoWidth";
        }
        else{
        if (object["width"] !== undefined && object["width"] !== "") {
          widgetData["columns"][j]["columnWidth"] = "manualWidth";
        }
        }
        if (
          object["ranges"] !== undefined &&
          object["ranges"] !== "" &&
          object["status"] !== undefined &&
          object["status"] !== ""
        ) {
        } else if (
          object["ranges"] !== undefined &&
          object["ranges"] !== "" &&
          object["colors"] !== undefined &&
          object["colors"] !== ""
        ) {
        } else if (object["type"] == "ProgressBar") {
          widgetData["columns"][j]["propOption"] = "progressbar";
        } else{
          widgetData["columns"][j]["propOption"] = "shownumber";
        }
        if (object["shortenNumber"] == "true") {
          widgetData["columns"][j]["precisionOption"] = "shortenNumber";
        }else{
            widgetData["columns"][j]["precisionOption"] = "decimalpointlabel";
        }
        if (object["cellformat"] !== undefined && object["cellformat"] !== "") {
          
        }
      }
    }
  }

  findIndexInCheckedRadiosArray(radioName) {
    let radioArray = window["divdrawerconfig"].currentWidget["checkedRadios"];
    let index;
    if (radioArray.length == 0) return 0;
    for (index = 0; index < radioArray.length; index++) {
      if (radioArray[index][0] == radioName) break;
    }
    return index;
  }

  showIcon(inputData, $event) {
    $event.target.parentElement.parentElement.getElementsByClassName(
      "btn-transparent"
    )[0]["style"].display = "block";
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

  setcolorRangeId(radioName, checkedOption, $event) {
    //const inputValue = $event.target.parentElement.innerText.trim();
    let i;
    if (checkedOption != "" || checkedOption != "undefined") {
      this.AllData[radioName] = checkedOption;
      if (checkedOption == "") checkedOption = "None";
      if (window["divdrawerconfig"].currentWidget["checkedRadios"] == undefined)
        window["divdrawerconfig"].currentWidget["checkedRadios"] = [];
      for (
        i = 0;
        i < window["divdrawerconfig"].currentWidget["checkedRadios"].length;
        i++
      ) {
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] ==
          "colorData"
        )
          break;
      }
      if (
        i == window["divdrawerconfig"].currentWidget["checkedRadios"].length
      ) {
        window["divdrawerconfig"].currentWidget["checkedRadios"][i] = [];
        window["divdrawerconfig"].currentWidget["checkedRadios"][i][0] =
          "colorData";
      }
      window["divdrawerconfig"].currentWidget["checkedRadios"][
        i
      ][1] = checkedOption;
    } else {
      this.AllData[radioName] = "";
    }
  }

  getCheckedColorRange(id, isDefaultChecked) {
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
          "colorData"
        )
          break;
      }

      if (i < window["divdrawerconfig"].currentWidget["checkedRadios"].length) {
        if (
          window["divdrawerconfig"].currentWidget["checkedRadios"][i][1] == id
        )
          return true;
        else return false;
      } else {
        if (isDefaultChecked !== undefined) {
          return isDefaultChecked;
        } else return false;
      }
    } else if (isDefaultChecked !== undefined) {
      return isDefaultChecked;
    } else return false;
  }
  setVAxisDropdownList() {
    // Add or remove right y-axis option in plots->v-axis dropdown
    setTimeout(function() {
      let selectVAxis: any = document.querySelectorAll(
        'select[id^="DefaultAxis"]'
      );

      if (selectVAxis) {
        for (let i = 0; i < selectVAxis.length; i++) {
          if (window["divdrawerconfig"].currentWidget.axes.length == 3) {
            if (selectVAxis[i].childElementCount < 2) {
              selectVAxis[i].add(
                new Option(
                  this.locale.widget.setProperties.plots.yaxisRight,
                  "yright",
                  false,
                  false
                )
              );
            }
          } else selectVAxis[i].remove(1);
        }
      }
    }, 1000);
    if (window["divdrawerconfig"].currentWidget.axes) {
      if (window["divdrawerconfig"].currentWidget.axes.length < 3) {
        if (window["divdrawerconfig"].currentWidget.plots) {
          for (
            let i = 0;
            i < window["divdrawerconfig"].currentWidget.plots.length;
            i++
          ) {
            if (
              window["divdrawerconfig"].currentWidget.plots[i].vAxis == "yright"
            )
              window["divdrawerconfig"].currentWidget.plots[i].vAxis = "y";
          }
        }
      }
    }
  }
  setPlotDropdownList() {
    // Add or remove nondefault plot option in series->plot dropdown
    setTimeout(function() {
      let selectPlot: any = document.querySelectorAll('select[id^="plot"]');

      for (let i = 0; i < selectPlot.length; i++) {
        if (window["divdrawerconfig"].currentWidget.plots.length == 2) {
          if (selectPlot[i].childElementCount < 2) {
            selectPlot[i].add(
              new Option(
                this.locale.widget.series.properties.plot + " 2",
                "nondefault",
                false,
                false
              )
            );
          }
        } else selectPlot[i].remove(1);
      }
    }, 1000);

    if (window["divdrawerconfig"].currentWidget.series) {
      if (window["divdrawerconfig"].currentWidget.plots) {
        if (window["divdrawerconfig"].currentWidget.plots.length < 2) {
          for (
            let i = 0;
            i < window["divdrawerconfig"].currentWidget.series.length;
            i++
          ) {
            if (
              window["divdrawerconfig"].currentWidget.series[i].plot ==
              "nondefault"
            )
              window["divdrawerconfig"].currentWidget.series[i].plot =
                "default";
          }
        }
      }
    }
  }

  findOptioninSelect(element, option) {
    for (let i = 0; i < element.length; i++) {
      if (element[i].value == option) return i;
    }
    return -1;
  }

  updateCSSStyle(inputData, $event) {
    let propertyArray = $event.target.value.split(";");
    let fontWeight, fontStyle, textDecoration, textAlign;

    for (let i = 0; i < propertyArray.length; i++) {
      let prop = propertyArray[i].split(":");
      let propName = prop[0];
      if (propName == "font-weight") {
        fontWeight = prop[1];
      }
      if (propName == "font-style") {
        fontStyle = prop[1];
      }
      if (propName == "text-decoration") {
        textDecoration = prop[1];
      }
      if (propName == "text-align") {
        textAlign = prop[1];
      }
    }
    if (fontWeight == "bold" || fontWeight == "normal") {
      if (inputData.id == "labelStyle") {
        if (fontWeight == "bold")
          document.getElementById("boldfont")["checked"] = true;
        else document.getElementById("boldfont")["checked"] = false;
      }
      if (inputData.id == "valueStyle") {
        if (fontWeight == "bold")
          document.getElementById("valboldfont")["checked"] = true;
        else document.getElementById("valboldfont")["checked"] = false;
      }
      this.AllData[inputData.id] = $event.target.value;
    }
    if (fontStyle == "italic" || fontStyle == "normal") {
      if (inputData.id == "labelStyle") {
        if (fontStyle == "italic")
          document.getElementById("italicfont")["checked"] = true;
        else document.getElementById("italicfont")["checked"] = false;
      }
      if (inputData.id == "valueStyle") {
        if (fontStyle == "italic")
          document.getElementById("valitalicfont")["checked"] = true;
        else document.getElementById("valitalicfont")["checked"] = false;
      }
      this.AllData[inputData.id] = $event.target.value;
    }
    if (textDecoration == "underline" || textDecoration == "none") {
      if (inputData.id == "labelStyle") {
        if (textDecoration == "underline")
          document.getElementById("underlinefont")["checked"] = true;
        else document.getElementById("underlinefont")["checked"] = false;
      }
      if (inputData.id == "valueStyle") {
        if (textDecoration == "underline")
          document.getElementById("valunderlinefont")["checked"] = true;
        else document.getElementById("valunderlinefont")["checked"] = false;
      }
      this.AllData[inputData.id] = $event.target.value;
    }
    if (textAlign == "left") {
      if (inputData.id == "labelStyle") {
        let i = this.findIndexInCheckedRadiosArray("labelStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "left";
      }

      if (inputData.id == "valueStyle") {
        let i = this.findIndexInCheckedRadiosArray("valueStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "left";
      }
      this.AllData[inputData.id] = $event.target.value;
    }
    if (textAlign == "right") {
      if (inputData.id == "labelStyle") {
        let i = this.findIndexInCheckedRadiosArray("labelStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "right";
      }

      if (inputData.id == "valueStyle") {
        let i = this.findIndexInCheckedRadiosArray("valueStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "right";
      }
      this.AllData[inputData.id] = $event.target.value;
    }
    if (textAlign == "center") {
      if (inputData.id == "labelStyle") {
        let i = this.findIndexInCheckedRadiosArray("labelStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "center";
      }

      if (inputData.id == "valueStyle") {
        let i = this.findIndexInCheckedRadiosArray("valueStyle");
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] = "center";
      }
      this.AllData[inputData.id] = $event.target.value;
    }
  }

  setColorPickerFocus(event) {
    event.preventDefault();
    if (
      event.target.parentElement.parentElement.parentElement.parentElement.parentElement.classList.contains(
        "quadfocus"
      )
    ) {
      window["outputStream"].next(["setFocusToSetPropertyElements", event]);
    } else window["outputStream"].next(["setFocusNextToColorPickerOk", event]);
  }

  //Added last interactive element as "+ Add Another Column" button
  setFocusOnColorPicker(event){
    event.preventDefault();
    window["outputStream"].next(["setFocusToSetPropertyElements"]);
  }

  setFocus(event, flag, inputData) {
    let setCustomFocus: boolean = false;
    let hideTitlebarFlag: boolean = false;
    let showlegendsFlag: boolean = false;
    if (flag || flag == "true") {
      if (event.target.classList.contains("colorpicker")) {
        let okButton;
        if (event.target.classList.contains("quadrantColorButton")) {
          okButton =
            event.target.parentElement.childNodes[3].children[0].lastChild
              .children[0];
        } else {
          okButton =
            event.target.parentElement.childNodes[2].children[0].lastChild
              .children[0];
        }
        okButton.addEventListener("click", this.setColorPickerFocus.bind(this));
        return;
      }
      if (event.target.classList.contains("remove-panel")) {
        let condition1, condition2: boolean;
        condition1 = false;
        condition2 = false;
        let addAnotherButton;
        addAnotherButton = event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector(
          "button.add_column"
        );
        if (addAnotherButton.disabled) {
          condition1 = true;
        }
        let ariaExpandedFlag = event.target.parentElement.parentElement
          .querySelector("a")
          .getAttribute("aria-expanded");
        let parentElementLength = window.divdrawerconfig.currentWidget.columns.length-1;
        let deleteButton = document.querySelector("#delete-" + parentElementLength);
        if(event.currentTarget == deleteButton){
          let dataToggleFlag = event.target.parentElement.parentElement
          .querySelector("a")
          .getAttribute("data-toggle"); 
          if(dataToggleFlag !== "collapse"){
            condition2 = true;
          } 
          if(ariaExpandedFlag == "false" || ariaExpandedFlag == null){
            condition2 = true;
          } 
        }
        if (ariaExpandedFlag == "false" || ariaExpandedFlag == null){
          let dataToggleFlag = event.target.parentElement.parentElement
          .querySelector("a")
          .getAttribute("data-toggle"); 
          if(dataToggleFlag !== "collapse"){
            condition2 = true;
          } 
        }
        if (condition1 && condition2) {
          setCustomFocus = true;
        } else {
          return;
        }
      }
      if (inputData !== undefined) {
        if (inputData.id == "axisCount") {
          let condition1, condition2: boolean;
          condition1 = false;
          condition2 = false;
          let axisCountElement;
          if (inputData.mapWithIndex == 0)
            axisCountElement = document.querySelector(
              "#X-AXIS > div > div > form > div:nth-child(4) > div > div > label > button"
            );
          else
            axisCountElement = document.querySelector(
              "#Y-AXIS1 > div > form > div:nth-child(4) > div > div > label > button"
            );
          if (event.target == axisCountElement) {
            condition1 = true;
          }
          let classList =
            event.target.parentElement.parentElement.parentElement.classList;
          if (classList.contains("in")) {
            condition2 = false;
          } else {
            condition2 = true;
          }

          if (condition1 && condition2) {
            setCustomFocus = true;
          } else {
            return;
          }
        }
        if (inputData.id == "max") {
          if (event.target.id == "max" || event.target.id == "max2") {
            setCustomFocus = true;
          } else return;
        }
        if (
          inputData.id == "autosetTick-y" ||
          inputData.id == "autosetTick-x"
        ) {
          if (
            event.target.id == "autosetTick-y" ||
            event.target.id == "autosetTick-x"
          ) {
            setCustomFocus = true;
          } else return;
        }
        if (
          inputData.id == "autosetlabelx" ||
          inputData.id == "autosetlabely"
        ) {
          if (event.target.id.contains("autosetlabel")) {
            setCustomFocus = true;
          } else return;
        }
        if (
          inputData.id == "manualsetlabelx" ||
          inputData.id == "manualsetlabely"
        ) {
          let object = window["divdrawerconfig"].currentWidget.axes;
          if (event.target.name == "setlabel-y") {
            let majorTicksFlag = object[1].majorTicks;
            let minorTicksFlag = object[1].minorTicks;
            let microTicksFlag = object[1].microTicks;
            if (
              majorTicksFlag == "false" &&
              minorTicksFlag == "false" &&
              microTicksFlag == "false"
            ) {
              setCustomFocus = true;
            } else {
              return;
            }
          } else if (event.target.name == "setlabel-x") {
            let majorTicksFlag = object[0].majorTicks;
            let minorTicksFlag = object[0].minorTicks;
            let microTicksFlag = object[0].microTicks;
            if (
              majorTicksFlag == "false" &&
              minorTicksFlag == "false" &&
              microTicksFlag == "false"
            ) {
              setCustomFocus = true;
            } else {
              return;
            }
          } else {
            return;
          }
        }
        if (
          inputData.id == "majorLabels-x" ||
          inputData.id == "majorLabels-y"
        ) {
          let object = window["divdrawerconfig"].currentWidget.axes;
          let axisNum;
          if (inputData.id == "majorLabels-x") axisNum = 0;
          else axisNum = 1;

          if (
            event.target.id == "majorLabels-x" ||
            event.target.id == "majorLabels-y"
          ) {
            let majorTicksFlag = object[axisNum].majorTicks;
            let minorTicksFlag = object[axisNum].minorTicks;
            let microTicksFlag = object[axisNum].microTicks;
            if (
              majorTicksFlag == "true" &&
              minorTicksFlag == "false" &&
              microTicksFlag == "false"
            ) {
              setCustomFocus = true;
            } else {
              return;
            }
          }
        }
        if (
          inputData.id == "minorLabels-x" ||
          inputData.id == "minorLabels-y"
        ) {
          let object = window["divdrawerconfig"].currentWidget.axes;
          let axisNum;
          if (inputData.id == "minorLabels-x") axisNum = 0;
          else axisNum = 1;

          if (
            event.target.id == "minorLabels-x" ||
            event.target.id == "minorLabels-y"
          ) {
            let majorTicksFlag = object[axisNum].majorTicks;
            let minorTicksFlag = object[axisNum].minorTicks;
            let microTicksFlag = object[axisNum].microTicks;
            if (
              (majorTicksFlag == "false" &&
                minorTicksFlag == "true" &&
                microTicksFlag == "false") ||
              (majorTicksFlag == "true" &&
                minorTicksFlag == "true" &&
                microTicksFlag == "false")
            ) {
              setCustomFocus = true;
            } else {
              return;
            }
          }
        }
        if (
          inputData.id == "microLabels-x" ||
          inputData.id == "microLabels-y"
        ) {
          let object = window["divdrawerconfig"].currentWidget.axes;
          let axisNum;
          if (inputData.id == "microLabels-x") axisNum = 0;
          else axisNum = 1;

          if (
            event.target.id == "microLabels-x" ||
            event.target.id == "microLabels-y"
          ) {
            let majorTicksFlag = object[axisNum].majorTicks;
            let minorTicksFlag = object[axisNum].minorTicks;
            let microTicksFlag = object[axisNum].microTicks;
            if (
              (majorTicksFlag == "false" &&
                minorTicksFlag == "false" &&
                microTicksFlag == "true") ||
              (majorTicksFlag == "true" &&
                minorTicksFlag == "false" &&
                microTicksFlag == "true") ||
              (majorTicksFlag == "true" &&
                minorTicksFlag == "true" &&
                microTicksFlag == "true") ||
              (majorTicksFlag == "false" &&
                minorTicksFlag == "true" &&
                microTicksFlag == "true")
            ) {
              setCustomFocus = true;
            } else {
              return;
            }
          }
        }
        if (inputData.id == "gap") {
          if (event.target.id == "gap1") {
            setCustomFocus = true;
          } else return;
        }
        /* if (inputData.id == "rangegap") {
					if (event.target.id == "align_Autorangegap") {
						setCustomFocus = true;
					}
					else
						return;
				} */
        if (
          inputData.id.includes("align_Define a Manual Series") ||
          inputData.id.includes("align_Define a Dynamic Series")
        ) {
          setCustomFocus = true;
        }
        if (inputData.id == "labelsortcolumn") {
          if (event.target.id == "labelsortcolumn") setCustomFocus = true;
          else return;
        }
        if (inputData.id == "markers") {
          if (event.target.id == "markers1") setCustomFocus = true;
          else return;
        }
        if (inputData.id == "hideTitlebar") {
          let hideTitlebar = document.querySelector("#hideTitlebar");
          hideTitlebarFlag = hideTitlebar["checked"];
          if (event.target.id == "hideTitlebar") {
            if (hideTitlebarFlag) setCustomFocus = true;
            else return;
          }
        }
        if (inputData.id == "showlegends") {
          let showlegends = document.querySelector("#showlegends");
          showlegendsFlag = showlegends["checked"];
          if (event.target.id == "showlegends") {
            if (!showlegendsFlag) setCustomFocus = true;
            else return;
          }
        }
        if (inputData.id == "unitbar") {
          if (event.target.checked) return;
          if (window["divdrawerconfig"].currentWidget.type == "Sankey") {
            setCustomFocus = true;
          }
        }
        if (
          inputData.id == "isnested" &&
          document.querySelector("div .btn-wrapper #addSERIES")["disabled"]
        ) {
          if (event.target.id == "isnested0" && event.target.checked == false) {
            setCustomFocus = true;
          } else {
            return;
          }
        }
        if (
          inputData.id == "dataDepth" &&
          document.querySelector("div .btn-wrapper #addSERIES")["disabled"]
        ) {
          if (event.target.id == "dataDepth0") {
            setCustomFocus = true;
          } else {
            return;
          }
        }
        if (
          inputData.id == "isnested" &&
          document.querySelector("div .btn-wrapper #addSERIES")["disabled"] ==
            false
        ) {
          return;
        }
        if (
          inputData.id == "dataDepth" &&
          document.querySelector("div .btn-wrapper #addSERIES")["disabled"] ==
            false
        ) {
          return;
        }
        if (
          inputData.id == "charLength" ||
          inputData.id == "showyTicks" ||
          inputData.id == "titleMotion" ||
          inputData.id == "addTitle" ||
          inputData.id == "treemapShowLabel"
        ) {
          if (event.target.checked) return;
        }
        if (
          inputData.id == "circularGauge" ||
          inputData.id == "circularGauge1" ||
          inputData.id == "chartinnergauge"
        ) {
          if (
            event.target.parentElement.parentElement.parentElement.parentElement.classList.contains(
              "in"
            )
          )
            return;
          else setCustomFocus = true;
        }

        if (setCustomFocus) {
          event.preventDefault();
          window["outputStream"].next(["setFocusToSetPropertyElements"]);
          return;
        }
        if (inputData.id == "widgetareastyleBadge") {
          if (event.target.id == "widgetareastyleBadge") {
            event.preventDefault();
            window["outputStream"].next(["setFocusToWidgetAreaStyleBadge"]);
          } else return;
        }
        if (inputData.name == "horizontal" && event.target.checked) {
          if (event.target.name == "horizontal") {
            setCustomFocus = true;
          }
        }
      }
      if (setCustomFocus) {
        event.preventDefault();
        window["outputStream"].next(["setFocusToSetPropertyElements"]);
        return;
      }
      event.preventDefault();
      window["outputStream"].next(["setFocusToSetPropertyElements"]);
      if (
        event.target.classList.contains("add_column") &&
        event.type == "click" &&
        event.target.id == "addy-axis"
      ) {
        setTimeout(function() {
          window["outputStream"].next(["setFocusAfterAdd", "Y-axis"]);
        }, 0);
      }
      if (
        event.target.classList.contains("add_column") &&
        event.type == "click" &&
        event.target.id == "addPlots"
      ) {
        setTimeout(function() {
          window["outputStream"].next(["setFocusAfterAdd", "Plot"]);
        }, 0);
      }
      if (
        event.target.classList.contains("add_column") &&
        event.type == "click" &&
        event.target.id == "addSERIES"
      ) {
        setTimeout(function() {
          window["outputStream"].next(["setFocusAfterAdd", "Series"]);
        }, 0);
        setTimeout(() => {
          this.setDateTimeFormatPicker();
        }, 600);
      }
      if (
        event.target.classList.contains("add_column") &&
        event.type == "click" &&
        event.target.id == "addcolumn"
      ) {
        setTimeout(function() {
          window["outputStream"].next(["setFocusAfterAdd", "Columns"]);
        }, 0);
        setTimeout(() => {
          this.setDateTimeFormatPicker();
        }, 600);
      }
    } else {
      if(event.target.id == "dataType" + (window.divdrawerconfig.currentWidget.columns.length-1) ){
        let addanotherCol = document.getElementById("addcolumn")["disabled"]; 
        if(event.currentTarget.value == "string" || event.currentTarget.value == "Boolean"){
        if(addanotherCol == true){
        let othersTab = document.getElementById("widgetProperty-1-Others");
         if(othersTab){
          event.preventDefault();
          othersTab.focus();
        }
      }}
      }
      if(event.target.id == "labelFormat"+ (window.divdrawerconfig.currentWidget.columns.length-1) ){
        let addanotherCol = document.getElementById("addcolumn")["disabled"]; 
        if(addanotherCol == true){
        let othersTab = document.getElementById("widgetProperty-1-Others");
         if(othersTab){
          event.preventDefault();
          othersTab.focus();
      }}
      }
      if (event.target.classList.contains("infoButton") && this.setIconFocus) {
        if (
          event.target.nextElementSibling.classList.contains("kpis-popover")
        ) {
          this.setFocus(event, this.setIconFocus, inputData);
        }
      }
    }
  }

  setTicksandLabels(inputData, index, inputValue) {
    let object = this.AllData["axes"];

    if (index == undefined) {
      if (inputData.mapWithIndex !== undefined) index = inputData.mapWithIndex;
      else if (inputData.isYaxis == "true") index = 1;
      else index = 0;
    }
    if (inputData.name == "majorTicks") {
      if (inputValue == "false") {
        if (object[index]["majorTickStep"] !== undefined)
          delete object[index]["majorTickStep"];
        if (object[index]["majorLabels"] !== undefined)
          object[index]["majorLabels"] = "false";
      }
    }
    if (inputData.name == "minorTicks") {
      if (inputValue == "false") {
        if (object[index]["minorTickStep"] !== undefined)
          delete object[index]["minorTickStep"];
        if (object[index]["minorLabels"] !== undefined)
          object[index]["minorLabels"] = "false";
      }
    }
    if (inputData.name == "microTicks") {
      if (inputValue == "false") {
        if (object[index]["microTickStep"] !== undefined)
          delete object[index]["microTickStep"];
        if (object[index]["microLabels"] !== undefined)
          object[index]["microLabels"] = "false";
      }
    }
    if (inputData.id == "autosetstepx" || inputData.id == "autosetstepy") {
      if (object[index] !== undefined) {
        if (object[index]["majorTickStep"] !== undefined)
          delete object[index]["majorTickStep"];
        if (object[index]["minorTickStep"] !== undefined)
          delete object[index]["minorTickStep"];
        if (object[index]["microTickStep"] !== undefined)
          delete object[index]["microTickStep"];
      }
    }
    if (inputData.id == "autosetlabelx" || inputData.id == "autosetlabely") {
      if (object[index] !== undefined) {
        object[index]["majorLabels"] = "true";
        object[index]["minorLabels"] = "false";
        object[index]["microLabels"] = "false";
      }
    }
  }

  storePlaceholders(inputData, index) {
    let elementId, element;
    if (index == undefined) elementId = inputData.id;
    else elementId = inputData.id + index;

    if (inputData.placeholder !== undefined) {
      element = [elementId, inputData.placeholder];
      for (let i = 0; i < this.TextAreaplaceholders.length; i++) {
        if (this.TextAreaplaceholders[i][0] == elementId) return;
      }
      this.TextAreaplaceholders.push(element);
    }
  }

  setPlaceholders() {
    let element;
    for (let i = 0; i < this.TextAreaplaceholders.length; i++) {
      element = document.getElementById(this.TextAreaplaceholders[i][0]);
      element.setAttribute(
        "placeholder",
        this.locale[this.TextAreaplaceholders[i][1]]
      );
    }
  }

  ExpandCollapse($event) {
    setTimeout(function() {
      let id = $event.target.id;
      let lastPanel: any;

      let panels = $event.target.parentElement.parentElement.parentElement.getElementsByClassName(
        "panel"
      );
      if (id == "addy-axis") {
        lastPanel = panels[panels.length - 2];
      } else {
        lastPanel = panels[panels.length - 1];
      }
      let x;
      for (x = 0; x < panels.length; x++) {
        let parentPanelEle =
        $event.target.parentElement.parentElement.parentElement.parentElement
          .querySelectorAll(".collapse")
          [x]
        if( parentPanelEle ) {
          parentPanelEle.classList.remove("in");
        }
        $event.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
          .querySelectorAll(".panel")
          [x].classList.remove("in");
        if (x !== panels.length - 1) {
          let parentEle = $event.target.parentElement.parentElement.parentElement.querySelectorAll(".panel")[x].querySelector("a.btn-collap-arrow");
          if( parentEle !== null )
            parentEle.setAttribute("aria-expanded", false);
        }
      }
      if( lastPanel.querySelector(".collapse") !== null )
        lastPanel.querySelector(".collapse").classList.add("in");
      
      if( lastPanel.querySelector("a.btn-collap-arrow") !== null )
        lastPanel
          .querySelector("a.btn-collap-arrow")
          .setAttribute("aria-expanded", true);
    }, 200);

    this.dataStoreService();  
  }

  getBorderStyle(type, index) {
    let array = window["divdrawerconfig"].currentWidget[type];
    array = array.replace(/[\[\]\'\"]/g, "").split(",");

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);

    return array[index];
  }

  setBorderStyle($event, type, index) {
    let value;
    if (type == "borderColors") value = $event;
    else value = $event.target.value;

    let array = window["divdrawerconfig"].currentWidget[type];
    array = array.replace(/[\[\]\']/g, "").split(",");
    array[index] = value;
    window["divdrawerconfig"].currentWidget[type] =
      "['" + array.join("','") + "']";

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }

  showHideBorderStyles($event) {
    let elements = document.querySelectorAll(".allBorder");
    let layoutClass = window["divdrawerconfig"].currentWidget.layoutClass;
    let i = this.findIndexInCheckedRadiosArray("borderStyle");

    for (let l = 0; l < elements.length; l++) {
      if (
        window["divdrawerconfig"].currentWidget.checkedRadios[i][1] == "Default"
      )
        elements[l].classList.add("hide");
      else if (elements[l].classList.contains(layoutClass))
        elements[l].classList.remove("hide");
      else elements[l].classList.add("hide");
    }
    if ($event.target.id.includes("align_Default")) {
      window["divdrawerconfig"].currentWidget.borderColors =
        "['#777777','#777777','#777777','#777777']";
      window["divdrawerconfig"].currentWidget.borderWidths = "[1,1,1,1]";
    }
  }

  setBadgeProperties() {
    //In case of upgrade, we need to add new properties into json
    let object = window["divdrawerconfig"].currentWidget;
    let labelColor = this.getBadgeColors("labelStyle", "color");
    let labelBgColor = this.getBadgeColors("labelStyle", "background-color");
    let valueColor = this.getBadgeColors("valueStyle", "color");
    let valueBgColor = this.getBadgeColors("valueStyle", "background-color");
    let i;
    i = this.findIndexInCheckedRadiosArray("badgeColors");
    if (object["checkedRadios"][i] == undefined) {
      object["checkedRadios"][i] = [];
      object["checkedRadios"][i][0] = "badgeColors";
    }
    object.properties.ranges =
      object.properties.ranges && object.properties.ranges.replace(/"/g, "");
    if (
      object.properties.ranges == undefined ||
      object.properties.ranges == "[0,1]"
    ) {
      //below condition is removed for defect 69475 with checked with anuja
      // && object.properties.ranges == "[0,0]"
      if (object["checkedRadios"][i].length == 1) {
        object["checkedRadios"][i][1] = "defaultColor";
      }
    } else {
      if (object.properties.colors && object.properties.backgroundcolors) {
        if (!object.properties.labelColors) {
          object.properties.labelColors = object.properties.colors;
          object.properties.valueColors = object.properties.colors;
          object.properties.labelBgColors = object.properties.backgroundcolors;
          object.properties.valueBgColors = object.properties.backgroundcolors;
          object.properties.unitColors = object.properties.valueColors;
        }
      }
      object["checkedRadios"][i][1] = "diferentColors";
    }
    if (!object.borderColors) {
      object.borderColors = "['#777777','#777777','#777777','#777777']";
      object.borderWidths = "[1,1,1,1]";
    }
    if (
      object.valueUnitPosition == undefined ||
      object.valueUnitPosition == null
    )
      object.valueUnitPosition = "suffix";
    if (object.titleArea == undefined || object.titleArea == null)
      object.titleArea = "25";
  }

  getBadgeColors(key, color) {
    let strTochange = window["divdrawerconfig"].currentWidget[key];
    let arrStrTochange = strTochange.split(";");
    for (let i = 0; i < arrStrTochange.length; i++) {
      let node = arrStrTochange[i];
      let arrParamName = node.split(":");
      let paramName = arrParamName[0];
      if (paramName == color) {
        return arrParamName[1];
      }
    }
  }
  setQuadrantColors(inputData) {
    let object = window["divdrawerconfig"].currentWidget.properties;
    if (inputData.name == "defaultColors") {
      object.leftTopColor = "#f5f5f5";
      object.leftBottomColor = "#9dc3e6";
      object.rightTopColor = "#9dc3e6";
      object.rightBottomColor = "#f5f5f5";
      window.inputStream.next(["refreshColorPicker"]);
    }
  }

  onClickCustomTab(event) {
    this.isCustomColorPickerClicked = true;
    this.isDefaultColorClicked = false;
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["colorsRadio"] = "CustomColors";
    this.colorPickerCSS(100);
  }

  onClickDefaultColorTab(event) {
    for (let i = 0; i < this.arrColorInput.length; i++) {
      this.AllData.properties["mapBackgroundColors"][i].bgColor = "#000000";
      this.AllData.properties["mapBackgroundColors"][i].borderColor = "#000000";
      this.AllData.properties["mapBackgroundColors"][i].labelColor = "#000000";
    }
    this.arrColorInput.splice(1);
    this.isCustomColorPickerClicked = false;
    this.isDefaultColorClicked = true;
    let object = window["divdrawerconfig"].currentWidget;
    object["properties"]["colorsRadio"] = "AsPerThemeColors";
  }
  handleColorSelectedEvent(color) {
    console.log("The parent has captured the color as: " + color);
  }
  onClickCustomColorTab(event) {
    this.isCustomColorClicked = true;
    this.isDefaultColorClicked = false;
  }

  // Fucntions for Color Picker (Starts)

  decideStateOfColorSelectionRadioButtons() {
    // Ensure that chartColorProperties exist.
    if (!window.divdrawerconfig.currentWidget.chartColorProperties) {
      window.divdrawerconfig.currentWidget.chartColorProperties = {};
    }

    if (
      window.divdrawerconfig.currentWidget.colorRangeId ||
      window.divdrawerconfig.currentWidget.colorRangeId != "" ||
      window["divdrawerconfig"].currentWidget.type == "TagCloud"
    ) {
      if (this.isCategoryColorAsPerTheme()) {
        this.handleClickOnAsPerThemeRadBtn(event);
      }
      // Add json value to model value.
      this.levelThreeRadBtnValue =
        window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue;

      // Determine level 2 as per level 3.
      if (
        window.divdrawerconfig.currentWidget.chartColorProperties
          .levelTwoRadBtnValue == StandardColors.UserDefined
      ) {
        window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue =
          StandardColors.UserDefined;
        this.levelTwoRadBtnValue =
          window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
      } else if (
        window.divdrawerconfig.currentWidget.chartColorProperties
          .levelThreeRadBtnValue
      ) {
        window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue =
          StandardColors.Standard;
        this.levelTwoRadBtnValue =
          window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
      }

      // Determine level 1 as per level 2.
      if (
        window.divdrawerconfig.currentWidget.chartColorProperties
          .levelTwoRadBtnValue
      ) {
        window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue =
          StandardColors.Custom;
        this.levelOneRadBtnValue =
          window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
      } else {
        window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue =
          StandardColors.Dashboardtheme;
        this.levelOneRadBtnValue =
          window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
      }
    } else {
      window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue = undefined;
      this.levelThreeRadBtnValue =
        window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue;
      window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue = undefined;
      this.levelTwoRadBtnValue =
        window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
      window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue =
        StandardColors.Dashboardtheme;
      this.levelOneRadBtnValue =
        window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
    }
  }

    isCategoryColorAsPerTheme() {
      if(this.AllData.chartColorProperties != undefined){
        if (this.AllData.chartColorProperties.levelOneRadBtnValue === StandardColors.Dashboardtheme){
          this.levelOneRadBtnValue = StandardColors.Dashboardtheme;
          this.handleClickOnAsPerThemeRadBtn(event);
         return true;
       }else{         
        this.levelOneRadBtnValue = StandardColors.Custom;
       return false;
        }
      }        
     }       
  handleClickOnAsPerThemeRadBtn(event) {
    if (!event) return;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue =
      StandardColors.Dashboardtheme;
    this.levelOneRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
    window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue = undefined;
    this.levelTwoRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
    window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue = undefined;
    this.levelThreeRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue;
      window.divdrawerconfig.currentWidget.userDefinedColors = ""
  }

  handleClickOnCustomRadBtn(event) {
    if (!event) return;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue =
      StandardColors.Custom;
    this.levelOneRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
    window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue =
      StandardColors.UserDefined;
    this.levelTwoRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
    if (
      window.divdrawerconfig.currentWidget.chartColorProperties
        .levelTwoRadBtnValue == StandardColors.UserDefined
    ) {
      window.divdrawerconfig.currentWidget.colorRangeId = this.levelTwoRadBtnValue;
      window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue =
        "";
    }
  }

  handleClickOnStandardColorsRadBtn(event) {
    if (!event) return;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue =
      StandardColors.Standard;
    this.levelTwoRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue =
      StandardColors.Alerts;
    this.levelThreeRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue;
    window.divdrawerconfig.currentWidget.colorRangeId = this.levelThreeRadBtnValue;
    window.divdrawerconfig.currentWidget.userDefinedColors = "";
    this.defineOtherCustomColors = ["#000000"];
  }

  handleSelectionOfLevelThreeRadBtn(color) {
    if (!color) return;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue = color;
    this.levelThreeRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue;
    window.divdrawerconfig.currentWidget.chartColorProperties.selectedColor = this.AllColors.filter(
      function(item) {
        return item.name === color;
      }
    )[0];
  }

  handleClickOnUserDefColorsRadBtn(event) {
    if (!event) return;

    window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue =
      StandardColors.UserDefined;
    this.levelTwoRadBtnValue =
      window.divdrawerconfig.currentWidget.chartColorProperties.levelTwoRadBtnValue;
    window.divdrawerconfig.currentWidget.colorRangeId = this.levelTwoRadBtnValue;
    window.divdrawerconfig.currentWidget.chartColorProperties.levelThreeRadBtnValue =
      "";
    for (
      let i = 0;
      i < document.getElementsByClassName("caret-spacing").length;
      i++
    ) {
      if (document.getElementsByClassName("caret-spacing")[i] != undefined) {
        if (document.getElementsByClassName("caret-spacing").length > 1) {
          document
            .getElementsByClassName("caret-spacing")
            [i].classList.remove("disabled");
        } else {
          document
            .getElementsByClassName("caret-spacing")
            [i].classList.add("disabled");
        }
      }
    }
  }

  getStandardLeftColors() {
    this.StandardcolorLeft = this.AllColors.filter(
      item => item.category === "StandardcolorLeft"
    );
  }

  getStandardRightColors() {
    this.StandardcolorRight = this.AllColors.filter(
      item => item.category === "StandardcolorRight"
    );
  }    
  getTnpmColors() {       
        if( window.divdrawerconfig.currentWidget.colorRangeId == StandardColors.Tnpm1){
          this.tnpm1Colors = this.AllColors.filter(
            item => item.category === StandardColors.Tnpm1
          );
          var firstRangeColors = this.tnpm1Colors[0].colorboxes.colors.slice(0, 10);
          this.userDefinedColors = [];
          window.divdrawerconfig.currentWidget.userDefinedColors = firstRangeColors;
          window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue = StandardColors.Custom;
          this.levelOneRadBtnValue = window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;        
        }
        if(window.divdrawerconfig.currentWidget.colorRangeId == StandardColors.Tnpm2){
        this.tnpm2Colors = this.AllColors.filter(
          item => item.category === StandardColors.Tnpm2
        );  
        var secondRangeColors = this.tnpm2Colors[0].colorboxes.colors.slice(0, 10);
        this.userDefinedColors = [];
        window.divdrawerconfig.currentWidget.userDefinedColors = secondRangeColors;
         window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue = StandardColors.Custom;
         this.levelOneRadBtnValue = window.divdrawerconfig.currentWidget.chartColorProperties.levelOneRadBtnValue;
      }
  }
  getRecentlyDefinedColors() {
    this.RecentlyDefinedColors = [];
    this.RecentlyDefinedColors = this.recentFiveCustomColors;
  }

  onSave() {
    this.widgetID = window.divdrawerconfig.currentWidget.id;
    window.outputStream.next([
      "postRecentlyDefinedColors",
      1,
      "RECENTLY_DEFINED1",
      "RECENTLY_DEFINED",
      this.defineOtherCustomColors,
      this.defineOtherCustomColors.join(",")
    ]);
  }

  // Fucntions for Color Picker (Ends)
  showHideElementsMap(inputdata, $event) {
    let object = window["divdrawerconfig"].currentWidget;

    this.AllData.properties.KPIDefaultTheme =
      this.AllData.properties.KPIDefaultTheme === undefined ||
      this.AllData.properties.KPIDefaultTheme == ""
        ? "R1DefaultColors"
        : this.AllData.properties.KPIDefaultTheme;
    this.AllData.properties.KPISstrignShapeIcon =
      this.AllData.properties.KPISstrignShapeIcon === undefined ||
      this.AllData.properties.KPISstrignShapeIcon == ""
        ? "R2Shapes"
        : this.AllData.properties.KPISstrignShapeIcon;
    this.AllData.properties.KPISValuesShapeIcon =
      this.AllData.properties.KPISValuesShapeIcon === undefined ||
      this.AllData.properties.KPISValuesShapeIcon == ""
        ? "R3Shapes"
        : this.AllData.properties.KPISValuesShapeIcon;

    if (this.AllData.checkedRadios[0][1] == "kpiString") {
      object["properties"]["KPIStringValuesFlag"] = "kpiString";
      this.AllData.properties.shapeToBePlotted = "Dot";
      this.AllData.properties.asPerThemeCustomColor = "#000000";

      if (
        this.AllData.properties["KPIStringData"] == undefined ||
        this.AllData.properties["KPIStringData"].length <= 0
      ) {
        this.AllData.properties["KPIStringData"] = [
          {
            value: "",
            shape: "Dot",
            colors: "#000000"
          }
        ];
        this.AllData.properties["kpiColumn2"] = "";
        object["properties"]["KPIStringData"] = this.AllData.properties[
          "KPIStringData"
        ];
      }
      if (this.AllData.properties["KPIValuesData"] != undefined) {
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
      }
      this.AllData.properties["kpiValuesColumn2"] = "";
      object["properties"]["KPISValuesShapeIcon"] = "R3Shapes";
      object["properties"]["KPIDefaultTheme"] = "R1DefaultColors";
      object["properties"]["KPIValuesRangeValue"] = "R3Values";

      // Set ICON data
      if (this.AllData.properties.KPISstrignShapeIcon == "R2Shapes") {
        this.AllData.properties.icons = [];
        let defIcons = {
          nodetype: "",
          imageSource: "",
          isPushed: true
        };
        const tempObj = JSON.parse(JSON.stringify(defIcons));
        this.AllData.properties.icons.push(tempObj);
        //Below function resetShapestoDefaultView() to reset GIS shapes ranges and its values on "R2Shapes" radio button
        this.resetShapestoDefaultView();        
      }

      if (this.AllData.properties["KPIShapeValuesData"] != undefined) {
        this.AllData.properties.KPIShapeValuesData.splice(
          0,
          this.AllData.properties.KPIShapeValuesData.length - 1
        );
        this.AllData.properties.KPIShapeValuesData = [
          {
            value: "",
            shape: "Dot",
            colors: "#000000"
          }
        ];
      }

      // SET KPI Icon Ranges
      if (this.AllData.properties["KPIIconRangesData"] != undefined) {
        this.AllData.properties.KPIIconRangesData.splice(
          0,
          this.AllData.properties.KPIIconRangesData.length - 1
        );
        this.AllData.properties.KPIIconRangesData = [
          {
            ranges: [0, 1],
            imageSource: ""
          }
        ];

        object["properties"][
          "KPIIconRangesData"
        ] = this.AllData.properties.KPIIconRangesData;
      }
    } else if (this.AllData.checkedRadios[0][1] == "kpiValues") {
      object["properties"]["KPIStringValuesFlag"] = "kpiValues";
      object["properties"]["KPISstrignShapeIcon"] = "R2Shapes";
      object["properties"]["KPIDefaultTheme"] = "R1DefaultColors";
      this.AllData.properties.shapeToBePlotted = "Dot";
      this.AllData.properties.asPerThemeCustomColor = "#000000";

      // Shape Ranges (Path=Radio KPI Values -> Shape Radio -> Ranges)
      if (
        this.AllData.properties["KPIValuesData"] == undefined ||
        this.AllData.properties["KPIValuesData"].length <= 0
      ) {
        this.AllData.properties["KPIValuesData"] = [
          {
            ranges: [0, 1],
            status: "normal",
            colors: "#000000",
            fontcolors: "#000000",
            gisLessThanColor: "#000000",
            gisGreaterThanColor: "#000000",
            
          }
        ];
        object["properties"]["KPIValuesData"] = this.AllData.properties[
          "KPIValuesData"
        ];
        this.AllData.properties["kpiValuesColumn2"] = "";
      }

      // Shape Values (Path=Radio KPI Values -> Shape Radio -> Values)
      if (
        this.AllData.properties["KPIShapeValuesData"] == undefined ||
        this.AllData.properties["KPIShapeValuesData"].length <= 0
      ) {
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
      }

      // SET KPI Icon Ranges
      if (
        this.AllData.properties["KPIIconRangesData"] == undefined ||
        this.AllData.properties["KPIIconRangesData"].length <= 0
      ) {
        this.AllData.properties.KPIIconRangesData = [
          {
            ranges: [0, 1],
            imageSource: ""
          }
        ];

        object["properties"][
          "KPIIconRangesData"
        ] = this.AllData.properties.KPIIconRangesData;
      }

      // KPI String Data's
      this.AllData.properties.KPIStringData.splice(
        0,
        this.AllData.properties.KPIStringData.length - 1
      );

      this.AllData.properties.KPIStringData = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
      object["properties"][
        "KPIStringData"
      ] = this.AllData.properties.KPIStringData;
      this.AllData.properties["kpiColumn2"] = "";

      // Set ICON data
      if (this.AllData.properties.KPISValuesShapeIcon == "R3Shapes") {
        this.AllData.properties.icons = [];
        let defIcons = {
          nodetype: "",
          imageSource: "",
          isPushed: true
        };
        const tempObj = JSON.parse(JSON.stringify(defIcons));
        this.AllData.properties.icons.push(tempObj);
        //Below function is to reset values on visiting "R3Shapes" radio button
        this.resetGisIconstoDefaultView();

        // SET KPIValuesRangeValue as R3Ranges if data empty for KPIShapeValuesData (Value>>Shape>>value(R3Values))
        if (
          this.AllData.properties["KPIShapeValuesData"] != undefined &&
          this.AllData.properties["KPIShapeValuesData"].length >= 0
        ) {
          for (
            let i = 0;
            i <= this.AllData.properties["KPIShapeValuesData"].length;
            i++
          ) {
            if (this.AllData.properties["KPIShapeValuesData"][i] != undefined) {
              if (
                this.AllData.properties["KPIShapeValuesData"][i]["value"] == ""
              ) {
                this.AllData.properties.KPIValuesRangeValue = "R3Ranges";
              }
            }
          }
        }

        if (this.AllData.properties.KPIValuesRangeValue == "R3Ranges") {
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
        } else {
          // SET KPI Icon Ranges
          // this.AllData.properties.KPIIconRangesData.splice(0, this.AllData.properties.KPIIconRangesData.length - 1);
          this.AllData.properties.KPIIconRangesData = [
            {
              ranges: [0, 1],
              imageSource: ""
            }
          ];
          object["properties"][
            "KPIIconRangesData"
          ] = this.AllData.properties.KPIIconRangesData;
        }
      }
    } else {
      object["properties"]["KPIStringValuesFlag"] = "defaultAsPerTheme";

      this.AllData.properties["KPIValuesData"] = [];
      this.AllData.properties["KPIShapeValuesData"] = [];
      this.AllData.properties["KPIIconRangesData"] = [];
      this.AllData.properties["KPIStringData"] = [];
      this.AllData.properties["kpiColumn2"] = "";
      this.AllData.properties["kpiValuesColumn2"] = "";

      // SET KPI Values Shape Ranges
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

      object["properties"][
        "KPIValuesData"
      ] = this.AllData.properties.KPIValuesData;

      // SET KPI Shape Values
      this.AllData.properties.KPIShapeValuesData.splice(
        0,
        this.AllData.properties.KPIShapeValuesData.length - 1
      );
      this.AllData.properties.KPIShapeValuesData = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000",
          lessThanshape:"Dot",
          gisLessThanColor:"#000000"
        }
      ];

      object["properties"][
        "KPIShapeValuesData"
      ] = this.AllData.properties.KPIShapeValuesData;

      // SET KPI Icon Ranges
      this.AllData.properties.KPIIconRangesData.splice(
        0,
        this.AllData.properties.KPIIconRangesData.length - 1
      );
      this.AllData.properties.KPIIconRangesData = [
        {
          ranges: [0, 1],
          imageSource: ""
        }
      ];

      object["properties"][
        "KPIIconRangesData"
      ] = this.AllData.properties.KPIIconRangesData;      
      if(this.AllData.properties.defaultShapes == "true"){
        //Below function resetShapestoDefaultView() to reset "R3Shapes" values on traversing radio buttons
        this.resetShapestoDefaultView();
      }
      // SET KPI Strings
      this.AllData.properties.KPIStringData.splice(
        0,
        this.AllData.properties.KPIStringData.length - 1
      );

      this.AllData.properties.KPIStringData = [
        {
          value: "",
          shape: "Dot",
          colors: "#000000"
        }
      ];
      object["properties"][
        "KPIStringData"
      ] = this.AllData.properties.KPIStringData;

      // SET ICON Data
      this.AllData.properties.icons = [];
      let defIcons = {
        nodetype: "",
        imageSource: "",
        isPushed: true
      };
      const tempObj = JSON.parse(JSON.stringify(defIcons));
      this.AllData.properties.icons.push(tempObj);
      this.resetGisIconstoDefaultView(); //Function to reset GIS Icons to default view 
      object["properties"]["icons"] = this.AllData.properties.icons;
    }
    let elementsArray: any;
    let targetClass: string;
    let targetClassArr: any = [];
    elementsArray = document.querySelectorAll(inputdata.queryselectorValue);
    targetClass = inputdata.targetClass;
    if (inputdata.type === "radio") {
      for (let i = 0; i < document.querySelectorAll(".stepPanel").length; i++) {
        document.querySelectorAll(".stepPanel")[i].classList.add("hide");
      }
    }

    if (targetClass === ".customColorPicker-Check") {
      for (
        let i = 0;
        i < document.querySelectorAll(".defaultShapes-Check").length;
        i++
      ) {
        document
          .querySelectorAll(".defaultShapes-Check")
          [i].classList.remove("hide");
      }
      targetClassArr = document.querySelectorAll(inputdata.targetClass);
      for (let x = 0; x < targetClassArr.length; x++) {
        targetClassArr[x].classList.remove("hide");
      }
    }
    if (targetClass === ".defaultShapes-Check") {
      targetClassArr = document.querySelectorAll(inputdata.targetClass);
      for (let x = 0; x < targetClassArr.length; x++) {
        targetClassArr[x].classList.remove("hide");
      }
    }
    if (targetClass === ".defaultAsPerTheme-Check") {
      targetClassArr = document.querySelectorAll(".defaultShapes-Check");
      for (let x = 0; x < targetClassArr.length; x++) {
        targetClassArr[x].classList.remove("hide");
      }
    }
    if (
      inputdata.targetClass == "#kpiStringShapeIcon" ||
      inputdata.queryselectorValue == "#kpiStringShapes"
    ) {
      let x;
      for (x = 0; x < elementsArray.length; x++) {
        let showHideElementsArray = elementsArray[
          x
        ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
          inputdata.targetClass
        );

        for (let y = 0; y < showHideElementsArray.length; y++) {
          let e = elementsArray[
            x
          ].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
            inputdata.targetClass
          )[y];
          if (inputdata.type === "radio") {
            if ($event.target.value == "on") e.classList.remove("hide");
            else e.classList.add("hide");
          }
        }
      }
    }
  }

  resetShapestoDefaultView(){
    let object = window["divdrawerconfig"].currentWidget;
    object.properties["lessThanshape"] = "Dot",
    object.properties["greaterThanshape"] = "Dot",
    object.properties["gisGreaterThanShapeValue"] = "1",
    object.properties.ranges = "[0,1]";
    object.properties["gisLessThanColor"] = "#000000",
    object.properties["gisGreaterThanColor"] = "#000000"
  }

  resetGisIconstoDefaultView(){
    let object = window["divdrawerconfig"].currentWidget;
    object.properties["gisLessThanicon"]= "",
    object.properties["gisLessThaniconheight"]= "",
    object.properties["gisLessThaniconwidth"]= "",
    object.properties["gisGreaterThanicon"]= "",
    object.properties["gisGreaterThaniconheight"]= "",
    object.properties["gisGreaterThaniconwidth"]= "",
    object.properties["gisGreaterIconsThanValue"]= "1"
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  selectColorRangeRgba(colorsRgba) {
    console.dir(colorsRgba);
  }

  selectColorRangeHex(colorsHex) {
    console.dir(colorsHex);
  }
  setFocusColor(event, flag, rowIndex, colIndex) {
    if (flag || flag == "true") {
      if (event.target.classList.contains("setFocus")) {
        event.preventDefault();
        window["outputStream"].next([
          "setFocusToSetPropertyElements",
          rowIndex,
          colIndex
        ]);
      } else {
        window["outputStream"].next(["setFocusToSetPropertyElements"]);
      }
    }
  }
  addBackColors(rowIndex) {
    let dataPushed = false;
    this.AllData.properties.mapBackgroundColors.map(e => {
      if (e.isPushed) {
        dataPushed = true;
      }
    });
    let indexValue = rowIndex + 1;
    let mapBackColors = {
      bgColor: "#000000",
      borderColor: "#000000",
      labelColor: "#000000"
    };
    const tempObj = JSON.parse(JSON.stringify(mapBackColors));

    if (!dataPushed) {
      this.AllData.properties.mapBackgroundColors.push(tempObj);
      this.arrColorInput = this.AllData.properties.mapBackgroundColors;
    } else this.arrColorInput.push(tempObj);
    this.colorPickerCSS(20);
  }
  removeIcons(rowId) {
    this.AllData.properties["mapBackgroundColors"][rowId].bgColor = "#000000";
    this.AllData.properties["mapBackgroundColors"][rowId].borderColor =
      "#000000";
    this.AllData.properties["mapBackgroundColors"][rowId].labelColor =
      "#000000";
    this.arrColorInput.splice(rowId, 1);
  }
  getColorSelected() {
    this.colorPickerCSS(0);
    let object = window["divdrawerconfig"].currentWidget;
    let colorsRadioFlag;
    colorsRadioFlag =
      object.properties.colorsRadio == "CustomColors" ? true : false;
    return colorsRadioFlag;
  }
  getMapColorFnPlaceholderBg(rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"] != undefined) {
      if (
        this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined
      ) {
        return this.AllData.properties["mapBackgroundColors"][rowIndex].bgColor;
      } else return "#ffffff";
    }

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  getMapColorFnPlaceholderBorder(rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"] != undefined) {
      if (
        this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined
      ) {
        return this.AllData.properties["mapBackgroundColors"][rowIndex]
          .borderColor;
      } else return "#ffffff";
    }

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  getMapColorFnPlaceholderLabel(rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"] != undefined) {
      if (
        this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined
      ) {
        return this.AllData.properties["mapBackgroundColors"][rowIndex]
          .labelColor;
      } else return "#ffffff";
    }

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  setMapColorFnPlaceholderBg(color, rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined)
      this.AllData.properties["mapBackgroundColors"][rowIndex].bgColor = color;

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  setMapColorFnPlaceholderBorder(color, rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined)
      this.AllData.properties["mapBackgroundColors"][
        rowIndex
      ].borderColor = color;

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  setMapColorFnPlaceholderLabel(color, rowIndex) {
    if (this.AllData.properties["mapBackgroundColors"][rowIndex] != undefined)
      this.AllData.properties["mapBackgroundColors"][
        rowIndex
      ].labelColor = color;

    // setTimeout(()=>{
    //   window.inputStream.next(['refreshColorPicker']);
    // }, 100);
  }
  setFocusForAddAnotherColor(event, flag, rowIndex) {
    let rowvalue = rowIndex + 1;

    setTimeout(function() {
      let colorPicker1 = <HTMLElement>(
        document.getElementById("colorPicker1-" + rowvalue).children[0]
          .firstElementChild.firstElementChild
      );
      if (colorPicker1) {
        colorPicker1.focus();
      }
    }, 100);
  }

  setFocusForColorDelete(event, flag, rowIndex) {
    if (rowIndex == 0) {
      setTimeout(function() {
        let addanother = document.getElementById("addAnotherColor-" + rowIndex);
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + (rowIndex + 1)
        );
        if (addanother) {
          addanother.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    }
    let rowval = rowIndex - 1;
    let rowval2 = rowIndex + 1;
    if (rowIndex == this.arrColorInput.length) {
      setTimeout(function() {
        let addanother = document.getElementById("addAnotherColor-" + rowval);
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowval
        );
        if (addanother) {
          addanother.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    } else {
      setTimeout(function() {
        let addanother = document.getElementById("addAnotherColor-" + rowval);
        let removeAddedRange = document.getElementById(
          "removeAddedRange-" + rowval
        );
        if (addanother) {
          addanother.focus();
        }
        if (removeAddedRange) {
          removeAddedRange.focus();
        }
      }, 100);
    }
  }
  retainValueOfIconPositionHorizontalVerticalAlignment(){
    if(document.querySelector("#align_leftValueiconPosition") != null){
      if(this.AllData.properties.iconPosition == "leftValue"){
        let iconPositionRadioButton= document.querySelector("#align_leftValueiconPosition") as HTMLInputElement;
        iconPositionRadioButton.checked = true;
      }
    }
    if(document.querySelector("#align_centerverticalAlignIcon") != null){
      if(this.AllData.properties.verticalAlignIcon == "center"){
        let vertalAlignIconRadioButton = document.querySelector("#align_centerverticalAlignIcon") as HTMLInputElement;
        vertalAlignIconRadioButton.checked = true;
      }
    }
    if(document.querySelector("#align_centerhorizontalAlignIcon") != null){
      if(this.AllData.properties.horizontalAlignIcon == "center"){
        let horizontalAlignIconRadioButton = document.querySelector("#align_centerhorizontalAlignIcon") as HTMLInputElement;
          horizontalAlignIconRadioButton.checked = true;
      }
    }    
  }

  moveColumnUp(index, $event) {
    $event.stopPropagation();
    if (index - 1 < 0) { return; }
    let currentItem =   window["divdrawerconfig"].currentWidget.columns[index]
    window["divdrawerconfig"].currentWidget.columns[index] =  window["divdrawerconfig"].currentWidget.columns[index - 1];
    window["divdrawerconfig"].currentWidget.columns[index - 1] = currentItem;
    this.expandAndFocus($event, ActionType.UP , index);
  }

  moveColumnDown(index, $event) {
    $event.stopPropagation();
    if (index + 1 >= window["divdrawerconfig"].currentWidget.columns.length) { return; }
    let currentItem = window["divdrawerconfig"].currentWidget.columns[index]
    window["divdrawerconfig"].currentWidget.columns[index] = window["divdrawerconfig"].currentWidget.columns[index + 1];
    window["divdrawerconfig"].currentWidget.columns[index + 1] = currentItem;
    this.expandAndFocus($event, ActionType.DOWN, index);
  }

  expandAndFocus($event, operate, index) {
    let link = `#column${index + 1}`
    setTimeout(function () {
      let panels = document.querySelectorAll(".accordion .panel") as NodeListOf<HTMLElement>;
      for (var x = 0; x < panels.length; x++) {
        panels[x].querySelector("a.btn-collap-arrow").setAttribute("aria-expanded", 'false');
        panels[x].querySelector("a.btn-collap-arrow").classList.add("collapsed");
        panels[x].querySelector(".panel-collapse").classList.remove("in");
      }

      switch(operate) {
        case ActionType.DOWN: 
          panels[index+1].querySelector("a.btn-collap-arrow").setAttribute("aria-expanded", 'true');
          panels[index+1].querySelector("a.btn-collap-arrow").classList.remove("collapsed");
          panels[index+1].querySelector(".panel-collapse").classList.add("in");
            let downFormHeight =  panels[index+1].querySelector(".panel-body form").clientHeight + 30;
            let downColumn = document.getElementById(`column${index+1}`);
            downColumn.style.removeProperty('height')
            downColumn.style.height = "auto"
          // AVT
          if(index == panels.length - 2) {
            let accordionButton = <HTMLElement>(document.querySelector(`a[href = '#column${index+1}']`))
            accordionButton.focus();
          } else {
            document.getElementById(`move-down-btn-${index+1}`).focus();
          }
          break;
        case ActionType.UP:
          panels[index-1].querySelector("a.btn-collap-arrow").setAttribute("aria-expanded", 'true');
          panels[index-1].querySelector("a.btn-collap-arrow").classList.remove("collapsed");
          panels[index-1].querySelector(".panel-collapse").classList.add("in");
          let upFormHeight =  panels[index-1].querySelector(".panel-body form").clientHeight + 30;
          let upColumn = document.getElementById(`column${index-1}`);
          upColumn.style.removeProperty('height');
          upColumn.style.height = "auto"
          // AVT
          if(index == 1) {
            let accordionButton = <HTMLElement>(document.querySelector("a[href = '#column0']"))
            accordionButton.focus();
          } else {
            document.getElementById(`move-up-btn-${index-1}`).focus();
          }
          break;
      }
    }, 200)
  }

  dataStoreService(ms=500) {
    setTimeout(() => {
    $(".nontransformationfield").hide();
    $(".nontransformationfieldDD").hide();
    $(".transformationfield").hide();
    $(".transformationfieldDD").hide();
    if(this.isTransformationFlag){
      $(".transformationfieldDD").show();
      let storeArray = this.layoutJSON.stores;
      let datastoreName;    
      if( this.layoutJSON.stores && this.layoutJSON.stores.length > 0 ) {
        if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid || window["divdrawerconfig"].currentWidget.type == "Badge") {
          datastoreName = window["divdrawerconfig"].currentWidget.transformations[0].dataStore
        }
        if( window["divdrawerconfig"].currentWidget.series != undefined ) {
          window["divdrawerconfig"].currentWidget.series.forEach( (element, index) => {
              datastoreName = this.getDataStoreByTransformationID(element.store);
              this.arrBoolDropDownVisible[index] = this.datasourceService.checkIsFormDataOrNot(storeArray, datastoreName);
          });
        } else {
  
        }
      }
        this.arrBoolDropDownVisible.forEach( (formDataFlag,index) => {
          if( formDataFlag ) {
            $('#Series' + index + " .transformation-formdata").show();
            $('#series' + index + " .transformation-formdata").show();        
          } else {
                if (window["divdrawerconfig"].currentWidget.dynamicseries == "true") {
                  $("#othrDetails").show()
                  $('#Series' + index + ' .transformation-no-formdata.transformation-dynamic').show();
                  $('#series' + index + ' .transformation-no-formdata.transformation-dynamic').show();
                } else {
                  $("#othrDetails").hide()
                  $('#Series' + index + ' .transformation-no-formdata.transformation-non-dynamic').show();
                  $('#series' + index + ' .transformation-no-formdata.transformation-non-dynamic').show();
                }
          }
        });

     } else {
      $(".nontransformationfieldDD").show();
      if (window["divdrawerconfig"].currentWidget.dynamicseries == "true") {
        $("#othrDetails").show()
        $('.dynamicfield:not(.transformationfield)').show();
      } else {
        $("#othrDetails").hide()
        $('.nondynamicfield:not(.transformationfield)').show();
      }
      $('.nontransformationfield:not(.dynamicfield):not(.nondynamicfield)').show();
     }
    }, ms);
    }

  getTransformationID(transformationName) {
    let transformationID = "";
    this.optionsArray.forEach( ( element ) => {
      element.transformationList.forEach( innerelement => {
        if(transformationName === innerelement.transformationName) {
          transformationID = innerelement.transformationID;
        }
      });
    });
    return transformationID;
  }

  getTransformationName(transformationID) {
    let transformationName = "";
    this.optionsArray.forEach( ( element ) => {
      element.transformationList.forEach( innerelement => {
        if(transformationID === innerelement.transformationID) {
          transformationName = innerelement.transformationName;
        }
      });
    });
    return transformationName;
  }
  
  // on change of the drop down value.
  updateChartPropValueDataDef = (event: any, infoObject) => {
    let dynamicSeries = false;
    let attribute = infoObject[0];
    let colapsTabIndex = infoObject[1];
    let colapsGrid = infoObject[1];
    let parentDocument = document.getElementById("Series" + infoObject[1]);
    if(!(parentDocument && parentDocument != undefined)){
      parentDocument = document.getElementById("series" + infoObject[1]);
    }
    if (window["divdrawerconfig"].currentWidget.type == rangesChartType.grid || window["divdrawerconfig"].currentWidget.type == "Badge") {
      colapsTabIndex = 0;
    }
    if (!this.isGridBadge) {
      dynamicSeries = window["divdrawerconfig"].currentWidget.dynamicseries == "true";
    }
    let colDatatypes;
    switch (attribute) {
      case "serieslabeldynamic":
        if (dynamicSeries)
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].labelColumn = "item['"+event+"']";
        else {
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].label = "item['"+event+"']";
        }          
      break;
      case "seriesvalue":
        window["divdrawerconfig"].currentWidget.series[colapsTabIndex].value = "item['"+event+"']";
      break;
      case "datadefination":
        let store = this.getTransformationID(event.split(" - ")[1]);
        window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store = store;
        let widgetSeries = {
          label: "",
          labelColumn: "",
          name: window["divdrawerconfig"].currentWidget.series[colapsTabIndex].name,
          plot: "default",
          replacevalueparam: "",
          seriesColumn: "",
          sortorder: "",
          sortparam: "",
          store: store,
          value: ""
        };
        $.extend( true, window["divdrawerconfig"].currentWidget.series[colapsTabIndex], widgetSeries );
      break;
      case "legenddynamic":
        if ( dynamicSeries ) {
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].seriesColumn = "item['"+event+"']";;
        } else {
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].name = event;
        }          
      break;
      case "legendnondynamic":
        if ( dynamicSeries ) {
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].seriesColumn = "item['"+event+"']";;
        } else {
          window["divdrawerconfig"].currentWidget.series[colapsTabIndex].name = event;          
        }          
      break;
      case "transformationvalue":
          
          window["divdrawerconfig"].currentWidget.columns[colapsGrid].field = event;  
          window["divdrawerconfig"].currentWidget.columns[colapsGrid].name = event;  
          let columnName;
          let storeName;
          if( window["divdrawerconfig"].currentWidget.transformations != undefined ) {
            storeName = window["divdrawerconfig"].currentWidget.transformations[0].dataStore;
          }
          let formDataObj = this.layoutJSON.stores.find( e=> { return (e.name && e.name != "" && (e.name === storeName )) });
          if( formDataObj.__form_data__ != undefined ) {
            columnName = formDataObj.__form_data__.metrics.selectedValues.find( a => { return a.value.name == event} )
          } 
          colDatatypes = (columnName!= undefined ) ? columnName.value.datatype : columnName;            
          
          switch (colDatatypes) {
            case DataTypes.DECIMAL:
            case DataTypes.LONG:
            case DataTypes.INTEGER:
            case DataTypes.NUMERIC:
            case DataTypes.PERCENTAGE:
              colDatatypes = DataTypes.NUMBER;
              break;
            case DataTypes.ISODATETIME:
            case DataTypes.TIMESTAMP:
              colDatatypes = DataTypes.DATE;
              break;
            case DataTypes.STRING:
              colDatatypes = DataTypes.STRING;
              break;
            default:
              colDatatypes = DataTypes.STRING;
              break;
          }
          window["divdrawerconfig"].currentWidget.columns[colapsGrid].dataType = colDatatypes; 
          window["divdrawerconfig"].currentWidget.columns[colapsGrid].labeltype = colDatatypes;
          
      break;
      case "badgevalue":
          window["divdrawerconfig"].currentWidget.value = event;
      break;
    }
    if( attribute === "datadefination" ) {
      this.dataStoreService(10);
    }
  }    

  // get drop down selected value
  getSelectedOptionValue(inputData, colapsTabIndex) {
    let storeName;
      if( window["divdrawerconfig"].currentWidget.series!= undefined ) {
        storeName = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store;
      }
    let returnVal = '';
      switch (inputData.id) {
        case "serieslabeldynamic":
          if ( window["divdrawerconfig"].currentWidget.dynamicseries === "true" )
            returnVal  = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].labelColumn;
          else {
            returnVal  = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].label;          
          }
          returnVal = (<any>window).extractColumnValues(returnVal);
          break;
        case "seriesvalue":
          returnVal  = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].value;
          returnVal = (<any>window).extractColumnValues(returnVal);
          break;
        case "datadefination":
          if(( window["divdrawerconfig"].currentWidget.transformations != undefined ) && (window["divdrawerconfig"].currentWidget.series[colapsTabIndex] != undefined )) {
            if( window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store === "" ) {
              let store = this.getTransformationID(this.defaultOption);
              window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store = store;
              this.dataStoreService(50);
            }
            returnVal  = this.getTransformationName(window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store);
            if(this.getDataStoreAndTransformationName(returnVal) == ""){
              returnVal = returnVal;
            } else {
              returnVal = this.getDataStoreAndTransformationName(returnVal) + ' - ' + returnVal;
            }
          }
        break;
        case "legenddynamic":
          if( colapsTabIndex === undefined  ) {
            colapsTabIndex = 0;
          } 
          if ( window["divdrawerconfig"].currentWidget.dynamicseries === "true" ) {
            returnVal  = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].seriesColumn;
          } else {
            returnVal  =  window["divdrawerconfig"].currentWidget.series[colapsTabIndex].name;  
          }     
          returnVal = (<any>window).extractColumnValues(returnVal);
        break;
        case "legendnondynamic":
          if( colapsTabIndex === undefined  ) {
            colapsTabIndex = 0;
          } 
          if ( window["divdrawerconfig"].currentWidget.dynamicseries === "true" ) {
            returnVal  = window["divdrawerconfig"].currentWidget.series[colapsTabIndex].seriesColumn;
          } else {
            returnVal  =  window["divdrawerconfig"].currentWidget.series[colapsTabIndex].name;  
          }  
          returnVal = (<any>window).extractColumnValues(returnVal);   
        break;
        case "transformationvalue":
          returnVal  = ( window["divdrawerconfig"].currentWidget.columns != undefined ) ? window["divdrawerconfig"].currentWidget.columns[colapsTabIndex].field : '';               
        break;
        case "badgevalue":
          returnVal  = window["divdrawerconfig"].currentWidget.value ? window["divdrawerconfig"].currentWidget.value : "" ;
        break;
      }      
      return returnVal;
    
  }
  getDataStoreAndTransformationName(transformationName){
    let dataStoreName = "";
    this.optionsArray.forEach( ( element ) => {
      element.transformationList.forEach( innerelement => {
        if(innerelement.transformationName == transformationName ){
          dataStoreName = element.dataStore;
        }
      });
  });
  return dataStoreName;
  }

  getDataStoreByTransformationID(transformationID){
    let dataStoreName = "";
    this.optionsArray.forEach( ( element ) => {
      element.transformationList.forEach( innerelement => {
        if(innerelement.transformationID == transformationID ){
          dataStoreName = element.dataStore;
        }
      });
  });
  return dataStoreName;
  }

  searchableDropDownData(inputData, colapsTabIndex) {
    let input_id = inputData.id;

    // if(this.options.hasOwnProperty(input_id+colapsTabIndex) && this.options[input_id+colapsTabIndex].length != 0){
    //   return this.options[input_id+colapsTabIndex];
    // }
    let transformationName;
    if (colapsTabIndex === undefined) {
      colapsTabIndex = 0;
    }
    if (window["divdrawerconfig"].currentWidget.series != undefined) {
      transformationName = this.getTransformationName(window["divdrawerconfig"].currentWidget.series[colapsTabIndex].store);
    }
    if (this.isGridBadge) {
      if (window.divdrawerconfig.currentWidget.transformations) {
        transformationName = window.divdrawerconfig.currentWidget.transformations[0].transformationList[0].transformationName;
      }
    }

    let widgetData = window["divdrawerconfig"].currentWidget
    this.options[input_id+colapsTabIndex] = [];
    switch (input_id) {
      case "serieslabeldynamic":
      case "legenddynamic":
      case "transformationvalue":
      case "badgevalue":
        this.options[input_id+colapsTabIndex] = this.datasourceService.getOutPutColumnName(colapsTabIndex, transformationName);
        break;
      case "seriesvalue":
        inputData.isYaxis = true;
        this.options[input_id+colapsTabIndex] = this.datasourceService.getOutPutColumnName(colapsTabIndex, transformationName , true );
        break;
      case "datadefination":
        this.optionsArray.forEach( ( element ) => {
            element.transformationList.forEach( innerelement => {
              let transformationName = element.dataStore + ' - ' + innerelement.transformationName
              this.options[input_id+colapsTabIndex].push(transformationName);  
            });
        });
        if( widgetData != undefined ) {
          if( widgetData.series != undefined ) {
            if( widgetData.series[colapsTabIndex] != undefined ) {
              if( widgetData.series[colapsTabIndex].store === "") {
                this.defaultOption = (this.options[input_id+colapsTabIndex] != undefined) ? (this.options[input_id+colapsTabIndex][0].split(' - ')[1] ? this.options[input_id+colapsTabIndex][0].split(' - ')[1] : '') : '';
              }
            }
          }
        }
      break;
      default:
      break;
    }
    return this.options[input_id+colapsTabIndex];
  }
  hideTransformationFields() {
    setTimeout(() => {
      $(".nontransformationfieldDD").show();
      $(".transformationfield").hide();
      $(".transformationfieldDD").hide();
    }, 100);
  }

  hideNonTransformationFields() {
    setTimeout(() => {
      $(".transformationfieldDD").show();
      $(".nontransformationfield").hide();
      $(".nontransformationfieldDD").hide();
    }, 100);
  }
  gridJSONFormat(inputData, index){
      if(inputData.radioName == "width"){
        window["divdrawerconfig"].currentWidget["columns"][index]["columnWidth"] = inputData.id;
      }
      if(inputData.radioName == "precision"){
        window["divdrawerconfig"].currentWidget["columns"][index]["precisionOption"] = inputData.id;
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
      case "cellformat":
        radioname = "cellformat"
        break;
    }
    return radioname;
  }
  radiostate(inputData, colapsTabIndex, enumChecked, enumIndex){
    let radiobuttonName = this.radioNameStatus(inputData.radioName);
    if(radiobuttonName == "cellformat"){
      let props = window["divdrawerconfig"].currentWidget["columns"][colapsTabIndex]["cellformat"].split(",");
      var textToFind = "align";
      var matches = props.filter(function(windowValue){
        if(windowValue) {
            return windowValue.indexOf(textToFind) >= 0;
        }
      });
    let cellformatOBj = window["divdrawerconfig"].currentWidget["columns"][colapsTabIndex][radiobuttonName].split(",");
    let cellformatOBjIndex = cellformatOBj.indexOf(matches.toString());
      if( window["divdrawerconfig"].currentWidget["columns"][colapsTabIndex][radiobuttonName].split(",")[cellformatOBjIndex] == inputData.enum[enumIndex].value){
        return true
      }else{
        return false
      } 
    }else{
      if(window["divdrawerconfig"].currentWidget["columns"][colapsTabIndex][radiobuttonName] + colapsTabIndex == inputData.id + colapsTabIndex){
        return true
      }else{
        return false
      }
    }      
  }
}
