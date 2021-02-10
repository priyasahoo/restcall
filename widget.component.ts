import {
  CommonUtilityService,
  WidgetDataStates,
  DefaultFilters,
  CEMDateFilter,
  CEMDefaultFilter,
  EventType
} from "./../../services/utilities/common-utility.service";
import { LOCALE_CONFIGS } from "../../appconfiguration";
import { WidgetState, ChartTypeState } from "./../widgetState";
import { Dashboard } from "./../../interfaces/dashboard";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
  Input,
  HostListener,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  NgZone,
  Renderer2,
  Injector,
  TemplateRef,
  ElementRef,
  SecurityContext,
  DoCheck
} from "@angular/core";
import { Widget, DrillDownType, ChartType } from "../../interfaces/widget";
import { TabregisterService } from "../../services/tabregister/tabregister.service";
import { DashboardFactoryService } from "../../services/dashboard/dashboard-factory.service";
import { DrilldownServiceService } from "../../services/drilldown/drilldown-service.service";
import { NavbarMenu } from "../../services/datamanager/navbar-menu";
import { ViewAnyChartDirective } from "../../directives/view-any-chart.directive";
import { ViewCanvasJsDirective } from "../../directives/view-canvas-js.directive";
import { ViewD3ChartDirective } from "../../directives/view-d3-chart.directive";
import {
  CHART_API_CONFIGS,
  CHART_TYPES,
  chartToLibraryMapping
} from "../../appconfiguration";
import { DashboardStateManager } from "../../services/dashboard/dashboardStateManager";
import { Tab } from "../../interfaces/tab";
import { TabStripComponent } from "../../tab-strip/tab-strip.component";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { GridChartAgComponent } from "../grid-chart-ag/grid-chart-ag.component";
import { ChartClickEvent } from "../../interfaces/chart-click-event";
import { UpwordGravityWidgetDirective } from "../../directives/upword-gravity-widget.directive";
import { WidgetRealtimeDataService } from "../../services/realtime/widget-realtime-data.service";
import { ParametersMaintenanceService } from "../../services/drilldown/parameters-maintenance.service";
import { Observable, Subject } from "rxjs";
import { BadgeWidgetComponent } from "../badge-widget/badge-widget.component";
import { Emitmessage } from "../../interfaces/emitmessage";
import { DashboardServiceService } from "../../services/dashboard/dashboard-service.service";
import { element } from "protractor";
import { DomSanitizer } from "@angular/platform-browser";
import { BsDropdownDirective } from "ngx-bootstrap/dropdown";
import { StyleSanitizerPipe } from "../../pipes/style-sanitizer.pipe";
import { UserPreferencesServiceService } from "../../services/user-preferences/user-preferences-service.service";
//import { TreeFlatOverviewExample } from '../tree-chart/tree-chart.component';
import { WebWidgetComponent } from "../web-widget/web-widget.component";

// import { CustomtooltipComponent } from '../../custom-tooltip/customtooltip.component';
import { DEVICE_TYPES } from "../../appconfiguration";
import { WidgetFilterDashBoard } from "../../classes/widget-filter-dashboard";
import { FilterbarComponent } from "../../filterbar/filterbar.component";
import { CustomPositionDirective } from "../../directives/custom-position.directive";
import { I18nDirectiveDirective } from "../../directives/i18n-directive.directive";
import { TreeChartComponent } from "../tree-chart/tree-chart.component";
import { SavePdfService } from "../../services/report/save-pdf.service";
import { WebsocketService } from "../../services/websocket/websocket.service";
import { ClientSessionService } from "../../services/utilities/client-session.service";
import { SaveRawService } from "../../services/report/save-raw.service";
import { SaveXlsService } from "../../services/report/save-xls.service";
import { filter } from "rxjs/operators";
import { any, isString, reject } from "underscore";
import { resolve } from "path";

@Component({
  selector: "app-widget",
  templateUrl: "./widget.component.html",
  styleUrls: ["./widget.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetComponent
  implements
    OnInit,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    AfterViewInit,
    AfterViewChecked,
    DoCheck {
  private chart: Object;
  public widget: Widget;
  public widgetTitleLangKey: string;
  private position = "absolute";
  public isMaximized: Boolean = false;
  private widgetStyle: object = {};
  private errorStyle: object = {};
  private errorStyleForContent: object = {};
  public parentDashboard: any;
  private emitter: EventEmitter<Object>;
  private emitterWidget: EventEmitter<Object>;
  private emitterDashaboard: EventEmitter<Object>;
  private widgetBroadCastChanel: EventEmitter<Object>;
  private onDashStateReset: EventEmitter<any>;
  private chartData: Object;
  private chartConfig: {
    canvasHeight: any;
    canvasWidth: any;
    xAxisTitle: string;
    yAxisTitle: string;
    seriesName?: string;
  };
  private filteredArrayObservable: any;
  private chartApiType: string;
  private currentChartApiType: string;
  private currentChartType: string;
  private preventMasterHandling = false;
  private isGridLoaded = false;
  private graphHeight: number;
  private tabStyle = "";
  private currentTabId: string;
  private arrSubscription: Array<any> = [];
  private widgetBrodcast: any;
  public widgetFilterButtonClick: any;
  private widgetFilterIconClick: EventEmitter<Object>;
  private WidgetFilterApplyButtonClicked: EventEmitter<Object>;
  private widgetID: any;
  private expanded: Boolean = false;
  private waitForMasterEmmitter: EventEmitter<Object>;
  public onChangeFilter: EventEmitter<Object>;

  private masterWidgetEmitter: EventEmitter<Object>;
  public filterWidgetEmitter: EventEmitter<Object>;
  private listenerWidgetEmitters: Array<EventEmitter<Object>>;
  private updateDashabordEventEmitter: EventEmitter<Object>;
  private expandCollapseWidgetEventEmitter: EventEmitter<Object>;
  private filterUpdatesEventEmitter: EventEmitter<Object>;
  private perfectSCrollBarEventEmitter: EventEmitter<Object>;

  private dataObservable: any;
  private positionVectorStart: any;
  private dashBoardElement: any;
  private positionWidgetStart: any;

  private savedState: WidgetState;

  private tabreg: TabregisterService;

  private titleToBeDisplayed = "";
  private CHART_TYPES: object;

  private drilldownIndexInChartIdentity: number;
  private stateOfWidgetDataLoading: WidgetDataStates = WidgetDataStates.LOADING;
  private WidgetDataStates: any;

  private widgetData: Array<Object> = [];

  private xAxisTitle: string;
  private yAxisTitle: string;
  private tabComponentInstance: any;
  private DashBoardDetails: DashboardComponent;
  private widgetCollapsed: Boolean = false;
  private xAxisIndex: Number = 1;
  private realTimeDataMessage: Subject<any>;
  private isChartIconsCollapsed: Boolean;
  private isRealTimeGraph: Boolean = false;
  private widgetExpandCollapseTopBuffer = 0;
  //public webSocketURL="ws://10.55.54.66:9000/ws";
  public webSocketURL = "ws://10.55.54.66:9000/ws";
  public widgetTitle: string;
  public cutomWidgetStyle: string = "";
  public customToolbarStyle: string = "";
  public errorMessage = "Error in fetching data";
  public invalidData = "";
  private multiplePlots = false;
  private userId: string;
  // private autoInterval: string;
  public wigetCollapsedtitle: string = "collapse";
  public maximizetitle: string;
  // public changeChartTypeId: string;

  public widgetType: String = "";
  public clickCount: any = 0;
  public dropDownItems: Boolean = false;
  public Maximizechart: Boolean = false;
  public ChartTypeChange: Boolean = false;
  public isPreviewMode: boolean =
    window.previewParams.getPreviewMode() || false;
  public maximizeFilterBar: Boolean = false;
  private dashboardTimePeriodToBeShown: any;
  private dateToBeShown: any;
  private objWidgetFilterDashboard: any;
  private objwidgetDashboard: any;
  public show_dialog: boolean = false;
  private objFiltebar: any;
  private loopCounter = 0;
  public filterLength: any = 0; // is widget has widget level filter
  public widgetLevelFilterLoaded: Boolean = false; // is filter level widget loaded
  public areAllFilterHidden: any = false; //if all the filters are hidden
  public masterWidgetLoaded: Boolean = false; // is master widget loaded
  public listenerWIdgetLoadedPostMasterAndFilter: Boolean = false;
  public objOnMasterLoadParams: any = {}; // Master  paramater after loading
  public isDisableResizeAndMove = false;
  public filterValue = "";
  public largeDataErrorMsg =
    "Bullet chart does not support more than 5000 records.";
  private fromChangeChartType = false;
  private iswidgetResized = false;
  public webWidgetParams: Object = {};
  public filterValuesObj: Object = {};

  public preDataObservable: any;
  private dbSourceData: Array<Object> = [];
  public hasOwnStyle: Boolean = false;
  public imageStyling = {};

  public checkIfMapNotSupported: boolean = true;
  public widgetWidth: any;
  private dashboardFilterToBeShown: any;
  private dashboardFilterTitleToBeShown: any;
  private dashboardFilterToBeShownDefault: any;
  private dashboardFilterTitleToBeShownDefault: any;
  private commonTooltipToBeShown: any;
  private isWidgetFilterLastClicked: Boolean = false;
  private defaultFilterKeyValue: Array<any> = [];
  private customFilterKeyValue: Array<any> = [];
  private summarizationValueHide = false;
  private aggregationValueHide = false;
  private hideCEMdate = false;
  private previousChartType: string = "";
  private indexOfCEMDateZero = false;
  private extraparameters: any;

  private masterWidgetId: string;
  private isWidgetLoaded: boolean = false;
  @Input() colWidth: number;
  @Input() dashTitle?: any;
  @Input() rowHeight: number;
  @Input() dashboardPadding: number;
  @Input() index: number;
  @Input() widgetId: string;
  @Input() widgetPadding: number;
  @Input() activeTab: boolean;
  @Input() objTabDashboard?: any;
  @Input() objDynamicChartDashboard?: any;
  @Input() objWidgetWrapperDashboard?: any;
  @Input() widgetDynamicChart?: Widget;
  @Input() paramWidget?: Widget;
  @Input() autoInterval: string;
  @Input() maxWidgetDataTimeout: string;
  @Input() activeTabIndex?: any;

  @ViewChild("linegraph", { static: false }) linegraph;
  @ViewChild("wigdetHeader", { static: false }) wigdetHeader;
  @ViewChild("widgetContainer", { static: false }) widgetContainer;
  @ViewChild("buttonPanel", { static: false }) buttonPanel;
  @ViewChild("panelActionGroup", { static: false }) panelActionGroup;
  @ViewChild(GridChartAgComponent, { static: false })
  gridChart: GridChartAgComponent;
  @ViewChild(TreeChartComponent, { static: false })
  viewTreeChart: TreeChartComponent;
  @ViewChild(ViewAnyChartDirective, { static: false })
  viewAnyChart: ViewAnyChartDirective;
  @ViewChild(ViewCanvasJsDirective, { static: false })
  viewCanvasJsChart: ViewCanvasJsDirective;
  @ViewChild(BadgeWidgetComponent, { static: false })
  badgeWidget: BadgeWidgetComponent;
  @ViewChild(ViewD3ChartDirective, { static: false })
  viewD3Chart: ViewD3ChartDirective;
  @ViewChild("dataSourceDropdown", { static: false })
  private dataSourceDropdown: BsDropdownDirective;
  @ViewChild("chartTypeDropdown", { static: false })
  private chartTypeDropdown: BsDropdownDirective;
  @ViewChild("widgetFilterBar", { static: false })
  private filterbarObj: FilterbarComponent;
  @ViewChild(I18nDirectiveDirective, { static: false })
  i18nDirective: I18nDirectiveDirective;

  // @ViewChild(TreeFlatOverviewExample) treeChart: TreeFlatOverviewExample;
  @ViewChild(WebWidgetComponent, { static: false })
  webWidget: WebWidgetComponent;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.parentDashboard = this.tabregister
    .getTabByName(this.dashTitle)
    .getCurrentDashboard();
    if (this.dashTitle === this.tabregister
      .getTabByName(this.dashTitle)
      .getCurrentDashboard()) {
      this.rowHeight = this.utilities.getRowHeight(
        this.parentDashboard.blockHeight
      );
      this.setWidgetContainerStyle();
      this.updateGraph("onResize");
      this.checkIconsToBeCollapsed();
      this.checkIsMobileScreen();
    }
  }

  /**
   * Check whether icons are to be collapsed in current state based on the height of the button's panel and widget headers.
   * If the buttons can't be accommodated in the given width, they overflow vertically and then height of the panelActionGroup increases
   * Based on this did a comparison of height of the two divs panelActionGroup and widgetHeader.
   */
  checkIconsToBeCollapsed(): void {
    this.isChartIconsCollapsed = false;
    const verifyCollapse = () => {
      if (this.panelActionGroup !== undefined) {
        const actionGroupWidth = this.panelActionGroup.nativeElement
          .clientWidth;
        const headerWidth = this.wigdetHeader.nativeElement.clientWidth - 20;
        if (actionGroupWidth > 0) {
          this.isChartIconsCollapsed = headerWidth / 2 <= actionGroupWidth;
        }
        /* kebab menu added in mobile resolution and not in maximize */
        if (
          window.innerWidth < 768 &&
          !document.querySelector(".widget-maximized")
        ) {
          const widgetHeaderIconList = this.panelActionGroup.nativeElement.getElementsByClassName(
            "ico-wa-wrapper"
          );
          if (widgetHeaderIconList.length > 1) {
            this.isChartIconsCollapsed = true;
          }
        }
        /* kebab menu added in mobile resolution*/
      }
    };

    verifyCollapse();
    this.zoneService.runOutsideAngular(() => {
      setTimeout(() => {
        verifyCollapse();
      }, 1000);
    });
  }

  constructor(
    private tabregister: TabregisterService,
    private dashboardFactory: DashboardFactoryService,
    private drillDownservice: DrilldownServiceService,
    private changeDetector: ChangeDetectorRef,
    private dashStateManager: DashboardStateManager,
    private utilities: CommonUtilityService,
    private parametersMaintenanceService: ParametersMaintenanceService,
    private zoneService: NgZone,
    private renderer: Renderer2,
    private injector: Injector,
    private widgetRealtimeService: WidgetRealtimeDataService,
    private dashserv: DashboardServiceService,
    private userPreference: UserPreferencesServiceService,
    private _elRef: ElementRef,
    private pdfService: SavePdfService,
    private rawService: SaveRawService,
    private xlsService: SaveXlsService,
    private webSocketService: WebsocketService,
    private htmlSanitizer: DomSanitizer,
    private clientSessionService: ClientSessionService
  ) {
    if (window.innerWidth > 768 && window.outerWidth < 1360) {
      document
        .getElementsByTagName("body")[0]
        .addEventListener("touchstart", event => {
          const buttonElement = this.utilities.getClosestElement(
            event.target,
            "btn-transparent"
          );
          const dropdownElement = this.utilities.getClosestElement(
            event.target,
            "dropdown-menu"
          );
          const self = this;
          if (buttonElement === undefined && dropdownElement === undefined) {
            if (this.dataSourceDropdown !== undefined) {
              this.dataSourceDropdown.hide();
            }
            if (this.chartTypeDropdown !== undefined) {
              this.chartTypeDropdown.hide();
            }
          }
        });
    }
    document.addEventListener("click", this.offClickHandler.bind(this));
    // this.userId = (<any>window).userId;
    // this.autoInterval = '-1';
    // this.userPreference.getUserPreferences(this.userId).then((result) => {
    //   result.forEach(pref => {
    //     if (pref.field === 'AUTOREFRESH') {
    //       this.autoInterval = pref.preferences;
    //     }
    //   });
    // });
    // console.log('widget ---', JSON.stringify(this.widget));
    this.checkIsMobileScreen();
  }

  ngOnInit() {
    console.log("this.dashTitle" + this.dashTitle);
    this.parentDashboard = this.tabregister
      .getTabByName(this.dashTitle)
      .getCurrentDashboard();
    console.log("this.parentDashboard" + this.parentDashboard.dashboardId);
    this.currentTabId = this.tabregister.getTabByName(this.dashTitle).getId();
    this.chartApiType = CHART_API_CONFIGS.chartConfig.chartApiName;
    this.widgetBroadCastChanel = this.parentDashboard.getBroadcastChannel(
      "widgetUpdatedData"
    );
    this.onDashStateReset = this.parentDashboard.getBroadcastChannel(
      this.dashStateManager.RESET
    );
    this.updateDashabordEventEmitter = this.parentDashboard.getBroadcastChannel(
      "ADD_REMOVE_WIDGETS_IN_FREE_FLOW_DASHBOARD"
    );
    this.expandCollapseWidgetEventEmitter = this.parentDashboard.getBroadcastChannel(
      "EXPAND_COLLAPSE_WIDGET"
    );
    this.perfectSCrollBarEventEmitter = this.parentDashboard.getBroadcastChannel(
      "PERFECT_SCROLL_BAR_EVENT_EMITTER"
    );
    this.CHART_TYPES = CHART_TYPES;
    this.WidgetDataStates = WidgetDataStates;
    this.tabComponentInstance = <TabStripComponent>(
      this.injector.get(TabStripComponent)
    );
    // set defalt dashboard padding to zero
    if (this.dashboardPadding !== undefined && this.dashboardPadding > 0) {
      this.dashboardPadding = Number(this.dashboardPadding);
    } else {
      this.dashboardPadding = 0;
    }
    this.maximinititle();
    //legend show hide
    this.showHideLegendsPdfReportEmmitter();
    const temp = this.tabregister
      .getTabByName(this.dashTitle)
      .getCurrentDashboard();
    this.widgetDtaRender();
  }

  ngDoCheck() {}

  ngOnDestroy(): void {
    this.utilities.clearLegendValues(this.widgetId); // Delete the legend values of the widget from common-utility service.
    this.unSubscribeEmmitters();
    this.realTimeStopHandler();
  }

  unSubscribeEmmitters() {
    for (const index in this.arrSubscription) {
      if (this.arrSubscription[index]) {
        this.arrSubscription[index].unsubscribe();
      }
    }
  }
  /* Code for getting Widget level filters for PDF
    -Creating a string to be passed as filter values to the PDF
    -Value of the string is passed in FilterValue
 */
  getWidgetFilterValues(): any {
    let strFilter;
    let consolidatedFilterstr = "";
    if (this.widgetId) {
      const tempWidget = this.parentDashboard.getWidget(this.widgetId);
      let filters = "";
      if (tempWidget && tempWidget.filterbar) {
        filters = tempWidget.filterbar.displaynames;
      }
      if (filters === "") {
        this.filterValue = `${this.titleToBeDisplayed}`;
      } else {
        const filterNames = filters.split(",");
        const filtermap = this.parentDashboard.getWidgetFilterBarValues(
          this.widgetId,
          true
        );
        const filterArray = [];
        //const widgetFilterTitleArray = [];
        for (const i in filtermap) {
          if (i !== undefined) {
            for (const j in filterNames) {
              if (
                i === filterNames[j] &&
                tempWidget.filterbar.icons[filterNames[j]].hidden == "false"
              ) {
                // added condition to check hidden filter at widget level
                filterArray.push(
                  JSON.parse(
                    '{"' +
                      filterNames[j] +
                      '":  " ' +
                      filtermap[i + "-DisplayedValue"] +
                      '"}'
                  )
                );
              }
            }
          }
        }
        /* Reversing filter values as concatinating strings*/
        for (let i = filterArray.length - 1; i >= 0; i--) {
          strFilter = JSON.stringify(filterArray[i]);
          consolidatedFilterstr = strFilter + " | " + consolidatedFilterstr;
        }
        consolidatedFilterstr = consolidatedFilterstr.substring(
          0,
          consolidatedFilterstr.length - 2
        );
        consolidatedFilterstr = consolidatedFilterstr.replace(/[\{}\']/g, "");
        consolidatedFilterstr = consolidatedFilterstr.replace(/[\"\']/g, "");
        this.filterValue = `${this.titleToBeDisplayed}  -  ${consolidatedFilterstr}`;
        // Below condition added for Badge widget wich does not have a title
        if (this.titleToBeDisplayed === "") {
          this.filterValue = `${consolidatedFilterstr}`;
        }
      }
      this.htmlSanitizer.sanitize(SecurityContext.HTML, this.filterValue);
    }
  }

  /**
   * Checks if data is available in the result array
   * @param result An array of stores with following format
   * {
   *  widgetStore: name of the store,
   *  datapoints: datapoints returned by the server
   * }
   */
  checkIfDataAvailable(result: any) {
    try {
      return result.some(storeResponse => {
        if (storeResponse.datapoints instanceof Array) {
          if (storeResponse.datapoints.length > 0) {
            return true;
          }
          return false;
        } else {
          throw new Error();
        }
      });
    } catch (err) {
      // console.error(err);
      this.invalidDataFound(result);
      this.callDetectChanges();
      return false;
    }
  }

  // common function to call detect changes
  callDetectChanges() {
    if (!this.changeDetector["destroyed"]) {
      this.changeDetector.detectChanges();
    }
  }

  // function to call markForCheck
  // this function checks if changeDector is not destroyed befor calling it.
  callChangeDetectorMarkForCheck() {
    if (!this.changeDetector["destroyed"]) {
      this.changeDetector.markForCheck();
    }
  }

  invalidDataFound(result) {
    if (result[0] && result[0].datapoints.type === "timeOutException") {
      // Fix for #defect 63745
      // this.invalidData = 'It is taking longer to fetch data, please increase the autorefresh time interval from settings.';
      if (this.parentDashboard["autoRefresh"] === true) {
        this.invalidData = this.i18nDirective.getTranslatedValue(
          "largeDataMessage",
          "largeDataMessage"
        );
      } else {
        this.invalidData = this.i18nDirective.getTranslatedValue(
          "maxWidgetDataTimeoutMessage",
          "maxWidgetDataTimeoutMessage"
        );
      }
      this.stateOfWidgetDataLoading = WidgetDataStates.AUTO_TIMEOUT;
    } else if (result[0] && result[0].datapoints) {
      this.invalidData = JSON.stringify(result[0].datapoints) + "";
      this.stateOfWidgetDataLoading = WidgetDataStates.DATA_INVALID;
    } else {
      this.invalidData = JSON.stringify(result) + "";
      this.stateOfWidgetDataLoading = WidgetDataStates.DATA_INVALID;
    }
  }

  /**
   * Show NO_DATA_FOUND message
   * Also sends update event for listener charts to do the same
   */
  noDataFound() {
    this.stateOfWidgetDataLoading = WidgetDataStates.NO_DATA_FOUND;
    if (this.isMasterWidget()) {
      this.masterWidgetEmitter.emit({
        action: "ON_MASTER_LOAD",
        comment: WidgetDataStates.NO_DATA_FOUND
      });
    }
    this.callDetectChanges();
  }

  /**
   * Show ERROR_IN_FETCHING_DATA message
   * Also sends update event for listener charts to do the same
   */
  errorInFetchingData(error?) {
    console.error("Error in widget getData", error);
    this.stateOfWidgetDataLoading = WidgetDataStates.ERROR_IN_FETCHING_DATA;
    if (this.isMasterWidget()) {
      this.masterWidgetEmitter.emit({
        action: "ON_MASTER_LOAD",
        comment: WidgetDataStates.ERROR_IN_FETCHING_DATA
      });
    }
    this.callDetectChanges();
  }

  /**
   * Hide LOADING overlay.
   * Update the graph with current data
   * If this widget is a master widget,
   * then emit an ON_MASTER_LOAD event for the listener chart along with all the parameters and paramsFromMaster if any
   * @param paramsFromMaster ParamMap received from master chart if any (to be forwarded to the listener chart).
   */
  dataLoadedFromQuery(paramsFromMaster?: object) {
    let masterParam: any;
    masterParam = paramsFromMaster;
    this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
    // this.updateGraphWebWorker().then(result => {
    if (
      this.widget.chartIdentity.length &&
      this.widget.chartIdentity[0].master
    ) {
      let masterWidget = this.parentDashboard.getWidget(
        this.widget.chartIdentity[0].master
      );
    }
    this.preDataObservable = this.dataObservable;
    let widgetTitle =
      this.widget && this.widget.toolbar && this.widget.toolbar.title
        ? this.widget.toolbar.title
        : this.widget.id;
    let st = new Date();
    let time = `${st.getHours()}:${st.getMinutes()}:${st.getSeconds()}:${st.getMilliseconds()}`;
    console.log(
      `Data received and rendering started for widget '${widgetTitle}' @${time}`
    );

    // if (this.widget.dynamicseries) {
    //     this.loadDynamicSeries();
    // } else {
    //     this.updateGraph();
    // }
    if (this.widget.dynamicseries) {
      setTimeout(() => {
        this.loadDynamicSeries();
      }, 0);
    } else {
      setTimeout(() => {
        this.updateGraph();
      }, 0);
    }
    let et = new Date();
    time = `${et.getHours()}:${et.getMinutes()}:${et.getSeconds()}:${et.getMilliseconds()}`;
    console.log(`Rendering finished for widget '${widgetTitle}' @${time}`);
    // });

    this.setWidgetContainerStyle();
    // Removed masterWidget ON_MASTER_LOAD event. This will now be published by the library with all the required attributes
    /*
    if ( this.isMasterWidget() ) {
      const extraParameterMap = this.calculateExtraParams(0, paramsFromMaster);
      this.masterWidgetEmitter.emit({
                          action: 'ON_MASTER_LOAD',
                          params: this.calculateXLabel(this.chartData.data[0].dataPoints[0], this.chartApiType),
                          masterParameter: this.widget.chartIdentity[this.drilldownIndexInChartIdentity].parameter,
                          extraParameters: extraParameterMap
                        });
    } */
  }
  /**
   * Loads the dynamic series based on the this.dataObservable
   * Steps:
   * 1. Transpose the data using utilities
   * 2a. If more than one series/this.dataObservables from JSON then do mergeSortedSeries using utilities and store it in mergedData
   * 2b. Else store transposedData in mergedData
   * 3. For each column in mergedData apart from mergedData.widgetSeriesConfig.labelColumn and mergedData.widgetSeriesConfig.labelSortColumn
   *    create an object with datapoints and widgetStore properties and Push that to dataObservablesForChart.
   * 4. After finishing with step 3, save the dataObservablesForChart in this.dataObservable
   * 5. Call updateGraph. This should render all th required series.
   */
  loadDynamicSeries() {
    const transposedDataList: Array<{ objects; widgetSeriesConfig }> = [];
    const widgetLevelLabelsortColumn = this.widget.labelsortcolumn;
    // const webWorkers = new Worker('./assets/webWorkers/updateGraphWebWorker.js');
    // webWorkers.postMessage({ data: this.dataObservable, action: 'DATA_PROCESSING_DYNAMIC_SERIES_STEP1'});
    // webWorkers.onmessage
    const eP = this.widget.chartIdentity;
    this.dataObservable.forEach(dataPointsSet => {
      const x =
        widgetLevelLabelsortColumn || dataPointsSet.widgetStore.labelColumn;
      const transposeData = this.utilities.transposeData(
        dataPointsSet.datapoints,
        dataPointsSet.widgetStore,
        x,
        eP
      );
      transposedDataList.push({
        objects: transposeData[0],
        widgetSeriesConfig: dataPointsSet.widgetStore
      });
      this.extraparameters = transposeData[1];
    });
    let mergedData: {
      objects: Array<object>;
      widgetSeriesConfig: {
        labelColumn: string;
        labelSortColumn: string;
      };
    };

    // Do merging if required
    if (transposedDataList.length === 1) {
      mergedData = transposedDataList[0];
    } else {
      mergedData = this.utilities.mergeSortedSeries(
        transposedDataList,
        this.widget.xaxisLabelType,
        widgetLevelLabelsortColumn,
        eP
      );
    }

    const dataObservablesForChart = [];
    // transposedDataList.forEach( (mergedData) => {
    // Find out the seriesSet
    const seriesSet = Object.keys(mergedData.objects[0]);
    let indexToSplice = seriesSet.indexOf(widgetLevelLabelsortColumn);
    if (indexToSplice !== -1) {
      seriesSet.splice(indexToSplice, 1);
    }
    indexToSplice = seriesSet.indexOf(
      mergedData.widgetSeriesConfig.labelColumn
    );
    if (indexToSplice !== -1) {
      seriesSet.splice(indexToSplice, 1);
    }

    indexToSplice = seriesSet.indexOf(
      mergedData.widgetSeriesConfig.labelColumn.toLowerCase()
    );
    if (indexToSplice !== -1) {
      seriesSet.splice(indexToSplice, 1);
    }

    indexToSplice = seriesSet.indexOf(widgetLevelLabelsortColumn);
    if (indexToSplice !== -1) {
      seriesSet.splice(indexToSplice, 1);
    }

    indexToSplice = seriesSet.indexOf(widgetLevelLabelsortColumn.toLowerCase());
    if (indexToSplice !== -1) {
      seriesSet.splice(indexToSplice, 1);
    }

    // Save the Legend values in common-utility service which will be required when the chart type is changed to grid.
    this.utilities.setLegendValues(seriesSet, this.widgetId);
    for (const dataObj in mergedData["dataObject"]) {
      const index = seriesSet.indexOf(
        mergedData["dataObject"][dataObj]["labelcolumn"]
      );
      if (index !== -1) {
        seriesSet.splice(index, 1);
      }
    }

    seriesSet.forEach(seriesName => {
      let plot;
      let labelSortColumn;
      if (this.multiplePlots && mergedData["dataObject"]) {
        plot = mergedData["dataObject"][seriesName]["plot"];
      } else {
        plot = mergedData.widgetSeriesConfig["plot"] || "default";
      }
      if (mergedData["dataObject"] && mergedData["dataObject"][seriesName]) {
        labelSortColumn = mergedData["dataObject"][seriesName]["labelcolumn"];
      } else {
        labelSortColumn = mergedData.widgetSeriesConfig.labelColumn;
      }
      dataObservablesForChart.push({
        datapoints: mergedData.objects,
        widgetStore: {
          label: labelSortColumn,
          labelSortColumn: labelSortColumn,
          labelunit: (<any>mergedData.widgetSeriesConfig).labelunit,
          labeltype: (<any>mergedData.widgetSeriesConfig).labeltype,
          labelformat: (<any>mergedData.widgetSeriesConfig).labelformat,
          value: seriesName,
          name: seriesName,
          plot: plot
        }
      });
    });
    // });

    this.dataObservable = dataObservablesForChart;
    this.updateGraph(); // dataObservablesForChart);
  }

  connectorError: any = "";
  errorReceived: boolean = false;

  checkForErrorInAllDD(result) {
    result.some(res => {
      if (
        res.hasOwnProperty("response_code") ||
        res.hasOwnProperty("errorcode")
      ) {
        this.errorReceived = true;
        this.connectorError = res.response_code + " : " + res.response_message;
        this.stateOfWidgetDataLoading = WidgetDataStates.CONNECTOR_ERROR;
        this.callDetectChanges();
        return;
      }
    });
    return this.errorReceived;
  }

  getData(
    btnClick?: boolean,
    index?: string,
    para?: string,
    extraParameters?: object,
    widgetID?: string
  ): void {
    // debugger;
    this.errorReceived = false;
    this.connectorError = "";
    if (this.widgetId !== undefined) {
      // this.dataObservable = this.parentDashboard.queryCacheFor(this.widgetId);
      /* if (window.OFFLINE_MODE) {

        this.updateGraph();
        this.setWidgetContainerStyle();
      } else { */
      const masterParams = {};
      masterParams[para] = index;

      this.stateOfWidgetDataLoading = WidgetDataStates.LOADING;
      if (index === undefined) {
        const currentObject = this;
        if(Object.keys(this.parentDashboard.actualAllMasterParams).length > 0){
          this.updateChartTitle(this.parentDashboard.actualAllMasterParams)
        }
        else if (this.parentDashboard.allMasterParams) {
          this.updateChartTitle(this.parentDashboard.allMasterParams);
        } else {
          this.updateChartTitle();
        }

        if (extraParameters && extraParameters["resetChart"]) {
          this.parentDashboard.clearTransformationFilters(this.widgetId);
        }

        let dashboardIdTobePassed = "";
        if (this.widget.widgetPreviewMode === true) {
          dashboardIdTobePassed = this.widget.previousId; // the original widget id of dragged widget
        } else {
          dashboardIdTobePassed = this.parentDashboard.dashboardId.toString();
        }

        if (this.parentDashboard["autoRefresh"] === true) {
          // this.autoInterval = '1'; // this.parentDashboard.timeInterval;
          this.autoInterval = this.parentDashboard["timeInterval"];
        } else {
          this.autoInterval = "-1";
        }
        // this.maxWidgetDataTimeout = '30';
        this.onButtonClickWidgetLevelFilter(btnClick);
        /* code for duration display start*/
        this.parentDashboard
          .getDataFor(
            this.widgetId,
            dashboardIdTobePassed,
            this.autoInterval,
            this.maxWidgetDataTimeout,
            btnClick
          )
          .then(result => {
            if (this.checkForErrorInAllDD(result)) {
              this.parentDashboard.widgetLoaded(this.widgetId, true);
              this.getWidgetFilterValues();
              this.updateWidgetTitleBarwithFilterValues();
              if (this.isMasterWidget()) {
                this.masterWidgetEmitter.emit({
                  action: "ON_MASTER_LOAD",
                  comment: WidgetDataStates.ERROR_IN_FETCHING_DATA
                });
              }
              return;
            } else {
              this.callDetectChanges();
            }
            // this.parentDashboard.setDashboarJsons( this.widgetId, result );
            // Assign the result in this.dataObservable

            this.dataObservable = result;
            this.preDataObservable = result;
            if (this.checkIfDataAvailable(result)) {
              this.parentDashboard.widgetLoaded(this.widgetId, true);
              this.getWidgetFilterValues();
              this.updateWidgetTitleBarwithFilterValues();
              // Check if Data Source is WebSocket-  currently hardcoded but will need a way to handle it at runtime.
              if (result.length > 0) {
                if (
                  this.getChartType() === "bulletmap" &&
                  result[0].datapoints &&
                  result[0].datapoints.length > 5000
                ) {
                  this.showlargeDataMsg("large data loaded");
                  return;
                }
                if (
                  result[0].widgetStore.storeNameInQueryTable ===
                  "websockstore_1"
                ) {
                  for (let resultObject of result) {
                    if (
                      resultObject.datapoints &&
                      resultObject.datapoints.length === 1
                    ) {
                      if (
                        resultObject.datapoints[0].constructor.name === "Record"
                      ) {
                        this.webSocketURL =
                          resultObject.datapoints[0].url + "/ws";
                        resultObject.datapoints = new Array();
                      }
                    }
                  }
                  if (this.getChartType() == "badge") {
                    result[0].widgetStore["name"] = this.widget.properties.name;
                    this.widget.getWidgetStores()[0][
                      "name"
                    ] = this.widget.properties.name;
                  }
                  this.isRealTimeGraph = true;
                  this.initWebSocketChart(result); // create web socket for realtime data
                } else {
                  this.dataLoadedFromQuery();
                }
              }
            } else if (
              this.stateOfWidgetDataLoading !== WidgetDataStates.DATA_INVALID &&
              this.stateOfWidgetDataLoading !== WidgetDataStates.AUTO_TIMEOUT
            ) {
              this.getWidgetFilterValues();
              this.updateWidgetTitleBarwithFilterValues();
              this.noDataFound();
              this.parentDashboard.widgetLoaded(this.widgetId, false);
            } else {
              // Fix for Defect:- 73290 - Lyra_EngineAutomation_RegressionDefect :- Download and Kebab buttons
              // are missing on UI for dashboard having error message [Internal server error]
              if (
                this.stateOfWidgetDataLoading === WidgetDataStates.DATA_INVALID
              ) {
                this.parentDashboard.widgetLoaded(this.widgetId, true);
                this.getWidgetFilterValues();
                this.updateWidgetTitleBarwithFilterValues();
              }
            }
          })
          .catch(error => {
            this.errorInFetchingData(error);
            this.parentDashboard.widgetLoaded(this.widgetId, false);
          });
      } else {
        this.updateChartTitle({ ...masterParams, ...extraParameters });
        let obj = { parameter: "" };
        this.parentDashboard.widgets.forEach(widget => {
          if (widget.chartidentity) {
            widget.chartidentity.forEach( identity => {
              if (
                identity.name ==
                this.masterWidgetId
              ) {
                if (identity.widgetTitle) {
                  obj.parameter = identity.widgetTitle;
                  if (identity.actualExtraValues) {
                    obj["extraParameters"] =
                    identity.actualExtraValues;
                  }
                }
              }
            });
          } else if (widget.layoutWidgets) {
            widget.layoutWidgets.forEach(widget => {
              widget.chartidentity.forEach( identity => {
                if (
                  identity.name ==
                  this.masterWidgetId
                ) {
                  if (identity.widgetTitle) {
                    obj.parameter = identity.widgetTitle;
                    if (identity.actualExtraValues) {
                      obj["extraParameters"] =
                      identity.actualExtraValues;
                    }
                  }
                }
              });
            });
          }
        });
        this.updateChartTitle(obj);
        const allParams: object = Object.assign(
          {},
          masterParams,
          extraParameters
        );
        if (this.parentDashboard.getExtraQueries(this.widgetId) === undefined) {
          this.parentDashboard.setExtraQueries(this.widgetId, allParams);
        }
        /**
         * Added btnClick listner widget level filter
         */
        this.parentDashboard
          .getDataFor(
            this.widgetId,
            this.parentDashboard.dashboardId,
            this.autoInterval,
            this.maxWidgetDataTimeout,
            btnClick
          )
          .then(result => {
            let lenArr = [];
            for (var x = 0; x < result.length; x++) {
              let len = result[x].length;
              lenArr.push(len);
            }
            if (!lenArr.includes(0)) {
              if (this.checkForErrorInAllDD(result)) {
                if (this.isMasterWidget()) {
                  this.masterWidgetEmitter.emit({
                    action: "ON_MASTER_LOAD",
                    comment: WidgetDataStates.ERROR_IN_FETCHING_DATA
                  });
                }
                return;
              } else {
                this.callDetectChanges();
              }
              this.dataObservable = result;
              this.preDataObservable = result;
              // this.parentDashboard.setDashboarJsons( this.widgetId, result );
              /* Added code for pdf for master listner*/
              this.getWidgetFilterValues();
              this.updateWidgetTitleBarwithFilterValues();
              if (this.checkIfDataAvailable(result)) {
                // Pass on allParams from the master chart so that it can be forwarded to the listener chart of current widget if required.
                if (result[0] && result[0].type !== undefined) {
                  if (result[0].type === "timeOutException") {
                    this.stateOfWidgetDataLoading =
                      WidgetDataStates.AUTO_TIMEOUT;
                    return;
                  }
                }
                //for treechart drilldown
                //  this.widget.properties.widgetDataType = "static";
                // if (this.widget.properties.widgetDataType == "static") {
                //   this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
                //   let params2 = Object.keys(allParams['param']);
                //   let localfield = JSON.parse(JSON.stringify(this.dataObservable));
                //   this.filteredArrayObservable = localfield;
                //   let filteredArray = this.filteredArrayObservable[0].datapoints.filter((data) => data.name == params2[0] || data.name == params2[1]);
                //   this.filteredArrayObservable[0].datapoints = filteredArray;
                //   this.updateGraphWebWorker().then((resulte) => {
                //     this.updateGraph();
                //  });
                //   this.parentDashboard.widgetLoaded(this.widgetId, true);
                //   this.checkIconsToBeCollapsed();
                //  // this.dataObservable[0].datapoints = datapoints;
                // }
                // else{
                this.dataLoadedFromQuery(allParams);
                this.parentDashboard.widgetLoaded(this.widgetId, true);
                //}
              } else if (
                this.stateOfWidgetDataLoading !== WidgetDataStates.DATA_INVALID
              ) {
                this.noDataFound();
                this.parentDashboard.widgetLoaded(this.widgetId, false);
              }
              if (
                this.widget.type === "map" &&
                this.widget.chartIdentity[0].type === "listener"
              ) {
                this.checkIfMapNotSupported = this.checkMapSupported(
                  result,
                  allParams
                );
                if (this.checkIfMapNotSupported) {
                  this.stateOfWidgetDataLoading =
                    WidgetDataStates.MAP_NOT_SUPPORTED;
                } else {
                  this.utilities.setDataObservableForTooltip(
                    this.dataObservable
                  );
                }
              }
            } else {
              this.stateOfWidgetDataLoading =
                WidgetDataStates.ERROR_IN_FETCHING_DATA;
            }
          })
          .catch(error => {
            this.errorInFetchingData(error);
            this.parentDashboard.widgetLoaded(this.widgetId, false);
          });
      }
      // }
    } else {
      console.warn("Tried to get data but widget's index is not defined");
    }
  }

  setWidgetContainerStyle(): void {
    this.parentDashboard = this.tabregister
    .getTabByName(this.dashTitle)
    .getCurrentDashboard();
  
    if (window.innerWidth < 768) {
      this.position = "relative";
      this.widgetStyle = {
        width: "100%",
        position: this.position,
        "margin-bottom": "10px"
      };

      const height = Number(parseInt(this.widget.rowspan) * this.rowHeight);
      if (this.cutomWidgetStyle.indexOf("height") === -1) {
        this.widgetStyle["height.px"] = height;
      }
      this.errorStyle = {
        "height.px": Number(height - 85)
      };
    } else {
      this.position = "absolute";
      /* const rowspan = Number( this.widget.rowspan );
      const height = this.widget.collapsed === true ? 40 : rowspan * this.rowHeight;
      this.widgetStyle = {
        'height.px': height,
        'width.px': ( Number( this.widget.colspan ) * this.colWidth ),
        'left.px': (Number( this.widget.xpos) * this.colWidth),
        'top.px': (Number(this.widget.ypos) * this.rowHeight) +
                  ( this.widget.topMarginToWidget ? this.widget.topMarginToWidget : 0 ),
        'position': this.position,
        'paddingLeft.px': this.widget.containerPaddingLeft,
        'paddingTop.px': this.widget.containerPaddingTop,
        'paddingRight.px': this.widget.containerPaddingRight,
        'paddingBottom.px': this.widget.containerPaddingBottom
      }; */

      // condition for leftmost widget
      if (Number(this.widget.xpos) === 0) {
        if (this.widget.containerPaddingLeft === undefined) {
          this.widget.containerPaddingLeft = 0;
        }
      } else {
        if (this.widget.containerPaddingLeft === undefined) {
          this.widget.containerPaddingLeft = 5;
        }
      }
      // condition for rightmost widget
      if (
        Number(this.widget.xpos) + Number(this.widget.colspan) ===
        Number(this.parentDashboard.totalcols)
      ) {
        if (this.widget.containerPaddingRight === undefined) {
          this.widget.containerPaddingRight = 0;
        }
      } else {
        if (this.widget.containerPaddingRight === undefined) {
          this.widget.containerPaddingRight = 5;
        }
      }
      const rowspan = Number(this.widget.rowspan);
      let height =
        this.widget.collapsed === true ? 40 : rowspan * this.rowHeight;
      if (this.widget.widgetDataDefType === "Data_definition") {
        height = this.widget.style;
      }
      const left =
        Number(this.widget.xpos) * this.colWidth +
        Number(this.dashboardPadding) / 2;
      const widgetPaddingLeft = this.widget.containerPaddingLeft || 0;
      const widgetPaddingRight = this.widget.containerPaddingRight || 0;
      const widgetWidth = Number(this.widget.colspan) * this.colWidth; // - ( widgetPaddingLeft + widgetPaddingRight );

      this.widgetStyle = {
        "height.px": height,
        "width.px": widgetWidth,
        "left.px": left,
        "top.px":
          Number(this.widget.ypos) * this.rowHeight + this.widget.topBuffer,
        position: this.position,
        "paddingLeft.px": this.widget.containerPaddingLeft,
        "paddingTop.px": this.widget.containerPaddingTop,
        "paddingRight.px": this.widget.containerPaddingRight,
        "paddingBottom.px": this.widget.containerPaddingBottom,
        "box-sizing": "border-box"
      };

      // set the position of widget error messages on resize of widget
      const canvasWidgetError = <any>(
        document.querySelector(".canvas-widget-error")
      );
      const wraperror = <any>document.querySelector(".wrap-error");
      let canvasWidgetErrorTop;
      if (canvasWidgetError !== null) {
        const canvasWidgetErrorHeight = height - 55 - wraperror.clientHeight;
        if (canvasWidgetErrorHeight < 0) {
          canvasWidgetErrorTop = 0;
        } else {
          canvasWidgetErrorTop = Number(canvasWidgetErrorHeight / 2);
        }
      }
      this.iswidgetResized = widgetWidth < 300 && height < 300 ? true : false;

      if (
        this.stateOfWidgetDataLoading === WidgetDataStates.NO_DATA_FOUND ||
        this.stateOfWidgetDataLoading ===
          WidgetDataStates.ERROR_IN_FETCHING_DATA ||
        this.stateOfWidgetDataLoading === WidgetDataStates.LOADING ||
        this.stateOfWidgetDataLoading === WidgetDataStates.AUTO_TIMEOUT ||
        this.stateOfWidgetDataLoading === WidgetDataStates.LARGE_DATA ||
        this.stateOfWidgetDataLoading === WidgetDataStates.CONNECTOR_ERROR
      ) {
        if (this.iswidgetResized) {
          this.errorStyle = {
            "height.px": Number(height - 85)
          };
          this.errorStyleForContent = {
            "top.px": canvasWidgetErrorTop
          };
        } else {
          this.errorStyle = {
            height: "auto"
          };
          this.errorStyleForContent = {
            "top.px": canvasWidgetErrorTop
          };
        }
      } else {
        if (this.stateOfWidgetDataLoading === WidgetDataStates.DATA_INVALID) {
          // long msg
          this.errorStyle = {
            "height.px": Number(height - 85)
          };
        }
      }
    }
    this.widgetWidth = this.widgetStyle["width.px"];
    this.setGraphHeight();
    this.checkIconsToBeCollapsed();
    this.callDetectChanges();
    this.callChangeDetectorMarkForCheck();
    // redraw Circos chart after widget is resized
    if (this.widget.type.toLowerCase() === "chord") {
      this.updateGraph();
    }
    if (this.widget.type.toLowerCase() === "web") {
      this.updateWebGraph();
    }
  }

  ngAfterViewInit(): void {
    this.rawService.setI18Object(this.i18nDirective);
    this.xlsService.setI18Object(this.i18nDirective);
    this.pdfService.setI18Object(this.i18nDirective);
    this.setWidgetTitle();
    this.initGraph();
    this.dashBoardElement = document.getElementsByClassName(
      "dashbaord-template-manger-wrapper"
    );
    this.rowHeight = this.utilities.getRowHeight(
      this.parentDashboard.blockHeight
    );
    this.widgetStyleHandler();
    this.widgetExpandCollapseHandler();
    if (this.widget.filterbar !== undefined) {
      this.filterLength = Object.keys(this.widget.filterbar.icons).length;
      let widgetFilterIcons = Object.values(this.widget.filterbar.icons);
      //to hide the filter icon at widget lele filter in case of all filter are hidden at widget level
      let allHiddenFilters = widgetFilterIcons.filter(
        (item: any) => item.hidden == "true"
      );
      if (this.filterLength > 0) {
        if (this.filterLength == allHiddenFilters.length) {
          this.areAllFilterHidden = true;
        } else {
          this.areAllFilterHidden = false;
        }
      }
    }

    this.hasOwnStyle =
      this.widget.style && this.widget.style.indexOf("background") !== -1;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.handleRealTimeSubscriber(changes);
    if (
      changes.colWidth !== undefined &&
      changes.colWidth.currentValue !== NaN &&
      this.widget !== undefined
    ) {
      this.setWidgetContainerStyle();
    }
    if (changes.activeTabIndex !== undefined) {
      this.updateBadgeGraphOnTabChange();
    }
  }

  // set widget title, due to variations in json picking up the widget name sometime from toolbar and some time from most parent level
  setWidgetTitle() {
    let tempWidgetTitle = "";
    if (this.paramWidget.toolbar !== undefined) {
      tempWidgetTitle =
        this.paramWidget.toolbar.title || this.paramWidget.title;
    } else {
      tempWidgetTitle = this.paramWidget.title;
    }
    if (tempWidgetTitle !== undefined && tempWidgetTitle !== "") {
      tempWidgetTitle = tempWidgetTitle.split(" ")[0];
    }
    this.widgetTitle = tempWidgetTitle;
  }

  initGraph(delay = <number>0): void {
    if (this.widgetDynamicChart !== undefined) {
      this.widget = this.widgetDynamicChart;
    } else {
      this.widget = this.parentDashboard.getWidget(this.widgetId);
    }
    // set background image for widget
    this.setBackgroundImg();
    this.isMaximized = this.widget.isMaximized;
    this.widgetType = this.widget.type;
    this.setWidgetTitleLangKey();
    if (this.widget.plots !== undefined && this.widget.plots.length > 1) {
      this.multiplePlots = true;
    }
    if (this.widget.widgetDataDefType === "Data_definition") {
      this.cutomWidgetStyle = "height: 100%";
    } else {
      this.cutomWidgetStyle = this.widget.style;
    }
    this.customToolbarStyle = this.widget.toolbar
      ? this.widget.toolbar.style
      : "";

    /* if ( this.widget.type === 'grid' ) {
      this.currentChartApiType = 'grid';
      this.chartApiType = 'grid';
    } else { */
    // this.currentChartApiType = this.widget.chartApiType || this.chartApiType;
    let chartLibMapping = chartToLibraryMapping[
      this.widget.type.toLowerCase()
    ] || { library: "grid", name: "grid" };
    this.currentChartApiType = chartLibMapping["library"];
    this.currentChartType = chartLibMapping["name"];
    this.chartApiType = this.currentChartApiType;
    if (this.widget.plots !== undefined && this.widget.plots[0] !== undefined) {
      if (this.widget.plots[0].type === "StackedColumns") {
        this.currentChartType = "column-stacked";
      } else if (this.widget.plots[0].type === "StackedBars") {
        this.currentChartType = "bar-stacked";
      }
    }

    // resolve white space plotting in grid
    if (this.currentChartType === "grid") {
      if (this.widget.properties.paginationConf !== "") {
        this.widgetType = this.widgetType + " grid-widget-container";
      } else {
        this.widgetType =
          this.widgetType + " grid-widget-container-no-pagination";
      }
    } else {
      this.widgetType = this.widgetType;
    }

    /*this.savedState = this.dashStateManager.getWidgetState(this.currentTabId, this.widgetId);
    if (this.savedState !== undefined && this.savedState.newChartType !== undefined) {
      chartLibMapping = (chartToLibraryMapping[this.savedState.newChartType.toLowerCase()] || { 'library': 'grid', 'name': 'grid' });
      this.currentChartApiType = chartLibMapping['library'];
      this.currentChartType = chartLibMapping['name'];
    }*/
    this.arrSubscription["onDashStateReset"] = this.onDashStateReset.subscribe(
      params => {
        this.resetWidgetChartTypeState();
      }
    );

    // Save x-axis and y-axis title and properties
    if (
      typeof this.widget.axes ===
      "object" /* &&
      this.widget.axes.constructor === Array  */
    ) {
      this.widget.axes.forEach(axis => {
        /* if (axis.title && this.parentDashboard.pageId ) {
          axis.title = this.i18nDirective.getTranslatedValue(axis.title, this.parentDashboard.pageId);
        } */
        if (axis.name === "x") {
          this.xAxisTitle = axis.title;
        } else if (axis.name === "y") {
          this.yAxisTitle = axis.title;
        }
      });
    }

    // Keep the master index from chartidentity handy for use.
    this.drilldownIndexInChartIdentity = -1;
    this.widget.chartIdentity.some((element, index) => {
      if (this.checkIfDrillDownChartIdentity(element)) {
        this.drilldownIndexInChartIdentity = index;
        return true;
      }
      return false;
    });

    // Set empty listener widget subscribers
    this.listenerWidgetEmitters = [];

    const proseedInitGraphForMaster = () => {
      // if (typeof this.widget.toolbar !== "undefined") {
        if(Object.keys(this.parentDashboard.actualAllMasterParams).length > 0){
          this.updateChartTitle(this.parentDashboard.actualAllMasterParams)
        }
        else if (this.parentDashboard.allMasterParams) {
        this.updateChartTitle(this.parentDashboard.allMasterParams);
      } else {
        this.updateChartTitle();
      }
      this.setMasterListener();
      this.setWidgetContainerStyle();
      /* if ( (<any>this.parentDashboard.filterbar).filterBarLoaded === true ) {
        this.getData();
      } */
      if (this.widget.badgeType === "titleBadge") {
        this.dataLoadedFromQuery();
        this.parentDashboard.widgetLoaded(this.widgetId, true);
      } else if (this.widget.type.toLowerCase() === "web") {
        this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
        // this.parentDashboard.widgetLoaded(this.widgetId, true);
      } else if (
        this.widget.isRealTime === true ||
        this.widget.isRealTime === "true"
      ) {
        this.realTimeInit();
      } else {
        if (this.widget.filterbar !== undefined) {
          this.filterLength = Object.keys(this.widget.filterbar.icons).length;
          if (this.filterLength < 1) {
            this.getData();
          }
        } else if (this.widget.filterbar === undefined) {
          this.getData();
        }
      }
      // }
    };

    /*Wait for master functionality
     * It will set style to widget with an empty graph. The graph will get loaded on load of its related master.
     */
    const proseedEmptyInitGraphForListner = () => {
      this.setMasterListener();
      this.setWidgetContainerStyle();
    };

    if (this.isListnerWidget()) {
      proseedEmptyInitGraphForListner();
    } else {
      if (delay) {
        this.zoneService.runOutsideAngular(() => {
          setTimeout(() => {
            proseedInitGraphForMaster();
          }, delay);
        });
      } else {
        proseedInitGraphForMaster();
      }
    }
  }

  /*
  Update the chart title based on the filterMap and extraParams.
  Update only if the toolbar exists and the title is a string
  */
  updateChartTitle(extraParams?: object, titleForListener?: string): void {
    if (
      typeof this.widget.toolbar === "object" &&
      typeof this.widget.toolbar.title === "string"
    ) {
      extraParams = extraParams || {};
      this.titleToBeDisplayed = this.utilities.substituteAllFromMap(
        this.widget.toolbar.title,
        Object.assign(
          {},
          (<any>this.parentDashboard).filterMap ||
            (<any>this.parentDashboard).filterBarValues ||
            {},
          extraParams || {}
        )
      );
      if (this.widget.toolbar.titleUpdation !== "replace") {
        let element = "";
        if (
          this.widget.hasOwnProperty("attachedDrillDownMetrics") &&
          this.widget.attachedDrillDownMetrics
        ) {
          let attachedDrillDownMetrics = this.widget.attachedDrillDownMetrics;
          let newExtraParamsObj = {};

          attachedDrillDownMetrics.forEach(val => {
            if (extraParams.hasOwnProperty(val)) {
              newExtraParamsObj[val] = extraParams[val];
            }
          });
          extraParams = newExtraParamsObj;
        }
        for (const parameter in extraParams) {
          if (extraParams.hasOwnProperty(parameter)) {
            element = extraParams[parameter];
            const elementKeysLength = Object.keys(element).length;
            if (typeof element === "object" && elementKeysLength > 0) {
              //angular upgrade change
              //element = Object["values"](extraParams[parameter])[0];
              let params = "";
              element = Object["values"](extraParams[parameter])[0].toString();
            }
            if (
              element !== "" &&
              JSON.stringify(element) !== "{}" &&
              element.length !== 0
            ) {
              this.titleToBeDisplayed += " - " + element;
            }
          }
        }
      }
    }
    if (
      titleForListener !== undefined &&
      this.widget.toolbar !== undefined &&
      this.widget.toolbar.titleUpdation !== "replace"
    ) {
      this.titleToBeDisplayed += " - " + titleForListener;
    }
  }

  // function to set language key for widget title
  // the widgets title itself being used as langague key, widget title not suppose to content any space.
  setWidgetTitleLangKey() {
    if (
      typeof this.widget.toolbar === "object" &&
      typeof this.widget.toolbar.title === "string"
    ) {
      this.widgetTitleLangKey = this.widget.toolbar.title.replace(" ", "_");
    }
  }

  clearSelectedPlotValues() {
    this.widget.plotValues = {};
  }

  // function to broadcast and recieve  messages
  setMasterListener(): void {
    // this condition is for master, to set master channel to broadcast message
    if (this.isMasterWidget()) {
      this.masterWidgetEmitter = this.parentDashboard.getBroadcastChannel(
        this.widget.chartIdentity[this.drilldownIndexInChartIdentity].name
      );
      // this.waitForMasterEmmitter = this.parentDashboard.getBroadcastChannel(this.widget.id);
    }

    // this condition is for child, to get broadcast channel of relative master
    let isListener = false;

    this.widget.chartIdentity.forEach(individualChartIdentity => {
      if (
        individualChartIdentity.type === "master" &&
        individualChartIdentity.hasOwnProperty("publishTitleToListeners")
      ) {
        this.widget["titleForListener"] =
          individualChartIdentity.publishTitleToListeners;
      }
      if (this.checkIfListenerChartIdentity(individualChartIdentity)) {
        this.listenerWidgetEmitters.push(
          this.parentDashboard.getBroadcastChannel(
            individualChartIdentity.master
          )
        );

        // subscribe master channel
        this.arrSubscription[
          "lisnerSubscription_for_" + individualChartIdentity.master
        ] = this.listenerWidgetEmitters[
          this.listenerWidgetEmitters.length - 1
        ].subscribe(params => {
          /** Emitted from presenters.ts:emitWidgetClearSelection
           *  It will clear widget selection after dashboard refresh
           */
          if (params === "CLEAR_WIDGET_SELECTION") {
            this.clearSelectedPlotValues();
            return;
          }

          this.masterWidgetId = individualChartIdentity.master;
          const action = params.action || null;
          switch (action) {
            case "ON_MASTER_LOAD":
              {
                this.masterWidgetLoaded = true;
                if (
                  this.widget.cyclicFilter !== "true" ||
                  !this.parentDashboard.isWidgetLoaded(this.widgetId)
                ) {
                  if (this.widget.type.toLowerCase() === "web") {
                    const obj = {
                      value: ""
                    };
                    // obj.name = params.masterParameter;
                    obj.value = params.params;
                    // Updating the chart title ON_MASTER_LOAD;
                    this.updateChartTitle(obj);
                    this.webWidgetListnerEventHandler("ON_MASTER_LOAD", params);
                    break;
                  }
                  // Defect 84608: 
                  // If Transforamtion widget is Listener from a Real widget then to avoid full data shown in widget, 
                  // on load of Dataset Master widget restricting it to get loaded.
                  if((!this.isCyclicFilter()) && this.isTransformationWidget() && this.isMasterDataset(params.chartIdentity)) {
                    let masterWidgetId = params.chartIdentity.name;
                    if(this.parentDashboard.isWidgetLoaded(masterWidgetId) && this.isListenerToRealWidget(masterWidgetId)) {
                      break;
                    }
                  }
                  if (
                    (this.widget["waitForMaster"] === true &&
                      (individualChartIdentity.waitForMaster === true ||
                        individualChartIdentity.waitForMaster === "true")) ||
                    this.widget["waitForMaster"] === false
                  ) {
                    if (typeof params.comment !== "undefined") {
                      this.stateOfWidgetDataLoading = params.comment;
                      if (this.isMasterWidget()) {
                        this.masterWidgetEmitter.emit({
                          action: "ON_MASTER_LOAD",
                          comment: params.comment
                        });
                      }
                      this.callDetectChanges();
                      this.updateChartTitle();
                      // this.changeDetector.markForCheck();
                    } else {
                      /* On update of master widget filter Listener should updated */
                      this.widgetData[params.masterParameter] = params.params;
                      const objMasterParam = {};
                      objMasterParam[params.masterParameter] = params.params;
                      const allParams: object = Object.assign(
                        {},
                        objMasterParam,
                        params.extraParameters
                      );
                      this.parentDashboard.setExtraQueries(
                        this.widgetId,
                        allParams
                      );
                      /* On update of master widget filter Listener should updated */
                      if (
                        this.filterLength > 0 &&
                        !this.listenerWIdgetLoadedPostMasterAndFilter
                      ) {
                        this.objOnMasterLoadParams = {
                          params: params.params,
                          masterParameter: params.masterParameter,
                          extraParameters: params.extraParameters
                        };
                        this.getDataFirstTime_ON_masterLoad_AND_widgetLevelFilterLoad();
                      } else {
                        this.updateGraphFromMaster(
                          params.params,
                          params.masterParameter,
                          params.extraParameters
                        );
                      }
                      if (
                        params.titleForListener !== undefined &&
                        params.titleForListener !== "" &&
                        params.titleForListener !== "undefined"
                      ) {
                        const field = params.titleForListener;
                        const extraParamsField =
                          params.chartIdentity.actualExtraValues;

                        if (
                          extraParamsField &&
                          extraParamsField.length > 0
                        ) {
                          this.updateChartTitle([field, ...extraParamsField]);
                        } else this.updateChartTitle({}, field + "");
                      }
                    }
                  }
                }
              }
              break;
            case "ON_MASTER_CLICK":
              {
                if (this.widget.type.toLowerCase() === "web") {
                  const obj = {
                    value: ""
                  };
                  // obj.name = params.masterParameter;
                  obj.value = params.params;
                  // Updating the chart title ON_MASTER_CLICK;
                  this.updateChartTitle(obj);
                  this.webWidgetListnerEventHandler("ON_MASTER_CLICK", params);
                  break;
                }
                this.widgetData[params.masterParameter] = params.params;
                const objMasterParam = {};
                objMasterParam[params.masterParameter] = params.params;
                const allParams: object = Object.assign(
                  {},
                  objMasterParam,
                  params.extraParameters
                );
                this.parentDashboard.setExtraQueries(this.widgetId, allParams);
                if (this.filterLength > 0) {
                  this.updateGraphFromMaster(
                    params.params,
                    params.masterParameter,
                    params.extraParameters,
                    true
                  );
                } else {
                  this.updateGraphFromMaster(
                    params.params,
                    params.masterParameter,
                    params.extraParameters
                  );
                }
                if (
                  params.titleForListener !== undefined &&
                  params.titleForListener !== "" &&
                  params.titleForListener !== "undefined"
                ) {
                  const field = params.titleForListener;
                  const extraParamsField =
                    params.chartIdentity.actualExtraValues;
                  if (
                    extraParamsField &&
                    extraParamsField.length > 0
                  ) {
                    this.updateChartTitle([field, ...extraParamsField]);
                  } else this.updateChartTitle({}, field + "");
                }
              }
              break;
            // default:{
            //   this.updateGraphFromMaster(params, this.widget.chartIdentity.parameter);
            // }
            // break;
          }
        });
        isListener = true;
      }
    });

    if (!isListener) {
      // get broadcast channel of relative dashaboard
      this.emitterDashaboard = this.parentDashboard.getBroadcastChannel(
        this.parentDashboard.pageId
      );

      this.arrSubscription[
        "updateGraphFromMaster_" + this.parentDashboard.pageId
      ] = this.emitterDashaboard.subscribe(params => {
        // in case of realtime widget will not update itself on autorefresh
        const isRealTimeWidget =
          (this.widget && this.widget.isRealTime === true) ||
          this.widget.isRealTime === "true";
        if (!isRealTimeWidget) {
          this.updateGraphFromMaster(); // params, params.masterParameter);
        }
      });
    }
    // this.waitForMasterEmmitter = this.parentDashboard.getBroadcastChannel(this.widget.chartIdentity.master);
  }

  webWidgetListnerEventHandler(strEvent: string, params: any) {
    let allParams: object = {};
    let extrQueries: object = {};
    let filterParams: object = {};
    switch (strEvent) {
      case "ON_MASTER_CLICK":
        this.widgetData[params.masterParameter] = params.params;
        const objMasterParam = {};
        objMasterParam[params.masterParameter] = params.params;
        allParams = Object.assign({}, objMasterParam, params.extraParameters);
        this.parentDashboard.setExtraQueries(this.widgetId, allParams);
        this.webWidgetParams = allParams;
        this.callDetectChanges();
        this.callChangeDetectorMarkForCheck();
        break;
      case "ON_FILTER_APPLY":
        extrQueries = this.parentDashboard.getExtraQueries(this.widgetId);
        filterParams = this.parentDashboard.getFilterBarValues();
        allParams = { ...extrQueries, ...filterParams };
        this.parentDashboard.setExtraQueries(this.widgetId, allParams);
        this.webWidgetParams = allParams;
        this.callDetectChanges();
        this.callChangeDetectorMarkForCheck();
        break;
      case "ON_MASTER_LOAD":
        console.log("Master Load", params);
        this.widgetData[params.masterParameter] = params.params;
        const objMsterParam = {};
        objMsterParam[params.masterParameter] = params.params;
        allParams = Object.assign({}, objMsterParam, params.extraParameters);
        this.parentDashboard.setExtraQueries(this.widgetId, allParams);
        this.webWidgetParams = allParams;
        this.callDetectChanges();
        this.callChangeDetectorMarkForCheck();
        break;
      default:
        break;
    }
  }

  updateGraphFromMaster(
    params?: any,
    para?: string,
    extraParameters?: any,
    WidgetFilterApplyed?: any
  ): void {
    if (this.widget.badgeType === "titleBadge") {
      this.parentDashboard.widgetLoaded(this.widgetId, true);
      this.dataLoadedFromQuery();
    } else if (this.widget.type.toLowerCase() === "web") {
      this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
      this.callDetectChanges();
      this.callChangeDetectorMarkForCheck();
    } else {
      if (params === undefined) {
        this.getData();
      } else {
        // WidgetFilterApplyed added for apply widgetlevel filter on filter apply click
        if (WidgetFilterApplyed) {
          this.getData(true, params, para, extraParameters);
        } else {
          this.getData(false, params, para, extraParameters);
        }
      }
    }
  }

  /*
  Calculates the extra params to be passed on from the current widget to the listener widgets based on the chartIdentity.
  */
  calculateExtraParams(
    completeRows: Array<object>,
    chartIdentityToUse?: {
      extraParamsMap;
      extraColumnsList;
      extraParameterList;
      extraRegexList;
      extraValueBeforeList;
      extraValueAfterList;
      actualExtraValues;
      drilldowntype;
      widgetTitle;
    },
    paramObject?: any
  ): Promise<object> {
    let self = this;
    paramObject = paramObject || {};
    
    /* Process the extraParameterList
    e.g.  "extraparameters": "resourcenumber,groupname,device",
          "extracolumns": "resourcenumber,resourcename,groupnumber"
    */
    if (typeof chartIdentityToUse.extraColumnsList !== "undefined") {
      chartIdentityToUse.extraParameterList.forEach((paramName, paramIndex) => {
        let arr = [];
        let label = this.dataObservable[0].widgetStore.label;
        // Fix-79495 Legend issue. Use of extrparameter array to get extra parameters value.
        if (this.extraparameters != undefined) {
          completeRows.forEach(dataRow => {
            if (dataRow) {
              var param = this.extraparameters.find(
                obj => obj[label] == dataRow[label]
              );
              if (param != undefined) {
                arr.push(
                  param[
                    chartIdentityToUse.extraColumnsList[
                      paramIndex
                    ].toLowerCase()
                  ]
                );
              }
            }
          });
          if (!paramObject.hasOwnProperty(paramName)) {
            paramObject[paramName] = arr.join();
          }
        } else {
          completeRows.forEach(dataRow => {
            if (dataRow) {
              arr.push(
                dataRow[
                  chartIdentityToUse.extraColumnsList[paramIndex].toLowerCase()
                ]
              );
            }
          });
          if (!paramObject.hasOwnProperty(paramName)) {
            paramObject[paramName] = arr.join();
          }
        }
      });
    }

    // Process the extraParamsMap e.g. "extraParams": "{'titleVal' : '$localization.intfInUtil_esc'}"
    if (typeof chartIdentityToUse.extraParamsMap !== "undefined") {
      for (const paramName in chartIdentityToUse.extraParamsMap) {
        if (chartIdentityToUse.extraParamsMap.hasOwnProperty(paramName)) {
          paramObject[paramName] = chartIdentityToUse.extraParamsMap[paramName];
        }
      }
    }
    let data = [];
    Object.keys(paramObject).forEach(function(key, index) {
      data.push(paramObject[key]);      
    });
    chartIdentityToUse.actualExtraValues = data;   
    if (
      chartIdentityToUse.extraRegexList !== undefined &&
      chartIdentityToUse.extraRegexList !== ""
    ) {
      var len = chartIdentityToUse.extraRegexList.length;
      let extraColumnList = chartIdentityToUse.extraColumnsList;
      let extraparamData = {}
      if(chartIdentityToUse.drilldowntype === 'navigation'){
        Object.keys(paramObject).forEach(function(key, index) {
          extraparamData[key] = paramObject[key]      
        });
        chartIdentityToUse['actualExtraParamKeyValues'] = extraparamData; 
      }
      let plotValueObj: any;
      return new Promise(resolve => {
        paramObject = this.calculatExtraParamsWithRegex(
          paramObject,
          chartIdentityToUse,
          plotValueObj
        ).then((resolvedParamObject: object) => {
          resolve(resolvedParamObject);
        });
      });
    } else {
      return new Promise(resolve => {
        resolve(paramObject);
      });
    }
  }

  calculatExtraParamsWithRegex(paramObject, chartIdentityToUse, plotValueObj) {
    let self = this;
    return new Promise(async function(resolve) {      
      let objectSize = Object.keys(paramObject).length;
      await Object.keys(paramObject).forEach(async function(key, index) {
        let regexValue = new RegExp(chartIdentityToUse.extraRegexList[index]);
        let param = isString(paramObject[key])
          ? paramObject[key]
          : paramObject[key].toString();
        await self.utilities.checkRegex(param, regexValue).then(data => {
          objectSize -= 1;
          plotValueObj = data;
          let extraValueBefore;
          let extraValueAfter;
          if (
            chartIdentityToUse.extraRegexList[index] != "" &&
            chartIdentityToUse.extraRegexList[index] != undefined
          ) {
            if (chartIdentityToUse.extraValueBeforeList !== undefined) {
              extraValueBefore = chartIdentityToUse.extraValueBeforeList[index];
            }
            if (chartIdentityToUse.extraValueAfterList !== undefined) {
              extraValueAfter = chartIdentityToUse.extraValueAfterList[index];
            }
            if (plotValueObj !== null) {
              if (chartIdentityToUse.extraColumnsList !== undefined) {
                Object.keys(chartIdentityToUse.extraColumnsList).forEach(
                  function(key1, index1) {
                    paramObject[key] = plotValueObj[0];
                    if (extraValueBefore) {
                      paramObject[key] = extraValueBefore + plotValueObj[0];
                    }
                    if (extraValueAfter) {
                      paramObject[key] = plotValueObj[0] + extraValueAfter;
                    }
                    if (extraValueBefore && extraValueAfter) {
                      paramObject[key] =
                        extraValueBefore + plotValueObj[0] + extraValueAfter;
                    }
                  }
                );
              }
            } else {
              paramObject[key] = "";
              if (extraValueBefore) {
                paramObject[key] = extraValueBefore;
              }
              if (extraValueAfter) {
                paramObject[key] = extraValueAfter;
              }
              if (extraValueBefore && extraValueAfter) {
                paramObject[key] = extraValueBefore + extraValueAfter;
              }
            }
          } else {
            return paramObject;
          }
        });
        if (objectSize < 1) {
          resolve(paramObject);
        }
      });
    });
  }

  /**
   * Function for handling click/select events of different charting libraries/charts.
   * @param e Event object
   */
  widgetEventHandler(e: ChartClickEvent): void {
    let self = this;
    if (this.widget.type == "map") {
      let mapNotSupported = this.checkIfMapSupported(e);
      if (mapNotSupported) {
        this.stateOfWidgetDataLoading = WidgetDataStates.MAP_NOT_SUPPORTED;
      }
    }
    if(e.eventType === "ON_MASTER_CLICK" || e.eventType === "ON_MASTER_LOAD") {
      this.clearCacheOfListeners(e.eventType);
    }

    if (this.preventMasterHandling || this.isMaximized) {
      this.preventMasterHandling = false;
    }
    if (
      this.drilldownIndexInChartIdentity >= 0 ||
      typeof e.drilldownIndexInChartIdentity === "number"
    ) {
      // If drilldown index is coming in the event object, then use that chartidentity
      const drilldownIdentity =
        typeof e.drilldownIndexInChartIdentity === "number"
          ? e.drilldownIndexInChartIdentity
          : this.drilldownIndexInChartIdentity;
      let chartIdentityToUse = this.widget.chartIdentity[drilldownIdentity];
      this.calculateExtraParams(e.completeRowsData, chartIdentityToUse).then(
        extraParameterMap => {
          const plotValue = e.plotValue;
          let titleForListener = "";
          if (
            e.titleForListener !== "" &&
            e.completeRowsData.length > 0 &&
            e.completeRowsData[0] !== undefined
          ) {
            const titleFormListener = self.utilities.getLowerCaseValue(
              e.titleForListener
            );
            titleForListener = e.completeRowsData[0][titleFormListener] + "";
          }
          if (e.eventType === "ON_MASTER_CLICK") {
            for (var i of self.widget.chartIdentity) {
              if (i["targetDashboard"] != undefined) {
                chartIdentityToUse = i;
              }
            }
          } else if (e.eventType === "ON_MASTER_LOAD") {
            for (var i of self.widget.chartIdentity) {
              if (i["targetDashboard"] === undefined) {
                chartIdentityToUse = i;
              }
            }
          }
          // Do separate handling for masterlistener
          if (
            chartIdentityToUse.drilldowntype === DrillDownType.MASTER_LISTENER
          ) {
            if (self.masterWidgetEmitter) {
              self.masterWidgetEmitter.emit({
                action: e.eventType, // 'ON_MASTER_CLICK',
                params: plotValue,
                masterParameter: chartIdentityToUse.parameter,
                extraParameters: extraParameterMap,
                titleForListener: titleForListener,
                chartIdentity: chartIdentityToUse
              });
            }
            return;
          }

          // For master click event types only perform appropriate navigation
          if (e.eventType === "ON_MASTER_CLICK") {
            // Calculate common data to be used for different types of drilldowntype
            const objCurrentTab = self.tabComponentInstance.getActiveTab();
            const currentTabIndexPosition = self.tabComponentInstance.getTabIndexByName(
              objCurrentTab.tabtitle
            );
            const newTabIndexPosition = currentTabIndexPosition + 1;
            const plotValues: Object = {};
            plotValues[chartIdentityToUse.parameter] = e.plotValue;
            let targetDashboard: string,
              targetDashTabTitle: string,
              targetDashBoardId: string;

            // Based on the drilldown type different targetDashboard to be calculated.
            switch (chartIdentityToUse.drilldowntype) {
              case "navigation": {
                targetDashboard = chartIdentityToUse.targetDashboard;
                targetDashBoardId = chartIdentityToUse.targetDashBoardId;
                self.callDrillDown(
                  targetDashboard,
                  targetDashTabTitle,
                  chartIdentityToUse,
                  plotValues,
                  extraParameterMap,
                  newTabIndexPosition,
                  objCurrentTab,
                  targetDashBoardId
                );
                break;
              }
              case "navigation-mapbased": {
                targetDashboard =
                  chartIdentityToUse.targetDashboardsMap[plotValue] ||
                  chartIdentityToUse.targetDashboardsMap[
                    plotValue.toLowerCase()
                  ];
                self.callDrillDown(
                  targetDashboard,
                  targetDashTabTitle,
                  chartIdentityToUse,
                  plotValues,
                  extraParameterMap,
                  newTabIndexPosition,
                  objCurrentTab
                );
                break;
              }
              case "lookupNavigation": {
                self
                  .handleLookupNavigation(
                    plotValues,
                    chartIdentityToUse,
                    extraParameterMap
                  )
                  .then((response: any) => {
                    targetDashboard =
                      response[chartIdentityToUse.lookupValueColumn];
                    self.callDrillDown(
                      targetDashboard,
                      targetDashTabTitle,
                      chartIdentityToUse,
                      plotValues,
                      extraParameterMap,
                      newTabIndexPosition,
                      objCurrentTab
                    );
                  });
                break;
              }
              default: {
              }
            }
          }
        }
      );
    }
  }
  checkIfMapSupported(e) {
    let mapIDsArr = [];
    let mapId = this.dataObservable[0].widgetStore.mapIdentifier;
    if (e.completeRowsData[0]) {
      if (this.dataObservable[0].datapoints.length > 1) {
        for (let i = 0; i < this.dataObservable[0].datapoints.length; i++) {
          mapIDsArr.push(this.dataObservable[0].datapoints[i][mapId]);
        }
        if (mapIDsArr.indexOf("null") == -1) {
          return true;
        } else {
          return false;
        }
      } else {
        let mapIdValue = e.completeRowsData[0][mapId];
        if (
          this.widget.chartIdentity[0].type == "listener" ||
          Object.keys(this.parentDashboard.allMasterParams).length > 0
        ) {
          if (mapIdValue == "null") {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    } else return false;
  }

  callDrillDown(
    targetDashboard: string,
    targetDashTabTitle: string,
    chartIdentityToUse: any,
    plotValues: any,
    extraParameterMap: any,
    newTabIndexPosition: any,
    objCurrentTab: any,
    targetDashBoardId?: any
  ) {
    if (typeof targetDashboard === "string") {
      // Take the tab title from tabTitle or it would be targetDashboard
      targetDashTabTitle = chartIdentityToUse.tabTitle || targetDashboard;
      /* Code for passing on plotValues, extraParameterMap and filterMap from current dashboard to next dashboard */
      if (
        (chartIdentityToUse.extraRegexList !== undefined &&
        chartIdentityToUse.extraRegexList !== "") || 
        (chartIdentityToUse.regex !== undefined &&
          chartIdentityToUse.regex !== "")
      ) {
        let allActualParams = this.generateActualParamsForRegex(chartIdentityToUse,plotValues,extraParameterMap)
        this.parametersMaintenanceService.addMasterDashboardParametersForTab(
          targetDashboard,
          plotValues,
          extraParameterMap,
          this.parentDashboard.getFilterBarValues(),
          allActualParams
        );
      }
      else{
        this.parametersMaintenanceService.addMasterDashboardParametersForTab(
          targetDashboard,
          plotValues,
          extraParameterMap,
          this.parentDashboard.getFilterBarValues()
        );
      }
 
      // if tabtitle present open in new tab, else open in same tab
      if (chartIdentityToUse.tabTitle) {
        this.drillDownservice.drillOpenInNewTab(
          targetDashTabTitle,
          targetDashboard,
          newTabIndexPosition,
          objCurrentTab,
          targetDashBoardId
        );
      } else {
        this.drillDownservice.drillOpenInSameTab(
          targetDashTabTitle,
          targetDashboard,
          objCurrentTab,
          newTabIndexPosition,
          targetDashBoardId
        );
        // this.tabregister.closeTabOfName(this.tabregister.getActiveTab().getId());
        // this.tabregister.openTab( tabTitle, { getName: function(){ return tabTitle; } }, undefined, false );
      }
      this.utilities.isDrillDown = true;
    }
  }
  /* This function handles the lookup navigation and returns the target dashboard name
   * @plotValues: Plot Values
   * @chartIdentityToUse: JSON input
   * @extraParameterMap: Extra Parameter Map
   * Returns a promise object by consuming the dashboard service using lookup navigation
   */
  handleLookupNavigation(
    plotValues: any,
    chartIdentityToUse: any,
    extraParameterMap: any
  ): Promise<any> {
    const lookupkey1 = this.parentDashboard.getFilterBarValues();
    // Pass this lookupkey2 value to get the inplace values of charts
    // const lookupkey2 = this.widgetId + "_"  + this.parentDashboard.pageId;
    // Pss this lookupkey3 value to get plot values
    // const lookupkey3 = plotValues;
    // add 3 maps to get master map.
    // var masterLookupMap=this.util.addTwoMaps(this.util.addTwoMaps(lookupKeys1,lookupKeys2),lookupKeys3);
    var actualLookupParameters = this.substituteFromMap(
      chartIdentityToUse.lookupParameters,
      lookupkey1
    );
    var queryObj = {};
    var lookupParameters = actualLookupParameters.split(",");
    chartIdentityToUse.lookupQueryColumns
      .split(",")
      .forEach(function(item, index) {
        var valueFromLookup = lookupParameters[index];
        if (valueFromLookup.length > 0)
          queryObj[item] = lookupParameters[index];
      });
    const lookupValueColumn = chartIdentityToUse.lookupValueColumn;
    let resultSet: any;
    return this.dashserv.getTargetDashboardNameForLookup(
      this.parentDashboard.widgets[this.getCurrentWidgetIndex()].properties
        .lookupStore,
      lookupValueColumn,
      queryObj
    );
  }
  /*
   * Returns the index of active dashboard
   */
  getCurrentWidgetIndex(): number {
    const widgets = this.parentDashboard.widgets;
    for (var i in widgets) {
      if (widgets[i].id === this.widget.id) {
        return parseInt(i);
      }
    }
  }
  substituteFromMap(str: any, data: any): string {
    const output = str.replace(/{.+?}/g, function(match) {
      match = match.substring(1, match.length - 1);
      if (match in data) {
        return data[match];
      } else {
        return "";
      }
    });
    return output;
  }
  getChartType(): string {
    // if (this.savedState.newChartType === 'grid') {
    //   return 'grid';
    // }
    // const strChartType: string = (this.getChartTypeObject(this.savedState.newChartType)[this.currentChartApiType] ||
    //   this.currentChartType || 'line');
    // return strChartType.toLowerCase();
    let chartType = this.widget.type.toLowerCase();
    if (
      !this.fromChangeChartType &&
      this.widget.plots &&
      this.widget.plots[0] &&
      this.widget.plots[0].type
    ) {
      if (this.widget.plots[0].type.toLowerCase() === "stackedcolumns") {
        chartType = "column-stacked";
      } else if (this.widget.plots[0].type.toLowerCase() === "stackedbars") {
        chartType = "bar-stacked";
      }
    }
    return chartType;
    // return this.widget.type.toLowerCase();
  }

  /*
  Temp function to generate data for both anychart/canvas.
  TBD: Based on chartApiType call different functions
  */
  generateChartConfig(): void {
    // get height and width for canvas

    const canvasHeight = this.isMaximized
      ? window.screen.height - 100
      : this.widgetStyle["height.px"];
    const canvasWidth = this.isMaximized
      ? window.screen.width - 60
      : this.widgetStyle["width.px"];
    this.chartConfig = {
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
      xAxisTitle: this.xAxisTitle,
      yAxisTitle: this.yAxisTitle
    };
  }

  updateGraph(strCalledFrom?: string): void {
    // Update the graph only if the DATA_LOADED is the current state of widget data loading. Else do nothing.
    if (this.stateOfWidgetDataLoading === WidgetDataStates.DATA_LOADED) {
      // To break cyclic filter on master load marking widget as loaded
      this.isWidgetLoaded = true;
      this.callDetectChanges();
      switch (this.currentChartApiType) {
        case "grid": {
          // Save data in this.chartData for master listener to work

          this.chartData = {
            data: [
              {
                dataPoints: this.dataObservable[0].datapoints
              }
            ]
          };
          console.log(this.chartData);

          if (this.widget.dynamicseries) {
            strCalledFrom = "changeChartType";
            this.utilities.generateColumnsForWidgetForDynamicSeries(
              this.widget,
              this.dataObservable
            );
          }

          this.isGridLoaded = true;
          this.zoneService.runOutsideAngular(() => {
            setTimeout(() => {
              if (this.isRealTimeGraph === false) {
                this.gridChart.updateGraph(
                  this.getChartType(),
                  this.chartConfig,
                  this.dataObservable,
                  strCalledFrom
                );
              } else {
                this.gridChart.updateRealTimeGraph(
                  this.getChartType(),
                  this.chartConfig,
                  this.dataObservable
                );
              }
            }, 500);
          });

          break;
        }
        case "badge": {
          // Save data in this.chartData for master listener to work
          // in case of titleBadge data would not come from server, so observable would not be available.
          this.chartData = {};
          if (this.dataObservable) {
            if (this.dataObservable.length > 0) {
              this.chartData = {
                data: [
                  {
                    dataPoints: this.dataObservable[0].datapoints
                  }
                ]
              };
            }
            this.badgeWidget.updateGraph(
              this.getChartType(),
              this.chartConfig,
              this.dataObservable
            );
          }
          break;
        }
        case "canvaschart": {
          this.generateChartConfig();
          this.zoneService.runOutsideAngular(() => {
            this.viewCanvasJsChart.updateGraph(
              this.getChartType(),
              this.chartConfig,
              this.dataObservable
            );
          });
          break;
        }
        // case 'tree':{
        //   this.treeChart.updateGraph(this.getChartType(), this.chartConfig, this.dataObservable);
        //   break;
        // }
        case "anychart":
        default: {
          if (strCalledFrom !== "onResize") {
            this.generateChartConfig();
            this.localizedChartConfigAxis();
            this.zoneService.runOutsideAngular(() => {
              this.viewAnyChart.updateGraph(
                this.getChartType(),
                this.chartConfig,
                this.dataObservable,
                this.preDataObservable
              );
              // if ( this.widget.toolbar.realTime === 'true' ) {
              //   this.realTimeChart();
              // }
            });
            if (this.widget.type === "sunburst") {
              this.hideSunburstTextArea();
            }
          }
          break;
        }
        case "d3chart": {
          //  if (strCalledFrom !== 'onResize') {
          this.generateChartConfig();
          this.zoneService.runOutsideAngular(() => {
            this.viewD3Chart.updateGraph(
              this,
              this.getChartType(),
              this.chartConfig,
              this.dataObservable
            );
          });
          // }
          break;
        }
        case "tree": {
          if (strCalledFrom !== "onResize") {
            this.zoneService.runOutsideAngular(() => {
              this.viewTreeChart.updateGraph(this.dataObservable);
            });
          }
        }
      }
      // this.widgetBrodcast = this.tabregister.getBroadcastChannel('Loaded');
      // this.getEmitter();

      if (typeof this.isChartIconsCollapsed === "undefined") {
        /* If the isChartIconsCollapsed is not yet set, then this is first time loading of the chart.
         Thus checkIconsToBeCollapsed needs to be called. Since panelActionGroup won't yet be available, call the function using setTimeout
        */
        setTimeout(() => {
          // this.checkIconsToBeCollapsed();
        }, 0);
      }
    }
    if (this.currentChartApiType !== "tree") {
      this.callDetectChanges();
      this.callChangeDetectorMarkForCheck();
    }
  }

  /**
   * Function handler websocket errors and who message on widget accordingly
   * @objData : objData recieved response while creating websocket
   */
  realTimeWsDataProcessing(objData) {
    if (objData.type) {
      this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
      this.parentDashboard.widgetLoaded(this.widgetId, true);
      this.zoneService.runOutsideAngular(() => {
        setTimeout(() => {
          this.viewAnyChart.realTimeDataProcessing(objData);
        });
      });
    } else {
      this.realTimeErrorHandler(objData);
    }
  }

  /**
   * Function handler websocket errors and who message on widget accordingly
   * @err : err recieved while creating websocket
   */
  realTimeErrorHandler(err: Error, isiOSDevices?): void {
    this.stateOfWidgetDataLoading = WidgetDataStates.ERROR_IN_FETCHING_DATA;
    let errorForCache = [];

    if (isiOSDevices && isiOSDevices === true) {
      this.errorMessage =
        "Real-time data rendering is not supported on this device.";
      errorForCache = [
        {
          RESPONSE_CODE: " ",
          RESPONSE_MESSAGE: this.i18nDirective.getTranslatedValue(
            "errorMsgRealTimeNotSupportedOnIOS",
            this.errorMessage
          )
        }
      ];
    } else {
      /* Code for errorForCache added for sending error code to CSV/XLS */
      if (err && err[0] && err[0].hasOwnProperty("RESPONSE_CODE")) {
        this.errorMessage =
          err[0].RESPONSE_CODE + ": " + err[0].RESPONSE_MESSAGE;
        this.callDetectChanges();
        errorForCache = [
          {
            RESPONSE_CODE: err[0].RESPONSE_CODE,
            RESPONSE_MESSAGE: err[0].RESPONSE_MESSAGE
          }
        ];
      } else {
        this.stateOfWidgetDataLoading = WidgetDataStates.ERROR_IN_FETCHING_DATA;
        this.errorMessage =
          "Real Time Data Collector Server is unavailable. Try again or contact your system administrator.";
        this.errorMessage =
          "BIVRT9001E: " +
          this.i18nDirective.getTranslatedValue(
            "realTimeServerUnavailable",
            this.errorMessage
          );
        this.callDetectChanges();
        errorForCache = [
          {
            RESPONSE_CODE: "BIVRT9001E: ",
            RESPONSE_MESSAGE: this.i18nDirective.getTranslatedValue(
              "realTimeServerUnavailable",
              this.errorMessage
            )
          }
        ];
      }
    }
    const strRealTimeStore = this.utilities.getRealtimeWidgetStore(this.widget);
    this.parentDashboard.visgetStore.setWidgetStoreAndQueryMapper(
      this.widget.id,
      strRealTimeStore,
      {}
    );
    this.parentDashboard.visgetStore.addToCache(
      strRealTimeStore,
      errorForCache,
      { params: {} }
    );
    this.parentDashboard.widgetLoaded(this.widget.id, true);
  }

  /**
   * Funciton to handle websocket creation for realtime widget
   */
  realTimeChartWebSocketHandler(): void {
    if (
      this.widget &&
      (this.widget.isRealTime === true || this.widget.isRealTime === "true")
    ) {
      const realTimeStoreName = this.utilities.getRealtimeWidgetStore(
        this.widget
      );
      let realTimeDashboardId = "";

      /* published widget can drag and droped in dashboard.
         to verify published widget has been dropped in dahboard "widgetPreviewMode" flag can be used.
         published widget stores are associated with widget ID istelf,
         those widget's stores get associated with dashboard once dashboard saved.
         that is why before saving dashboard to fetch query for stores of newly dropped published widget,
         widget ID need to be passed as in Dashboard ID.
      */
      if (this.widget.widgetPreviewMode === true) {
        realTimeDashboardId = this.widget.previousId; // the original widget id of dropped widget, on drop unique widgetid get generated
      } else {
        realTimeDashboardId = this.parentDashboard.dashboardId;
      }
      this.dashserv
        .getDbDataSource(realTimeStoreName, realTimeDashboardId)
        .then(objDataSource => {
          if (
            this.webSocketService.initializeWebSocket(
              objDataSource,
              this.widget.id,
              realTimeStoreName,
              this.parentDashboard.dashboardId
            )
          ) {
            // this.webSocketService.initializeWebSocket(objDataSource, this.widget.id, realTimeStoreName, this.parentDashboard.dashboardId);
            this.webSocketService.subscribeWebSocket(this.widget.id).subscribe(
              msg => {
                // this.callDetectChanges();
                this.realTimeWsDataProcessing(msg);
              },
              err => this.realTimeErrorHandler(err),
              () => console.log("complete")
            );
          } else {
            this.realTimeWsDataProcessing("");
          }
        });
    }
  }

  /**
   * Funciton to initiate realtime functionality.
   */
  realTimeInit() {
    if (window.DEVICE_TYPE === DEVICE_TYPES.iOS) {
      const isiOSDevices = true;
      const emptyErrorObj: any = {};
      this.realTimeErrorHandler(emptyErrorObj, isiOSDevices);
    } else {
      const objEmptyDataForRealTime = this.utilities.getEmptyDataForRealtime(
        this.widget
      );
      this.dataObservable = objEmptyDataForRealTime;
      this.currentChartApiType = "anychart";
      this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
      this.callDetectChanges();
      this.updateGraph();
      this.realTimeChartWebSocketHandler();
      this.clientSessionService.onLoadRealtimeWidget();
    }
  }

  /**
   * Funciton written to stop realtime process on widget destroy or no longer in use;
   */
  realTimeStopHandler() {
    this.webSocketService.unsubscribeWebSocket(this.widget.id); // unsubscribe websocket on dashboard closing.
    this.clientSessionService.onDestroyRealtimeWidget();
  }

  /** function for handling of websocket on dashboard active/inactive
   * @changes : Simple Changes
   *  */
  handleRealTimeSubscriber(changes) {
    if (
      changes &&
      changes.activeTab &&
      changes.activeTab.currentValue === true
    ) {
      this.realTimeChartWebSocketHandler();
    } else if (
      changes &&
      changes.activeTab &&
      changes.activeTab.currentValue === false
    ) {
      this.webSocketService.unsubscribeWebSocket(this.widget.id);
    }
  }

  updateWebGraph(strCalledFrom?: string): void {
    if (strCalledFrom !== "onResize") {
      this.zoneService.runOutsideAngular(() => {
        this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
      });
    }
    this.callDetectChanges();
    this.callChangeDetectorMarkForCheck();
  }

  // getEmitter() {
  // this.widgetBrodcast.emit({ action: 'WIDGET_LOADED' });
  // }
  getEmitter() {
    this.widgetBrodcast.emit({ action: "WIDGET_LOADED" });
  }

  maximizeWidget($event): void {
    this.isMaximized = !this.isMaximized;
    // const tabContainerBody = $event.target.closest('.mat-tab-body-content');
    // const tabContainerBody = $event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    const tabContainerBody = this.utilities.getClosestElement(
      $event.target,
      "mat-tab-body-content"
    );
    if (tabContainerBody) {
      const tabContainer = this.renderer.parentNode(tabContainerBody);
      if (this.isMaximized) {
        this.tabStyle = tabContainerBody.getAttribute("style");
        tabContainerBody.setAttribute("style", "");
        this.renderer.addClass(tabContainer, "tab-widget-maximized");
      } else {
        tabContainerBody.setAttribute("style", this.tabStyle);
        this.renderer.removeClass(tabContainer, "tab-widget-maximized");
      }
    }
    this.setGraphHeight();
    // on maximize, tool bar should be display instaed of 3 dot vertical icon
    this.checkIconsToBeCollapsed();
    this.updateGraph("onResize");
    this.resizeTagCloud(); // adjust the height of Tagcloud chart when in preview mode

    // Send message to dashboard to suppress vertical scroll bar
    const updatedDashScrollMessage: Emitmessage = {
      ACTION_NAME: "suppressScrollY",
      MESSAGE: { params: { suppressScrollY: this.isMaximized } }
    };
    this.perfectSCrollBarEventEmitter.emit(updatedDashScrollMessage);
  }

  removeWidget() {
    this.updateDashabordEventEmitter.emit({
      action: "REMOVE_WIDGET",
      params: { widget: this.widget }
    });
  }

  changeChartType(chartTypeObj: object): void {
    // this.savedState.newChartType = chartTypeObj['chartType'];
    let newChartType = chartTypeObj["chartType"];
    this.previousChartType = this.widget.type;
    this.widget.type = newChartType;
    this.preventMasterHandling = true;
    if (chartTypeObj["chartType"] === "grid") {
      this.isGridLoaded = true;
      this.currentChartApiType = "grid";
      newChartType = "grid";
      const strCalledFrom = "changeChartType";
      this.changeDetector.detectChanges();
      if (
        this.currentChartType === "donut" ||
        this.currentChartType === "pie"
      ) {
        let numericField;
        this.widget.columns.forEach(column => {
          if (column["dataType"] === "number") {
            numericField = column.field;
          }
        });
        if (numericField !== undefined) {
          this.dataObservable[0].datapoints.forEach(datapoint => {
            datapoint[numericField] = Number(datapoint[numericField]);
          });
          if (numericField !== undefined) {
            this.dataObservable[0].datapoints.forEach(datapoint => {
              datapoint[numericField] = Number(datapoint[numericField]);
            });
          }
        }
      }
      this.zoneService.runOutsideAngular(() => {
        setTimeout(() => {
          if (this.gridChart) {
            this.gridChart.updateGraph(
              this.getChartType(),
              this.chartConfig,
              this.dataObservable,
              strCalledFrom
            );
          }
        }, 0);
      });
    } else {
      this.currentChartApiType = this.chartApiType;
      this.changeDetector.detectChanges();
      if (this.viewAnyChart) {
        this.generateChartConfig();
        this.zoneService.runOutsideAngular(() => {
          this.localizedChartConfigAxis();
          this.viewAnyChart.changeChartType(
            chartTypeObj["anychart"],
            this.chartConfig,
            this.dataObservable,
            this.preDataObservable
          );
        });
      } else if (this.viewCanvasJsChart) {
        this.zoneService.runOutsideAngular(() => {
          this.viewCanvasJsChart.changeChartType(chartTypeObj["canvaschart"]);
        });
      } else if (this.viewTreeChart) {
        setTimeout(() => {
          this.viewTreeChart.updateGraph(this.dataObservable);
        }, 0);
      }
    }

    // const chartTypeState: ChartTypeState = new ChartTypeState(this.savedState.widgetId, this.savedState.newChartType);
    // this.dashStateManager.updateDashStateChartType(this.currentTabId, chartTypeState);

    // emit message to update dashboard json

    this.fromChangeChartType = true;
    this.parentDashboard.updateWidgetType(this.widget.type, this.widget.id);
    const updatedWidgetTypeMessage: Emitmessage = {
      ACTION_NAME: "WIDGET_TYPE_UPDATED",
      MESSAGE: { widgetId: this.widget.id }
    };
    this.widgetBroadCastChanel.emit(updatedWidgetTypeMessage);
    /* Hide Icon list afetr click of changecharttype  */
    this.outsideClickKebabMenuHide();
    /* Hide Icon list afetr click of changecharttype  */
  }
  // else flagForWidget=false;

  // this.dashStateManager.updateDashStateChartType(this.currentTabId, chartTypeState,flagForWidget);
  //  }

  changeDataSource(dataSource): void {
    const currentWidgetId = this.widget.id;
    const newWidget = this.parentDashboard.getWidget(dataSource.widgetId);
    newWidget.xpos = this.widget.xpos;
    newWidget.ypos = this.widget.ypos;
    this.parentDashboard.updateIsMaximizedState(
      dataSource.widgetId,
      this.isMaximized
    );

    const newWidgetId = newWidget.id;
    const replaceWidgetMessage: Emitmessage = {
      ACTION_NAME: "REPLACE_WIDGET",
      MESSAGE: {
        widgetToBeReplaced: currentWidgetId,
        widgetToReplace: newWidgetId
      }
    };
    this.updateDashabordEventEmitter.emit(replaceWidgetMessage);
  }

  setGraphHeight(): void {
    const widgetHeight = parseInt(this.widget.rowspan) * this.rowHeight;
    if (this.wigdetHeader) {
      const widgetHeaderHeight = this.wigdetHeader.nativeElement.clientHeight;
      if (this.isMaximized) {
        this.graphHeight = window.innerHeight - widgetHeaderHeight;
      } else {
        if (this.widgetId.indexOf("dynamicChartTempWidget") === 0) {
          this.graphHeight =
            widgetHeight -
            widgetHeaderHeight -
            (this.widget.containerPaddingTop +
              this.widget.containerPaddingBottom);
        } else {
          this.graphHeight = widgetHeight - widgetHeaderHeight - 12; // -
          // (this.widget.containerPaddingTop + this.widget.containerPaddingBottom);
        }
      }
    } else {
      this.graphHeight =
        widgetHeight -
        (this.widget.containerPaddingTop + this.widget.containerPaddingBottom) -
        12;
    }
    this.callDetectChanges();
    this.callChangeDetectorMarkForCheck();
  }

  /* Function to subscribe the observable to update widget style
     this emitter mostly used for free form dashboard to update widget sytle
  */
  widgetStyleHandler(): void {
    this.arrSubscription[
      "widgetStyleHandler"
    ] = this.widgetBroadCastChanel.subscribe(newLocation => {
     
      const currentDashboard = this.tabregister
        .getTabByName(this.dashTitle)
        .getCurrentDashboard();
        console.log("currentDashboard" +currentDashboard.dashboardId );
      const checkIfActiveDashboard =
        (currentDashboard &&
          currentDashboard.dashboardId === this.parentDashboard.dashboardId) ||
        !currentDashboard;
      if (this.widget.id === newLocation.id && checkIfActiveDashboard) {
        this.widget.xpos = newLocation.xpos;
        this.widget.ypos = newLocation.ypos;
        this.widget.colspan = newLocation.colspan;
        this.widget.rowspan = newLocation.rowspan;
        this.widget.collapsed = newLocation.collapsed;
        this.widget.topMarginToWidget = newLocation.topMarginToWidget;
        this.setWidgetContainerStyle();
      }
    });
  }

  /* Function to subscribe the observable to update widget top
     this emitter used for expand collapse widget to update widget top
  */
  widgetExpandCollapseHandler(): void {
    this.arrSubscription[
      "widgetCollapseHandler"
    ] = this.expandCollapseWidgetEventEmitter.subscribe((data: Emitmessage) => {
      // adjust top of the widget on the basis of exapand collapse of other widgets
      if (
        data.ACTION_NAME == "WIDGET_BUFFER_TOP" &&
        (<any>data.MESSAGE).widget.id == this.widget.id
      ) {
        // this.widgetExpandCollapseTopBuffer += data.MESSAGE.widgetTopMarginToAdgest;
        this.widget.topBuffer = (<any>data.MESSAGE).widget.topBuffer;
        this.objWidgetWrapperDashboard.seWidgetTopBuffer(
          this.widget.id,
          this.widget.topBuffer
        );
        if (isNaN(this.widget.topBuffer)) {
        }
        // console.log( [ this.widget.id, this.widgetExpandCollapseTopBuffer ] );
        this.setWidgetContainerStyle();
      }

      // update widget style on expand or collapse current widget
      if (
        data.ACTION_NAME == "EXPAND_COLLAPSE" &&
        (<any>data.MESSAGE).widget.id == this.widget.id
      ) {
        this.widget.collapsed = (<any>data.MESSAGE).widget.collapsed;
        this.objWidgetWrapperDashboard.setWidgetCollapsed(
          this.widget.id,
          this.widget.collapsed
        );
        this.setWidgetContainerStyle();
      }
    });
  }

  getChartTypeObject(chartType: string): Object {
    if (typeof chartType === "undefined") {
      return {};
    }
    return CHART_TYPES[this.widget.toolbar.chartFamily].filter(
      chartTypeObject =>
        chartTypeObject.chartType.toLowerCase() === chartType.toLowerCase()
    )[0];
  }

  getChartTypeObjectFromApiName(chartTypeApiName: string): Object {
    if (typeof chartTypeApiName === "undefined") {
      return {};
    }
    return this.CHART_TYPES[this.widget.toolbar.chartFamily].filter(
      chartTypeObject => chartTypeObject[this.chartApiType] === chartTypeApiName
    )[0];
  }

  resetWidget(): void {
    this.getData(false, undefined, "", { resetChart: true });
  }

  resetWidgetChartTypeState(): void {
    const prevChartType = this.getChartType();
    this.savedState = new WidgetState(this.widgetId);
    const afterResetChartType = this.getChartType();
    if (prevChartType !== afterResetChartType) {
      this.changeChartType(
        this.getChartTypeObjectFromApiName(afterResetChartType)
      );
    }
  }

  isChartTypeChangeToBeShown(): boolean {
    const isRealTimeWidget =
      (this.widget && this.widget.isRealTime === true) ||
      this.widget.isRealTime === "true";
    const isMapChart = this.widget.type.toLowerCase() == "map" ? true : false;
    if (
      !isMapChart &&
      !isRealTimeWidget &&
      typeof this.widget !== "undefined" &&
      typeof this.widget.toolbar !== "undefined" &&
      typeof this.CHART_TYPES === "object" &&
      typeof this.CHART_TYPES[this.widget.toolbar.chartFamily] === "object"
    ) {
      /* typeof this.CHART_TYPES[this.chartApiType] === 'object' &&
    typeof this.CHART_TYPES[this.chartApiType][this.widget.toolbar.chartFamily] === 'object'  ) { */
      //  this.changeChartTypeId= "change-chart-type"+this.widgetId;
      return true;
    } else {
      return false;
    }
  }

  isDatasourceChangeToBeShown(): boolean {
    if (
      typeof this.widget !== "undefined" &&
      typeof this.widget.toolbar !== "undefined" &&
      typeof this.widget.toolbar.dataSources !== "undefined" &&
      this.widget.toolbar.dataSources.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  checkIfDrillDownChartIdentity(chartIdentity): boolean {
    const drilldowntypes = [
      "navigation",
      "navigation-nolabel",
      "navigation-jsonbased",
      "lookupNavigation",
      "navigation-mapbased"
    ];
    return (
      (chartIdentity &&
        (chartIdentity.drilldowntype === DrillDownType.MASTER_LISTENER &&
          chartIdentity.type === "master")) ||
      drilldowntypes.indexOf(chartIdentity.drilldowntype) !== -1
    );
  }

  isMasterWidget(): boolean {
    return this.drilldownIndexInChartIdentity >= 0 &&
      this.widget.chartIdentity[this.drilldownIndexInChartIdentity].type ===
        "master"
      ? true
      : false;
  }

  isNavigationWidget(): boolean {
    return this.drilldownIndexInChartIdentity >= 0 &&
      this.widget.chartIdentity[this.drilldownIndexInChartIdentity]
        .drilldowntype === DrillDownType.NAVIGATION
      ? true
      : false;
  }

  isDrilldownUrlWidget(): boolean {
    if (this.widget && this.widget.chartIdentity[0]) {
      return this.widget.chartIdentity[0].drilldowntype ===
        "navigation-externalUrl"
        ? true
        : false;
    }
  }

  isCyclicFilter(): boolean {
    return this.widget && 
          this.widget.cyclicFilter &&
          this.widget.cyclicFilter === 'true';
  }

  isTransformationWidget(): boolean {
    return this.widget && 
            this.widget.transformations && 
            this.widget.transformations.length > 0;
  }

  isAnalyticsWidget(): boolean {
    return this.widget && this.widget.type && (this.widget.type.toLowerCase() == ChartType.ANALYTICS.toLowerCase());
  }

  isMasterDataset(chartIdentity): boolean {
    return chartIdentity && 
           chartIdentity.implicit === 'true' &&
           chartIdentity.type === 'master';

  }

  isListenerToRealWidget(masterDatasetId) {
    return this.widget.chartIdentity.find(individualChartIdentity => {
      return (
        individualChartIdentity &&
        individualChartIdentity.implicit !== "true" &&
        individualChartIdentity.drilldowntype === "masterlistener" &&
        individualChartIdentity.type === "listener" &&
        individualChartIdentity.master !== masterDatasetId
      );
    });
  }
  
  checkIfListenerChartIdentity(individualChartIdentity): boolean {
    return (
      individualChartIdentity &&
      typeof individualChartIdentity.master === "string" &&
      individualChartIdentity.type === "listener"
    );
  }

  isListnerWidget(): boolean {
    return this.widget.chartIdentity.some(individualChartIdentity => {
      return (
        individualChartIdentity &&
        individualChartIdentity.type === "listener" &&
        typeof individualChartIdentity.master !== "undefined"
      );
    });
  }

  areIconsToBeCollapsed(): boolean {
    if (this.buttonPanel) {
      // console.log('this.widgetHeader', this.buttonPanel.nativeElement.clientWidth);
      // console.log('width', this.buttonPanel.nativeElement.parentElement.clientWidth);
      if (
        this.buttonPanel.nativeElement.clientWidth >=
        this.buttonPanel.nativeElement.parentElement.clientWidth
      ) {
        return true;
      }
      return false;
    }
    return false;
  }

  /* this function creates web socket and observe the real time changes in data and update the chart accordingly
   * @result: result of store data
   */
  initWebSocketChart(result): void {
    this.stateOfWidgetDataLoading = WidgetDataStates.DATA_LOADED;
    this.widgetRealtimeService.initSocket(this.widget, this.webSocketURL);
    this.arrSubscription[
      "webSocketChart"
    ] = this.widgetRealtimeService.messages.subscribe(data => {
      const manupulatedData = this.widgetRealtimeService.manupulateResult(
        data,
        result,
        this.getChartType()
      );
      if (manupulatedData.myResultArray) {
        this.dataObservable = manupulatedData.result;
        setTimeout(() => {
          this.updateGraph();
          this.setWidgetContainerStyle();
        });
      }
    });
  }

  showHideLegendsPdfReportEmmitter() {
    const legenShowHideEventEmmitter = this.parentDashboard.getBroadcastChannel(
      this.parentDashboard.pageId + "PDF_REPORT"
    );
    this.arrSubscription[
      "showHideLegendsOnReportGeneration"
    ] = legenShowHideEventEmmitter.subscribe(params => {
      if (params.action === "SHOW_LEGENDS" && this.viewAnyChart !== undefined) {
        this.viewAnyChart.showHideLegends("show");
      } else if (
        params.action === "HIDE_LEGENDS" &&
        this.viewAnyChart !== undefined
      ) {
        this.viewAnyChart.showHideLegends("hide");
      } else if (
        params.action === "HIDE_PDF_LEGENDS" &&
        this.viewAnyChart !== undefined
      ) {
        this.viewAnyChart.showHideLegends("HIDE_PDF_LEGENDS");
      } else if (
        params.action === "SHOW_PDF_LEGENDS" &&
        this.viewAnyChart !== undefined
      ) {
        this.viewAnyChart.showHideLegends("SHOW_PDF_LEGENDS");
      }
    });
  }
  widgetCollapse() {
    if (this.widgetCollapsed) {
      this.wigetCollapsedtitle = "collapse";
      this.widgetCollapsed = false;
    } else {
      this.wigetCollapsedtitle = "expand";
      this.widgetCollapsed = true;
    }
  }

  maximinititle() {
    if (this.isMaximized === true) {
      this.maximizetitle = "Minimize chart";
    } else {
      this.maximizetitle = "Maximize chart";
    }
  }
  closewidgetFilterBar(e) {
    this.maximizeFilterBar = false;
    const elementsArray = document.querySelectorAll(".engine-widget-filter");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l]["style"].display = "none";
    }
  }
  maximizeFilterBars(e) {
    this.maximizeFilterBar = true;
  }
  /**
   * Data will render if widget level filter is present
   */
  widgetDtaRender(): void {
    this.widgetFilterButtonClick = this.utilities.getBroadcastChannel(
      "WIDGET_FILTER_UPDATED_ACTION"
    );
    this.arrSubscription[
      "widgetDtaRender"
    ] = this.widgetFilterButtonClick.subscribe((data: Emitmessage) => {
      if (data.ACTION_NAME === "WIDGET_FILTER_UPDATED_ACTION") {
        // this.parentDashboard = (<any>data.MESSAGE).dashBoard;
        this.widgetID = (<any>data.MESSAGE).widgetID;
        if (this.widgetID === this.widgetId) {
          /** Condition for Listner widget with filter */
          if (
            this.filterLength > 0 &&
            !this.listenerWIdgetLoadedPostMasterAndFilter &&
            this.widget.chartIdentity[0].type === "listener"
          ) {
            this.widgetLevelFilterLoaded = true;
            this.getDataFirstTime_ON_masterLoad_AND_widgetLevelFilterLoad(
              this.widgetLevelFilterLoaded
            );
          } else {
            this.getData(true);
          }
        }
      }
    });
  }
  /**
   * Get Data First time from Master widget loaded & Widget Level filter loaded.
   * In this onButtonClickWidgetLevelFilter called for apply filter.
   * WidgetFilterApplyed added for Listner filter applied
   */

  getDataFirstTime_ON_masterLoad_AND_widgetLevelFilterLoad(
    WidgetFilterApplyed?
  ) {
    if (this.widgetLevelFilterLoaded && this.masterWidgetLoaded) {
      this.updateGraphFromMaster(
        this.objOnMasterLoadParams.params,
        this.objOnMasterLoadParams.masterParameter,
        this.objOnMasterLoadParams.extraParameters,
        WidgetFilterApplyed
      );
      this.listenerWIdgetLoadedPostMasterAndFilter = false;
      this.onButtonClickWidgetLevelFilter(true);
    }
  }

  widgetFilterIconClicked(): void {
    this.widgetFilterIconClick = this.utilities.getBroadcastChannel(
      "WIDGET_FILTER_BUTTON_CLICKED"
    );
    const temp = this.tabregister
      .getTabByName(this.dashTitle)
      .getCurrentDashboard();
    this.arrSubscription[
      "widgetFilterIconClicked"
    ] = this.widgetFilterIconClick.subscribe((data: Emitmessage) => {
      if (data.ACTION_NAME === "WIDGET_FILTER_BUTTON_CLICKED") {
        this.objWidgetFilterDashboard = temp.dashboardId;
        this.objwidgetDashboard = new WidgetFilterDashBoard(
          temp,
          this.objwidgetDashboard,
          this.objWidgetFilterDashboard,
          this.widget.id
        );
        this.parentDashboard = this.objwidgetDashboard;
      } else {
        this.parentDashboard = temp;
      }
    });
  }

  offClickHandler(event: any) {
    if (!this.expanded) {
      const elementsArray = document.querySelectorAll(".engine-widget-filter");
      for (let l = 0; l < elementsArray.length; l++) {
        //  elementsArray[l]['style'].display = 'none';
      }
    }
  }

  ngAfterViewChecked() {
    const widgetContainerDiv = this.widgetContainer.nativeElement;
    const rangeBarClass = widgetContainerDiv.querySelectorAll(
      ".control-container"
    )[0];
    if (
      widgetContainerDiv &&
      widgetContainerDiv.classList.contains("widget_quadrantmotion") &&
      rangeBarClass
    ) {
      if (
        this.widgetContainer.nativeElement.offsetHeight <= 198 ||
        this.widgetContainer.nativeElement.offsetWidth <= 235
      ) {
        rangeBarClass.classList.add("control-container-margin-top");
      } else {
        rangeBarClass.classList.remove("control-container-margin-top");
      }
      if (this.widgetContainer.nativeElement.offsetHeight < 378) {
        rangeBarClass.classList.add("control-container-margin-bottom");
      } else {
        rangeBarClass.classList.remove("control-container-margin-bottom");
      }
    }
  }
  // Check for mobile device
  checkIsMobileScreen(): boolean {
    return (this.isDisableResizeAndMove =
      window.innerWidth < 768 ? true : false);
  }

  showlargeDataMsg(msg) {
    this.stateOfWidgetDataLoading = WidgetDataStates.LARGE_DATA;
  }

  resizeTagCloud() {
    // adjust the height of Tagcloud chart when in preview mode and maximized
    if (this.isPreviewMode && this.widget.type === "tagcloud") {
      if (this.isMaximized) {
        this._elRef.nativeElement
          .querySelector(".canvas-wrapper")
          .classList.add("maximized-tagcloud");
      } else {
        this._elRef.nativeElement
          .querySelector(".canvas-wrapper")
          .classList.remove("maximized-tagcloud");
      }
    }
  }
  /* Hide Icon list afetr click of outside  */
  outsideClickKebabMenuHide() {
    const elementkebabMenulist = document.querySelectorAll(".visibility");
    const elementShowCollpsedButton = document.querySelectorAll(
      ".show-collapsed-button"
    );

    if (elementkebabMenulist && elementShowCollpsedButton.length > 1) {
      for (let l = 0; l < elementkebabMenulist.length; l++) {
        this.renderer.removeClass(elementkebabMenulist[l], "visibility");
        this.renderer.addClass(elementkebabMenulist[l], "nonvisibility");
      }
    }
  }
  /* if widgetfilter present on default loaded or onclick of page apply button  start*/
  onButtonClickWidgetLevelFilter(btnClick) {
    if (btnClick !== true) {
      this.widgetFilterIconClick = this.utilities.getBroadcastChannel(
        "WIDGET_FILTER_BUTTON_CLICKED"
      );
      this.widgetFilterIconClick.emit({
        ACTION_NAME: "WIDGET_FILTER_BUTTON_CLICKED",
        params: { widget: this.widget.id }
      });
    }
    /* if widgetfilter present on default loaded or onclick of page apply button */

    /* code for duration display start*/
    if (btnClick && btnClick !== true && this.widget.filterbar) {
      const filterbarvalue = this.parentDashboard.getWidgetFilterBarValuesforReport(
        this.widget.id
      );
      this.dashboardTimePeriodToBeShown =
        filterbarvalue.dashboardTimePeriodToBeShown;
      this.dateToBeShown = filterbarvalue.dateToBeShown;
    } else if (btnClick && btnClick === true && this.widget.filterbar) {
      const filterbarvalue = this.parentDashboard.getWidgetFilterBarValuesforReport(
        this.widget.id
      );
      this.dashboardTimePeriodToBeShown =
        filterbarvalue.dashboardTimePeriodToBeShown;
      this.dateToBeShown = filterbarvalue.dateToBeShown;
    } else {
      if (
        this.parentDashboard.filterbar &&
        Object.keys(this.parentDashboard.filterbar.icons).length > 0 &&
        this.widget.filterbar &&
        (this.widget.filterbar.icons.Datetime ||
          this.widget.filterbar.icons.Date)
      ) {
        let pageFilterDuaration: String;
        if (this.filterbarObj) {
          let showDateTimeOnWidgetLevel = false;
          if (
            this.widget.filterbar.displaynames.indexOf(
              DefaultFilters.DATETIME
            ) != -1 &&
            this.widget.filterbar.displaynames.indexOf(
              DefaultFilters.INTERVAL
            ) != -1
          ) {
            showDateTimeOnWidgetLevel = true;
          }
          pageFilterDuaration =
            this.filterbarObj.getDashboardTimeDurationForUI() !== "" &&
            showDateTimeOnWidgetLevel
              ? this.filterbarObj.getDashboardTimeDurationForUI()
              : this.dashboardTimePeriodToBeShown;
        }
        this.dashboardTimePeriodToBeShown = pageFilterDuaration;
        const filterbarvalue = this.parentDashboard.getWidgetFilterBarValuesforReport(
          this.widget.id
        );
        if (filterbarvalue) {
          filterbarvalue.dashboardTimePeriodToBeShown = pageFilterDuaration;
        }
      } else {
        const filterbarvalue = this.parentDashboard.getWidgetFilterBarValuesforReport(
          this.widget.id
        );
        if (filterbarvalue) {
          this.dashboardTimePeriodToBeShown =
            filterbarvalue.dashboardTimePeriodToBeShown;
          this.dateToBeShown = filterbarvalue.dateToBeShown;
        }
      }
    }
  }
  /* code for duration display start*/

  // set background image for widget
  setBackgroundImg() {
    if (this.widget.backgroundImageId !== undefined) {
      const getBackground_p = this.dashserv.getBackgroundImage(
        this.widget.backgroundImageId
      );
      getBackground_p.then(response => {
        if (response && response.length > 0) {
          const url = "data:image/jpeg;base64," + response[0].photo;
          this.imageStyling["background-image"] = "url(" + url + ")";
          this.imageStyling["background-repeat"] = "no-repeat";
          this.imageStyling["background-size"] = "contain";
          this.imageStyling["background-position"] = "center center";
          this.changeDetector.detectChanges();
        }
      });
    }
  }

  /* Fix for sunburst AVT */
  // AVT violation on Sunburst Chart due to textarea getting generate by Sunburst chart.
  // Violation were 'Form control element textarea is missing associated label.',
  // 'All content does not reside within a WAI-ARIA landmark or labelled region role.'
  /* Fix: Setting style of that textarea to display:none */

  hideSunburstTextArea() {
    const sbtextarea = document.querySelector(
      'body textarea[readonly="readonly"]'
    ) as HTMLElement;
    if (sbtextarea) {
      sbtextarea.style.display = "none";
    }
  }

  updateBadgeGraphOnTabChange() {
    setTimeout(() => {
      this.setWidgetContainerStyle();
      this.updateGraph("onResize");
      this.checkIconsToBeCollapsed();
      this.checkIsMobileScreen();
    }, 1000);
  }

  localizedChartConfigAxis() {
    if (
      this.chartConfig &&
      (this.chartConfig.xAxisTitle || this.chartConfig.yAxisTitle)
    ) {
      // x-axis, y-axis title localization
      this.chartConfig.xAxisTitle = this.i18nDirective.getI18nTranslation(
        this.chartConfig.xAxisTitle,
        this.chartConfig.xAxisTitle,
        this.parentDashboard.pageId
      );
      this.chartConfig.yAxisTitle = this.i18nDirective.getI18nTranslation(
        this.chartConfig.yAxisTitle,
        this.chartConfig.yAxisTitle,
        this.parentDashboard.pageId
      );
    }
    // In case of Manual series, this is required to localize tooltip
    if (
      this.widget.axes &&
      this.widget.axes[0] &&
      this.widget.axes[0].labelSeries
    ) {
      this.chartConfig.seriesName = this.i18nDirective.getI18nTranslation(
        this.widget.axes[0].labelSeries,
        this.widget.axes[0].labelSeries,
        this.parentDashboard.pageId
      );
    }
    if (
      this.widget.axes &&
      this.widget.axes[1] &&
      this.widget.axes[1].labelSeries
    ) {
      this.chartConfig.seriesName = this.i18nDirective.getI18nTranslation(
        this.widget.axes[1].labelSeries,
        this.widget.axes[1].labelSeries,
        this.parentDashboard.pageId
      );
    }
  }
  checkMapSupported(result, allParams) {
    let identifierVar;
    let mapidentifierVar;
    let identifierVarUC;
    let mapidentifierVarUC;
    let dataPointValueArr = Object["values"](allParams);
    let dataPointValue = dataPointValueArr[0].toString().toLowerCase();
    // get column names whatever we set in series section
    identifierVar = result[0].widgetStore.identifier;
    mapidentifierVar = result[0].widgetStore.mapIdentifier;
    identifierVarUC = identifierVar.toString(identifierVar).toUpperCase();
    mapidentifierVarUC = mapidentifierVar
      .toString(mapidentifierVar)
      .toUpperCase();
    let mapIdentifierOfNode: string = "";
    for (let i = 0; i < result[0].datapoints.length; i++) {
      let obj = result[0].datapoints[i];
      var key,
        keys = Object.keys(obj);
      var n = keys.length;
      var newobj = {};
      // converted all keys into lowercase for maintain stability
      for (let j = 0; j < keys.length; j++) {
        key = keys[j];
        newobj[key.toLowerCase()] = obj[key];
      }
      //check with lower case and upper case
      let val = newobj[identifierVar] || newobj[identifierVarUC];
      if (val.toLowerCase() === dataPointValue) {
        if (newobj)
          mapIdentifierOfNode =
            newobj[mapidentifierVarUC] || newobj[mapidentifierVar];
      }
    }
    if (mapIdentifierOfNode == "") {
      mapIdentifierOfNode = "null";
    }
    return mapIdentifierOfNode === "null";
  }
  mapNotFound(event: any): void {
    this.stateOfWidgetDataLoading = WidgetDataStates.MAP_NOT_FOUND;
  }
  updateWidgetTitleBarwithFilterValues(): any {
    const locale = LOCALE_CONFIGS.applicationLocale;
    let strFilterCustom;
    let consolidatedFilterstr = "";
    let strFilterTitle;
    let strFilterDefault;
    let consolidatedFilterstrTitle = "";
    let consolidatedFilterstrDefault = "";
    let consolidatedFilterstrTitleDefault = "";
    this.defaultFilterKeyValue = [];
    this.customFilterKeyValue = [];
    this.commonTooltipToBeShown = this.titleToBeDisplayed;
    if (this.widgetId) {
      const tempWidget = this.parentDashboard.getWidget(this.widgetId);
      let filters = "";
      if (tempWidget && tempWidget.filterbar) {
        filters = tempWidget.filterbar.displaynames;
      }
      if (filters === "") {
        this.filterValue = `${this.titleToBeDisplayed}`;
      } else {
        const filterNames = filters.split(",");
        const filtermap = this.parentDashboard.getWidgetFilterBarValues(
          this.widgetId,
          true
        );
        const defaultFilterArray = [];
        const customFilterArray = [];
        const widgetFilterTitleArray = [];
        for (const i in filtermap) {
          if (i !== undefined) {
            for (const j in filterNames) {
              if (
                tempWidget.filterbar.icons[filterNames[j]].hidden == "false"
              ) {
                if (
                  i === filterNames[j] &&
                  i != DefaultFilters.DATETIME &&
                  i != DefaultFilters.INTERVAL &&
                  i != DefaultFilters.AGGREGATION &&
                  i != DefaultFilters.SUMMARIZATION &&
                  i != CEMDateFilter.Date &&
                  i != CEMDefaultFilter.IncidentPriority &&
                  i != CEMDefaultFilter.IncidentState &&
                  i != CEMDefaultFilter.RunbookVersion &&
                  i != CEMDefaultFilter.ExecutionStatus
                ) {
                  let type = "type";
                  let customType = "custom";
                  customFilterArray.push(filtermap[i + "-DisplayedValue"]);
                  widgetFilterTitleArray.push(
                    JSON.parse(
                      '{"' +
                        filterNames[j] +
                        '":  " ' +
                        filtermap[i + "-DisplayedValue"] +
                        '", "' +
                        type +
                        '":  " ' +
                        customType +
                        '"}'
                    )
                  );
                  if (locale == "fr") {
                    this.customFilterKeyValue.push({
                      name: filterNames[j].trim(),
                      value: filtermap[i + "-DisplayedValue"].trim(),
                      title:
                        filterNames[j].trim() +
                        " : " +
                        filtermap[i + "-DisplayedValue"].trim()
                    });
                  } else {
                    let val = filtermap[i + "-DisplayedValue"];
                    if(!isString(val)){
                      val = val.toString();
                    }
                    val = val.trim();
                    this.customFilterKeyValue.push({
                      name: filterNames[j].trim(),
                      value: val,
                      title:
                        filterNames[j].trim() +
                        ": " +
                        val
                    });
                  }
                } else if (
                  i === filterNames[j] &&
                  i != DefaultFilters.DATETIME &&
                  i != DefaultFilters.INTERVAL &&
                  i != CEMDateFilter.Date
                ) {
                  let type = "type";
                  let defaulttype = "default";
                  //to check if the aggregation or summarization id none then it should be hidden in PDF
                  if (
                    filterNames[j] == DefaultFilters.AGGREGATION ||
                    filterNames[j] == DefaultFilters.SUMMARIZATION
                  ) {
                    if (
                      filtermap[i + "-DisplayedValue"].trim().toLowerCase() ==
                      "none"
                    ) {
                      this.aggregationValueHide = true;
                      this.summarizationValueHide = true;
                    } else {
                      this.aggregationValueHide = false;
                      this.summarizationValueHide = false;
                    }
                  }
                  defaultFilterArray.push(
                    this.i18nDirective.getTranslatedValue(
                      filtermap[i + "-DisplayedValue"].trim(),
                      filtermap[i + "-DisplayedValue"].trim()
                    )
                  );
                  widgetFilterTitleArray.push(
                    JSON.parse(
                      '{"' +
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j],
                          filterNames[j]
                        ) +
                        '":  " ' +
                        this.i18nDirective.getTranslatedValue(
                          filtermap[i + "-DisplayedValue"],
                          filtermap[i + "-DisplayedValue"]
                        ) +
                        '", "' +
                        type +
                        '":  " ' +
                        defaulttype +
                        '"}'
                    )
                  );
                  if (locale == "fr") {
                    this.defaultFilterKeyValue.push({
                      name: this.i18nDirective.getTranslatedValue(
                        filterNames[j].trim(),
                        filterNames[j].trim()
                      ),
                      value: this.i18nDirective.getTranslatedValue(
                        filtermap[i + "-DisplayedValue"].trim(),
                        filtermap[i + "-DisplayedValue"].trim()
                      ),
                      title:
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j].trim(),
                          filterNames[j].trim()
                        ) +
                        " : " +
                        this.i18nDirective.getTranslatedValue(
                          filtermap[i + "-DisplayedValue"].trim(),
                          filtermap[i + "-DisplayedValue"].trim()
                        ),
                      hideValue:
                        filtermap[i + "-DisplayedValue"].trim().toLowerCase() ==
                        "none"
                          ? true
                          : false
                    });
                  } else {
                    this.defaultFilterKeyValue.push({
                      name: this.i18nDirective.getTranslatedValue(
                        filterNames[j].trim(),
                        filterNames[j].trim()
                      ),
                      value: this.i18nDirective.getTranslatedValue(
                        filtermap[i + "-DisplayedValue"].trim(),
                        filtermap[i + "-DisplayedValue"].trim()
                      ),
                      title:
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j].trim(),
                          filterNames[j].trim()
                        ) +
                        ": " +
                        this.i18nDirective.getTranslatedValue(
                          filtermap[i + "-DisplayedValue"].trim(),
                          filtermap[i + "-DisplayedValue"].trim()
                        ),
                      hideValue:
                        filtermap[i + "-DisplayedValue"].trim().toLowerCase() ==
                        "none"
                          ? true
                          : false
                    });
                  }
                } else if (i === filterNames[j] && i == CEMDateFilter.Date) {
                  let type = "type";
                  let defaulttype = "default";
                  this.hideCEMdate = true;
                  defaultFilterArray.push(this.dateToBeShown);
                  widgetFilterTitleArray.push(
                    JSON.parse(
                      '{"' +
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j],
                          filterNames[j]
                        ) +
                        '":  " ' +
                        this.dateToBeShown +
                        '", "' +
                        type +
                        '":  " ' +
                        defaulttype +
                        '"}'
                    )
                  );
                  if (locale == "fr") {
                    this.defaultFilterKeyValue.push({
                      name: this.i18nDirective.getTranslatedValue(
                        filterNames[j].trim(),
                        filterNames[j].trim()
                      ),
                      value: this.dateToBeShown,
                      title:
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j].trim(),
                          filterNames[j].trim()
                        ) +
                        " : " +
                        this.dateToBeShown
                    });
                  } else {
                    this.defaultFilterKeyValue.push({
                      name: this.i18nDirective.getTranslatedValue(
                        filterNames[j].trim(),
                        filterNames[j].trim()
                      ),
                      value: this.dateToBeShown,
                      title:
                        this.i18nDirective.getTranslatedValue(
                          filterNames[j].trim(),
                          filterNames[j].trim()
                        ) +
                        ": " +
                        this.dateToBeShown
                    });
                  }
                }
              }
            }
          }
        }
        /* Reversing filter values as concatinating strings*/
        for (let i = customFilterArray.length - 1; i >= 0; i--) {
          strFilterCustom = customFilterArray[i];
          if(!isString(strFilterCustom)){
            strFilterCustom = strFilterCustom.toString();
          }
          consolidatedFilterstr =
            strFilterCustom.trim() + "," + consolidatedFilterstr;
        }
        consolidatedFilterstr = consolidatedFilterstr.substring(
          0,
          consolidatedFilterstr.length - 1
        );
        consolidatedFilterstr = consolidatedFilterstr.replace(/[\{}\']/g, "");
        consolidatedFilterstr = consolidatedFilterstr.replace(/[\"\']/g, "");
        if (this.utilities.getLastClicked() == "widgetFilter") {
          this.isWidgetFilterLastClicked = true;
        } else if (this.utilities.getLastClicked() == "parentFilter") {
          this.isWidgetFilterLastClicked = false;
        }
        this.dashboardFilterToBeShown = `${consolidatedFilterstr}`;
        for (let i = defaultFilterArray.length - 1; i >= 0; i--) {
          if (i == 0 && defaultFilterArray[i] == this.dateToBeShown) {
            this.indexOfCEMDateZero = true;
          } else {
            this.indexOfCEMDateZero = false;
          }

          strFilterDefault = defaultFilterArray[i];
          consolidatedFilterstrDefault =
            strFilterDefault.trim() + "," + consolidatedFilterstrDefault;
        }
        consolidatedFilterstrDefault = consolidatedFilterstrDefault.substring(
          0,
          consolidatedFilterstrDefault.length - 1
        );
        consolidatedFilterstrDefault = consolidatedFilterstrDefault.replace(
          /[\{}\']/g,
          ""
        );
        consolidatedFilterstrDefault = consolidatedFilterstrDefault.replace(
          /[\"\']/g,
          ""
        );
        this.dashboardFilterToBeShownDefault = `${consolidatedFilterstrDefault}`;
        // Below condition added for Badge widget wich does not have a title

        if (this.titleToBeDisplayed === "") {
          this.filterValue = `${consolidatedFilterstr}`;
        }
        for (let i = widgetFilterTitleArray.length - 1; i >= 0; i--) {
          strFilterTitle = JSON.stringify(widgetFilterTitleArray[i]);
          if (
            strFilterTitle.indexOf(
              this.i18nDirective.getTranslatedValue(
                DefaultFilters.DATETIME,
                DefaultFilters.DATETIME
              )
            ) == -1 &&
            strFilterTitle.indexOf(
              this.i18nDirective.getTranslatedValue(
                DefaultFilters.INTERVAL,
                DefaultFilters.INTERVAL
              )
            ) == -1 &&
            widgetFilterTitleArray[i].type == "default"
          ) {
            consolidatedFilterstrTitleDefault =
              strFilterTitle.trim() + " | " + consolidatedFilterstrTitleDefault;
          } else if (
            strFilterTitle.indexOf(
              this.i18nDirective.getTranslatedValue(
                DefaultFilters.DATETIME,
                DefaultFilters.DATETIME
              )
            ) == -1 &&
            strFilterTitle.indexOf(
              this.i18nDirective.getTranslatedValue(
                DefaultFilters.INTERVAL,
                DefaultFilters.INTERVAL
              )
            ) == -1 &&
            widgetFilterTitleArray[i].type == "custom"
          ) {
            consolidatedFilterstrTitle =
              strFilterTitle.trim() + " | " + consolidatedFilterstrTitle;
          }
        }
        consolidatedFilterstrTitle = consolidatedFilterstrTitle.substring(
          0,
          consolidatedFilterstrTitle.length - 1
        );
        consolidatedFilterstrTitle = consolidatedFilterstrTitle.replace(
          /[\{}\']/g,
          ""
        );
        consolidatedFilterstrTitle = consolidatedFilterstrTitle.replace(
          /[\"\']/g,
          ""
        );
        this.dashboardFilterTitleToBeShown = `${consolidatedFilterstrTitle}`;
        this.dashboardFilterTitleToBeShownDefault = `${consolidatedFilterstrTitleDefault}`;
        this.commonTooltipToBeShown = this.titleToBeDisplayed;

        if (
          this.dashboardFilterToBeShown &&
          this.dashboardFilterToBeShown !== ""
        ) {
          this.commonTooltipToBeShown =
            this.commonTooltipToBeShown + " | " + this.dashboardFilterToBeShown;
        }
        if (
          this.dashboardFilterToBeShownDefault &&
          this.dashboardFilterToBeShownDefault !== "" &&
          this.dashboardFilterToBeShown == ""
        ) {
          this.commonTooltipToBeShown =
            this.commonTooltipToBeShown +
            " | " +
            this.dashboardFilterToBeShownDefault;
        } else if (
          this.dashboardFilterToBeShownDefault &&
          this.dashboardFilterToBeShownDefault !== ""
        ) {
          this.commonTooltipToBeShown =
            this.commonTooltipToBeShown +
            "," +
            this.dashboardFilterToBeShownDefault;
        }
        if (
          this.dashboardTimePeriodToBeShown &&
          this.dashboardTimePeriodToBeShown !== ""
        ) {
          this.commonTooltipToBeShown =
            this.commonTooltipToBeShown +
            " | " +
            this.dashboardTimePeriodToBeShown;
        }
      }
    }
    this.htmlSanitizer.sanitize(SecurityContext.HTML, this.filterValue);
  }

  clearCacheOfListeners(eventType) {
    let widgets = this.parentDashboard.widgets;
    widgets.forEach(widget => {
      if(widget.type === "LayoutManager"){
        widget.widgets.forEach( wid => {
          if(!(eventType === EventType.ON_MASTER_LOAD && wid.transformations)) {
            wid.chartidentity.forEach( identity => {
              if( identity.type === "listener" && identity.master === this.widgetId){
                this.parentDashboard.clearWidgetVisgetStoreCache(wid.id)
              }
            });
          }
        });
      }
      else{
        if(!(eventType === EventType.ON_MASTER_LOAD && widget.transformations)) {
          widget.chartidentity.forEach( identity => {
            if( identity.type === "listener" && identity.master === this.widgetId){
              this.parentDashboard.clearWidgetVisgetStoreCache(widget.id)
            }
          });
        }
      }
    });
  }

  /**
   * 
   * @param chartIdentityToUse 
   * @param plotValues 
   * @param extraParameterMap 
   * Added function to Generate Actual Parameter object
   * which will be used for widget title in drilldown case
   */
  generateActualParamsForRegex( 
    chartIdentityToUse: any,
    plotValues: any,
    extraParameterMap: any,){
      if(chartIdentityToUse.actualPlotValues === undefined){
        return Object.assign(
          {},
          plotValues,
          chartIdentityToUse.actualExtraParamKeyValues
        )
      }
      else if(chartIdentityToUse.actualExtraParamKeyValues === undefined){
        return Object.assign(
          {},
          chartIdentityToUse.actualPlotValues,
          extraParameterMap
        )
      }
      else{
        return Object.assign(
          {},
          chartIdentityToUse.actualPlotValues,
          chartIdentityToUse.actualExtraParamKeyValues
        )
      }
  }
}
