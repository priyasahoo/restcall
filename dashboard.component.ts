import { DashboardStateManager } from "./../services/dashboard/dashboardStateManager";
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  AfterContentInit,
  HostListener,
  ViewChild,
  ViewChildren,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  Injector,
  ChangeDetectionStrategy,
  DoCheck
} from "@angular/core";
import { Subscription } from "rxjs";
import { Dashboard } from "./../interfaces/dashboard";
import { TabregisterService } from "../services/tabregister/tabregister.service";
import {
  CommonUtilityService,
  DefaultFilters
} from "../services/utilities/common-utility.service";
import { DrilldownServiceService } from "../services/drilldown/drilldown-service.service";
import { SlimScrollBarDirective } from "../directives/slim-scroll-bar.directive";
import { ApplicationNameService } from "../services/applicationNameConfig/applicationNameConfig.service";
import { DashboardFactoryService } from "../services/dashboard/dashboard-factory.service";

import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent
} from "ngx-perfect-scrollbar";
import { TabStripComponent } from "../tab-strip/tab-strip.component";
import { DashboardServiceService } from "../services/dashboard/dashboard-service.service";
import { GenerateReportDirective } from "../directives/generate-report.directive";
import { DashboardPresenter } from "../services/dashboard/presenters";
import { ParametersMaintenanceService } from "../services/drilldown/parameters-maintenance.service";
import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { BsDropdownDirective } from "ngx-bootstrap/dropdown";
import { PopoverDirective } from "ngx-bootstrap/popover";
import { TooltipDirective } from "ngx-bootstrap/tooltip";

import { Emitmessage } from "../interfaces/emitmessage";
import { UserPreferencesServiceService } from "../services/user-preferences/user-preferences-service.service";
import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";
import { FilterbarFactoryService } from "../services/filterbar/filterbar-factory.service";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FilterbarComponent } from "../filterbar/filterbar.component";
import { DEVICE_TYPES, LIC_STRINGS } from "../appconfiguration";
// import { MessageType } from '../global-message/global-message';
import { I18nDirectiveDirective } from "../directives/i18n-directive.directive";
import { DashboardState } from "../classes/dashboard-state";
import { ConfGlobalMessage } from "../interfaces/global-message-conf";
import { MessageType } from "../appconfiguration";
import { TemplateRef } from "@angular/core";
import { EmailService } from "../services/email/email.service";
import { Lic } from "../interfaces/lic";
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent
  implements
    OnInit,
    AfterContentInit,
    AfterViewChecked,
    OnChanges,
    OnDestroy,
    DoCheck {
  public AppName: any;
  private _leftOffset = 0;
  private _topOffset = 0;
  private _position = "relative";
  private _screenWidth: number = document.documentElement.clientWidth - 35;
  private _dashboardPadding = 0;
  private _dashboard: Dashboard;
  public dashboardHeight = 0;
  public maximizeFilterBar: Boolean = false;
  private currTabId: string;
  private colWidth: number;
  private rowHeight: number;
  private updateDashabordEventEmitter: EventEmitter<Object>;
  private updateDashabordEventEmitterAVT: EventEmitter<Object>;
  public autoRefresh = false;
  public autoRefreshValue: any;
  public autoRefreshState = "Off";
  private refreshFlag = false;
  public perfectScrollBarConf: PerfectScrollbarConfigInterface = {};
  private perfectSCrollBarEventEmitter: EventEmitter<Object>;
  private filterUpdatesEventEmitter: EventEmitter<Object>;
  private arrSubscription: Array<any> = [];
  public widgetPadding: Number = 5;
  private tabComponentInstance: any;
  private showBackbutton = false;
  private widgetToatlcnt: any;
  // private savePDF: SavePdf = null;
  public widgetIndex: Object = {};
  public isOfflineMode: boolean = (<any>window).OFFLINE_MODE || false;
  public isPreviewMode: boolean =
    window.previewParams.getPreviewMode() || false;
  public titleToBeDisplayed: string;
  public descriptionToBeDisplayed: string;
  public displayNames: string;
  public filterBarLoaded: Boolean = false;
  public dashboardTimePeriodToBeShown: String = "";
  public dateToBeShown: string = "";
  public dashButtonPreferences: any;
  public widgetBrodcast: any;
  public tabStripBrodcast: EventEmitter<any>;
  public loggedInUserID: any = (<any>window).userId;
  public userPreferenceBrodcast: any;
  public timeInterval: any;
  public dashboardLoaded = false;
  public isWebWidget: Boolean = false;
  public dashboarFullyLoadedEmmiter: any;
  public dashboarFullyLoaded = false;
  public generateAndMailPdfEmmitter: EventEmitter<Object>;
  public loadedDashboard: Array<any> = [];
  public refresh: String;
  // public autoRefereshInterval: any;
  public selectedTimeInterval: any;
  public emailRef: BsModalRef;
  public emailSent: Boolean = false;
  public emailNotSent: Boolean = false;
  public smtpRelay: Boolean = false;
  public smtpPort: Boolean = false;
  public senderEmail: Boolean = false;
  public clickCount: any = 0;
  public exportdropdown: Boolean = false;
  public objSelectedWidgetToDrop: Object;
  public isWidgetDragged: Boolean = false;
  public resetDashboardInProgress: Boolean = false;
  public dashboardState: DashboardState;
  public widgetBroadCastChanel: EventEmitter<any>;
  public resetDashboardEmmitter: EventEmitter<any>;

  private pageApplyButtonClick: EventEmitter<Object>;
  private widgetFilterIconClick: EventEmitter<Object>;
  private dashboardLoadedChannel: EventEmitter<any>;
  private closeWidgetFilter: EventEmitter<Object>;
  private autoRefreshClicked: EventEmitter<Object>;
  private isSaveAsOptionsDisabled = false;
  private isShareDashboardPopover = false;
  private mobileView = false;
  private isDisabledShareDashboard = false;
  private shareDashboardUrl: any;
  public shareDashModalref: BsModalRef;
  public isStaticDashboardShared: Boolean = true;
  private preUrlLicMessage: String;
  private postUrlLicMessage: String;
  private licFormObj: Lic;
  private submitAttempt: Boolean = false;
  private InvalidFields: Boolean = false;
  private isEmbedUrl: Boolean = false;
  private fullUrl: any;
  private emailLinkHeader: String;
  private licMessageValue: any;
  public isContextMode = false;
  private inValidEmailMsg: String;
  private isEmailValid: Boolean = false;
  private isKebabMenuClicked: Boolean = false;
  private filterbarService: FilterbarFactoryService;
  private saveAsDropdownMob: Boolean = false;
  private isSmallDevice: Boolean = false;
  private licOldMsg: any;
  private contextModeValue = 0;
  private newLicMessageString: String;
  private post1UrlLicMessage: String;
  private post2UrlLicMessage: String;
  public filterLength: any = 0; // is dashboard has page level filter

  @Input() activeTab: any;
  @Input() dashTitle: any;
  @ViewChild(GenerateReportDirective, { static: false }) reportDir;
  @ViewChild(SlimScrollBarDirective, { static: false })
  objSlimScrollBarDirective: SlimScrollBarDirective;
  @ViewChild("dashbaordTemplateManger", { static: false })
  dashbaordTemplateManger;
  @ViewChild("downloadDropdown", { static: false })
  private downloadDropdown: BsDropdownDirective;
  @ViewChild("emailPdfTemplate", { static: false })
  public emailPdfTemplate: ModalDirective;
  @ViewChild("filterBarPopover", { static: false })
  private filterBarPopover: PopoverDirective;
  @ViewChild("dashbhoardFilterBar", { static: false })
  private filterbarObj: FilterbarComponent;
  @ViewChild("perfectScrollBar", { static: false })
  private perfectScrollBar: PerfectScrollbarComponent;
  @ViewChild(I18nDirectiveDirective, { static: false })
  i18nDirective: I18nDirectiveDirective;
  @ViewChild("shareDashbPopover", { static: false })
  private shareDashboardPopover: PopoverDirective;
  @ViewChild("shareDashboardForm", { static: false })
  private shareDashboardFormTempl;
  @ViewChild("shareDashboardFormOnMob", { static: false })
  private shareDashboardFormOnMobTempl;
  @ViewChild("shareDynamicDashbPopover", { static: false })
  private shareDynamicDashbPopoverTmpl: PopoverDirective;
  @ViewChild("licMessage", { static: false }) private licMessageTempl;
  @ViewChild("emailErrorMessage", { static: false })
  private emailErrorMessageTmpl: TooltipDirective;
  @ViewChild("shareDashboardDropdown", { static: false })
  private shareDashboardDropdownTmpl: BsDropdownDirective;
  @ViewChild("downloadDropdownMob", { static: false })
  private downloadDropdownMob: BsDropdownDirective;
  @ViewChild("kebabMenuDropdown", { static: false }) public kebabMenuDropdown;
  @ViewChild("licEmailField", { static: false }) private licEmailField;
  @ViewChild("licSubjectField", { static: false }) private licSubjectField;
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.calcDashboardHeight();
  }
  @HostListener("document:keydown.escape", ["$event"])
  closeLicPopoverOnEsc(event) {
    this.shareDashboardDropdownTmpl.hide();
    this.closeShareDashPopOver("Esc");
  }

  constructor(
    private hostElem: ElementRef,
    private tabregister: TabregisterService,
    private drillDownservice: DrilldownServiceService,
    private changeDetector: ChangeDetectorRef,
    private dashStateManager: DashboardStateManager,
    private commonUtility: CommonUtilityService,
    private injector: Injector,
    private dashboardService: DashboardServiceService,
    private parametersMaintenanceService: ParametersMaintenanceService,
    private userPreference: UserPreferencesServiceService,
    private filterbarserv: FilterbarFactoryService,
    private zoneService: NgZone,
    private shareDashboardModalService: BsModalService,
    private emailService: EmailService,
    private AppNameService: ApplicationNameService,
    private DashboardFactoryService: DashboardFactoryService
  ) {
    this.tabComponentInstance = <TabStripComponent>(
      this.injector.get(TabStripComponent)
    );
    if (window.outerWidth < 1360) {
      document
        .getElementsByTagName("body")[0]
        .addEventListener("touchstart", event => {
          if (window.innerWidth > 768) {
            const buttonElement = this.commonUtility.getClosestElement(
              event.target,
              "btn-transparent"
            );
            const dropdownElement = this.commonUtility.getClosestElement(
              event.target,
              "dropdown-menu"
            );
            if (buttonElement === undefined && dropdownElement === undefined) {
              this.downloadDropdown.hide();
            }
          } else {
            const popoverElement = this.commonUtility.getClosestElement(
              event.target,
              "popover-content"
            );
            const buttonElement = this.commonUtility.getClosestElement(
              event.target,
              "btn-transparent"
            );
            if (
              buttonElement === undefined &&
              popoverElement === undefined &&
              this.filterBarPopover
            ) {
              this.filterBarPopover.hide();
            }
          }
        });
    }
    this.checkIsDashboardLoaded();
    // this line is used for checking the device is mobile or not(for ipad this will be false)
    this.isSmallDevice = window.innerWidth >= 768 ? false : true;
    // commented below line because it is taking true value for ipad.
    this.mobileView =
      window.DEVICE_TYPE === DEVICE_TYPES.ANDROID ||
      window.DEVICE_TYPE === DEVICE_TYPES.iOS
        ? true
        : false;
  }

  // Loads blank dashboard and waits for the dashboard json to get loaded
  ngOnInit() {
    //PRD - White label - custom application name
    this.AppName = this.AppNameService.getApplicationName();
  
    /* Below code to check if the mode is ContextMode */
    const jsonUrlParams: any = (<any>window).jonUrlParams;
    if (Object.keys(jsonUrlParams).length > 0) {
      this.isContextMode = true;
      this.contextModeValue = jsonUrlParams.m;
    }
    this.refresh = "Auto Refresh" + ":" + this.autoRefreshState;
    if (
      this.loadedDashboard.indexOf(this.dashTitle) !== -1 &&
      this.dashboardLoaded === false
    ) {
      this.loadDashboard(this.dashTitle);
      this.currTabId = this.dashTitle;
      this.dashboardLoaded = true;
    }
    this.licFormObj = { subject: "", emailIds: "", message: "" };
    this.licOldMsg = "";
  }

  ngDoCheck() {}

  checkIsDashboardLoaded() {
    this.tabStripBrodcast = this.commonUtility.getBroadcastChannel("TAB_STRIP");
    this.dashboardLoadedChannel = this.commonUtility.getBroadcastChannel(
      "CALL_UPWARD_GRAVITY"
    );
    this.arrSubscription["test1"] = this.tabStripBrodcast.subscribe(message => {
      if (message.action === "DASH_LOADED") {
        if (this.loadedDashboard.indexOf(message.params.tabTitle) === -1) {
          this.loadedDashboard.push(message.params.tabTitle);
        }

        if (
          this.dashTitle !== undefined &&
          message.params.tabTitle === this.dashTitle &&
          this.loadedDashboard.indexOf(this.dashTitle) !== -1
        ) {
          if (window.previewParams.getPreviewMode() === true) {
            this.callLoadDashboard(this.dashTitle);
          } else {
            this.loadDashboard(this.dashTitle);
            this.currTabId = this.dashTitle;
            this.dashboardLoaded = true;
            this.callChangeDetector();
            this.callChangeDetectorMarkForCheck();
          }
        }
      }
    });
  }

  callUpwardGravityOnDashLoad() {
    this.dashboardLoadedChannel.emit({ action: "callUpwardGravityOnDashLoad" });
  }

  // This functions loads the complete dashboard once the json is available
  loadDashboard(tabTitle) {
    this._dashboard = this.tabregister
      .getTabByName(tabTitle)
      .getCurrentDashboard();

    if (
      this._dashboard.widgets &&
      this._dashboard.widgets[0] &&
      this._dashboard.widgets[0].type === "web"
    ) {
      this.isWebWidget = true;
    }
    // if ( this.dashboard.freeFlowDashboard ) {
    this.dashboardState = new DashboardState(this._dashboard,this.commonUtility);
    // }
    // this.dashStateManager.setDashboardState( this._dashboard.pageId, this._dashboard );
    this.computeTitleDescription();
    this.rowHeight = Number(this._dashboard.blockHeight);
    this.rowHeight = this.commonUtility.getRowHeight(
      this._dashboard.blockHeight
    );
    this.manupulateEmmitters();
    this.colWidth = this.screenWidth / parseInt(this._dashboard.totalcols);
    this.procesButtonsVisibility();
    this.getTimeInterval();
    this.setDashboardInitialUi();
    this.updateScreenWidth();
    this.changeDetector.detectChanges();
  }
  /** function written for call load dashboar in case of preview mode is on
   *  @tabTitle: tab title / dashboard title to be open
   **/
  callLoadDashboard(tabTitle: any): void {
    const elm = document.getElementsByClassName("main-tab-container")[0];
    const loadDashInterval = setInterval(() => {
      if (elm.clientWidth > 0) {
        this.loadDashboard(tabTitle);
        this.currTabId = tabTitle;
        this.dashboardLoaded = true;
        this.changeDetector.detectChanges(); //added changeDetector for mouse touch issue
        clearInterval(loadDashInterval);
      }
    }, 500);
  }

  /**
   * Compute the title and description to be displayed.
   * Replace any {placeholder} appearing in title/description with appropriate value.
   */
  computeTitleDescription() {
    const objAllParams = this.parametersMaintenanceService.getAllMasterParamsForTab(
      this._dashboard.pageId
    );
    this.titleToBeDisplayed = this.commonUtility.replaceParameters(
      this._dashboard.title,
      objAllParams
    );
    this.descriptionToBeDisplayed = this._dashboard.description;
  }

  ngAfterContentInit() {}

  ngAfterViewChecked() {
    // this.callCalDashboargHeight();
  }

  ngOnDestroy() {
    if (this.autoRefresh) {
      this.autoRefresh = !this.autoRefresh;
      clearInterval(this.autoRefreshValue);
    }

    for (const index in this.arrSubscription) {
      if (this.arrSubscription[index] !== undefined) {
        const emitter = this.arrSubscription[index];
        emitter.unsubscribe();
      }
    }
    if (<any>this._dashboard) {
      (<any>this._dashboard).broadcastMessageBus = undefined;
    }
    // On destroy of current dashboard, remove all the master parameters coming from parent dashboard.
    this.parametersMaintenanceService.removeMasterParametersForTab(
      this.dashboard.pageId
    );
    this.filterbarserv.clearLoadedFilterList(this.dashboard.pageId);
  }

  ngOnChanges(changes: SimpleChanges) {
    // on tab switch need calc dashboard hieght and set visibility of footer
    if (
      changes.activeTab &&
      changes.activeTab.currentValue === true &&
      this.dashbaordTemplateManger
    ) {
      this.zoneService.runOutsideAngular(() => {
        setTimeout(() => {
          this.callCalDashboargHeight();
        }, 100);
      });
    }

    // autorefresh functionality would be working only if tab is acitve
    if (
      this.autoRefresh &&
      this.activeTab &&
      this.autoRefreshValue === undefined
    ) {
      this.autoRefreshValue = setInterval(() => {
        if (this.activeTab) {
          this.dashboard.refreshDashboard();
        }
      }, 60000);
    } else if (this.autoRefresh && !this.activeTab) {
      clearInterval(this.autoRefreshValue);
      this.autoRefreshValue = undefined;
    }
  }

  setDashboardInitialUi() {
    this._topOffset = this.hostElem.nativeElement.topOffset;
    this.callCalDashboargHeight();
    this.zoneService.runOutsideAngular(() => {
      setTimeout(() => {
        this.perfectScrollBar.directiveRef.update();
      }, 2000);
    });
    this.showHideBackButton();
  }

  checkFilter() {
    if (
      this._dashboard.filterbar !== undefined &&
      Object.keys(this._dashboard.filterbar.icons).length !== 0
    ) {
      return true;
    }
    return false;
  }

  callCalDashboargHeight() {
    this.zoneService.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.dashbaordTemplateManger) {
          this.calcDashboardHeight();
        }
      }, 100);
    });
  }

  updateScreenWidth() {
    const elm = document.getElementsByClassName("main-tab-container")[0];

    this._screenWidth = elm.clientWidth - 31;
  }

  calcDashboardHeight() {
    if (!this.dashbaordTemplateManger) {
      return false;
    }
    this.updateScreenWidth();
    const element = this.dashbaordTemplateManger.directiveRef.elementRef
      .nativeElement;
    let height = 0;
    const body = window.document.body;

    if (window.innerHeight) {
      height = window.innerHeight;
    } else if (body.parentElement.clientHeight) {
      height = body.parentElement.clientHeight;
    } else if (body && body.clientHeight) {
      height = body.clientHeight;
    }
    const footerHeight =
      jQuery("#engine-footer:visible").length > 0
        ? jQuery("#engine-footer").outerHeight(true)
        : 0;
    const topOffset = jQuery(element).offset().top;
    this.dashboardHeight = height - topOffset - footerHeight;
    this.callChangeDetector();
  }

  footerVisibilityOnScroll(event?: any) {
    const tracker = event.target;
    const limit = tracker.scrollHeight - tracker.clientHeight;
    const currentObject = this;
    if (event.target.scrollTop >= limit - 60) {
      jQuery("#engine-footer").slideDown(300);
    } else {
      jQuery("#engine-footer").slideUp(300);
    }

    this.calcDashboardHeight();
    this.zoneService.runOutsideAngular(() => {
      setTimeout(() => {
        this.calcDashboardHeight();
      }, 1000);
    });
  }

  onDropWidget(event?: any) {
    const widgetId = (<any>this.objSelectedWidgetToDrop).widget_id;
    if (widgetId !== undefined && widgetId !== "" && widgetId !== null) {
      this.dashboardService
        .getWidgetJson(widgetId, this._dashboard.dashboardId)
        .then(widgetJson => {
          this.addWidget([widgetJson]);
        });
    }
    if (event !== undefined) {
      event.preventDefault();
    }
  }

  allowWidgetDrop(event) {
    event.preventDefault();
  }

  addWidget(arrSelectedJson: any) {
    this._dashboard = this.tabregister
      .getTabByName(this.currTabId)
      .getCurrentDashboard();
    const totalcols = Number(this._dashboard.totalcols);
    let totalrows = Number(this._dashboard.totalrows);
    let widgetRowspan = 0;
    let widgetColspan = 0;
    let dashboardParams = {};
    let collied = false;
    let widget: any;
    let widgetName: String = "";
    let widgetStores: any = [];
    for (const i in arrSelectedJson) {
      if (arrSelectedJson[i] !== undefined) {
        if (arrSelectedJson[i].widget_json !== undefined) {
          try {
            widget = JSON.parse(arrSelectedJson[i].widget_json);
            widget = arrSelectedJson[i].widget_json.widgets;
            widgetStores = arrSelectedJson[i].widget_json.stores;
          } catch (e) {
            widget = { ...arrSelectedJson[i].widget_json.widgets };
            widgetStores = arrSelectedJson[i].widget_json.stores;
          }

          widgetName = arrSelectedJson[i]["widget_name"];
        } else if (arrSelectedJson[i].objWidget) {
          widget = arrSelectedJson[i].objWidget;
          widgetName = widget.toolbar.title;
        } else {
          widget = arrSelectedJson[i];
          widgetStores = arrSelectedJson[i].series;
          if (widgetStores === undefined) {
            widgetStores = [widget.properties];
          }
        }
        /*while dropping widget in dashboard colspan and rowspan need to update */
        widget.colspan = 20;
        widget.rowspan = 20;

        // this.widgetIndex[ (<any>widgetName) ] = this._dashboard.widgets.length;
        if (widget["type"] === undefined) {
          widget["type"] = "line";
        }
        if (widget["rowspan"] === undefined) {
          widget["rowspan"] = 20;
        } else {
          widget["rowspan"] = Number(widget["rowspan"]);
        }
        if (widget["colspan"] === undefined) {
          widget["colspan"] = 20;
        } else {
          widget["colspan"] = Number(widget["colspan"]);
        }

        if (widget["xpos"] === undefined) {
          widget["xpos"] = 0;
        } else {
          widget["xpos"] = Number(widget["xpos"]);
        }
        if (widget["ypos"] === undefined) {
          widget["ypos"] = 0;
        } else {
          widget["ypos"] = Number(widget["ypos"]);
        }

        widgetRowspan = Number(widget.rowspan);
        widgetColspan = Number(widget.colspan);
        dashboardParams = {
          dashboardPadding: this.dashboardPadding,
          colWidth: this.colWidth,
          rowHeight: this.rowHeight
        };

        collied = false;
        for (let y = 0; y < totalrows; y++) {
          for (let x = 0; x < totalcols; x++) {
            widget.xpos = x;
            widget.ypos = y;
            collied = false;
            this._dashboard.widgets.forEach(wid => {
              if (collied) {
                return;
              }
              collied = this.commonUtility.checkCollision(
                widget,
                wid,
                dashboardParams
              );
            });
            if (!collied) {
              break;
            }
          }
        }

        widgetRowspan = Number(widget.rowspan);
        widgetColspan = Number(widget.colspan);
        dashboardParams = {
          dashboardPadding: this.dashboardPadding,
          colWidth: this.colWidth,
          rowHeight: this.rowHeight
        };

        collied = false;
        for (let y = 0; y < totalrows; y++) {
          // column iteration
          for (let x = 0; x < totalcols; x++) {
            // row iteration
            widget.xpos = x;
            widget.ypos = y;
            collied = false;

            // teration at row level for every widget
            for (
              let widgetIndex = 0;
              widgetIndex < this._dashboard.widgets.length;
              widgetIndex++
            ) {
              const wid = this._dashboard.widgets[widgetIndex];
              if (collied) {
                break;
              }

              // check if widget going out of dashboard
              if (widget.xpos + widget.colspan > this._dashboard.totalcols) {
                collied = true;
                break;
              }

              collied = this.commonUtility.checkCollision(
                widget,
                wid,
                dashboardParams
              );
            }

            // if not collied with any chart then keep this location for widget
            if (!collied) {
              break;
            }
          }

          // if not collied with any chart then keep this location for widget
          if (!collied) {
            // console.log( 'not collied 2' );
            break;
          }
        }

        // if widget collied with other widget then add it at the bottom
        if (collied) {
          widget.xpos = 0;
          widget.ypos = totalrows;
          (<any>this._dashboard).totalrows = totalrows + 20;
        } else {
          // If widget is not collapsed with any other widget then it get placed at sutable position.
          // while placing it at sutable position it can exceeding the dashboards height.
          // in that case need to add extra rows in dashboard
          if (widget.ypos + widget.rowspan > totalrows) {
            (<any>this._dashboard).totalrows = totalrows + 20;
          }
        }

        (<any>this._dashboard).manageMappers(widgetStores);
        this._dashboard.widgets.push(widget);
        this.updateDashabordEventEmitter.emit({
          ACTION: "DASHBOARD_WIDGETS_UPDATED",
          WIDGET: widget
        });
        this.isWidgetDragged = true;
        this.dashboardState.updateState(this._dashboard);
        this.callUpwardGravityOnDashLoad();
      }
    }
  }
  getWidgetIndex() {
    return this.widgetIndex;
  }
  closeFilterBar(event) {
    this.maximizeFilterBar = false;
  }
  // Function to show or hide back button
  showHideBackButton() {
    const activeTabtitle = this.tabComponentInstance.getActiveTabTitle();
    const backDashboardTitle = this.drillDownservice.getMaster(activeTabtitle);
    if (backDashboardTitle !== undefined) {
      this.showBackbutton =
        backDashboardTitle && backDashboardTitle !== activeTabtitle;
    } else {
      this.showBackbutton = false;
    }
    return this.showBackbutton;
  }
  // Function to provide back button functionality
  backfromDashboard() {
    // this.isDisabledShareDashboard = false;
    const activeTabtitle = this.tabComponentInstance.getActiveTabTitle();
    this.drillDownservice.drillBackToDashboard(activeTabtitle);
    this.commonUtility.isDrillDown = false;
  }

  manupulateEmmitters() {
    this.userPreferenceBrodcast = this.dashboardService.getBroadcastChannel(
      "USER_PREFERENCES"
    );
    this.arrSubscription["test2"] = this.userPreferenceBrodcast.subscribe(
      message => {
        if (message.action === "TIME_INTERVAL") {
          this.timeInterval = message.params.timeInterval;
        }
      }
    );

    this.updateDashabordEventEmitter = (<any>(
      this._dashboard
    )).getBroadcastChannel("ADD_REMOVE_WIDGETS_IN_FREE_FLOW_DASHBOARD");
    this.updateDashabordEventEmitterAVT = (<any>(
      this._dashboard
    )).getBroadcastChannel("ADD_REMOVE_WIDGETS_IN_FREE_FLOW_DASHBOARD_AVT");
    this.perfectSCrollBarEventEmitter = (<any>(
      this._dashboard
    )).getBroadcastChannel("PERFECT_SCROLL_BAR_EVENT_EMITTER");
    this.filterUpdatesEventEmitter = (<any>this._dashboard).getBroadcastChannel(
      "ON_FILTER_CHANGES"
    );
    this.tabStripBrodcast = this.commonUtility.getBroadcastChannel("TAB_STRIP");
    this.dashboarFullyLoadedEmmiter = (<any>(
      this._dashboard
    )).getBroadcastChannel(
      this._dashboard.dashboardId + "DASHBOARD_FULLY_LOADER"
    );
    this.generateAndMailPdfEmmitter = this.dashboard.getBroadcastChannel(
      `${this.dashboard.dashboardId}_MAIL_PDF_REPORT`
    );

    // event emitter to get updates of widget's size in freeform
    this.widgetBroadCastChanel = (<any>this._dashboard).getBroadcastChannel(
      "widgetUpdatedData"
    );

    this.arrSubscription[
      "perfectSCrollBarEventEmitter_suppressScrollY"
    ] = this.perfectSCrollBarEventEmitter.subscribe(message => {
      if (this.perfectScrollBarConf && message.action === "suppressScrollY") {
        this.perfectScrollBarConf.swipeEasing = message.params.suppressScrollY;
      }
      if (
        this.perfectScrollBarConf &&
        message.ACTION_NAME === "suppressScrollY"
      ) {
        this.perfectScrollBarConf.suppressScrollY =
          message.MESSAGE.params.suppressScrollY;
      }
    });

    this.unsubscribeEmmitter("updateDashabordEventEmitter_removeWidget"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "updateDashabordEventEmitter_removeWidget"
    ] = this.updateDashabordEventEmitter.subscribe(message => {
      if (message.action === "REMOVE_WIDGET") {
        (<any>this._dashboard).deleteWidget(message.params.widget);
        this.updateDashabordEventEmitter.emit({
          ACTION: "DASHBOARD_WIDGETS_REMOVE",
          WIDGET: message.params.widget
        });
      } else if (message.ACTION_NAME === "SELECTED_WIDGET_TO_DROP") {
        // on start drag drop keep copy of widget object which is being dragged,
        // this copy need at the time drop is complete to push in widgets array of dashboard
        this.objSelectedWidgetToDrop = message.MESSAGE.objWidget;
      } else if (message.ACTION_NAME === "DROP_SELECTED_WIDGET_TO_DASHBOARD") {
        // on key press "D" on widget item of published widgets dialog, add this widget to the dashboard
        this.objSelectedWidgetToDrop = message.MESSAGE.objWidget;
        this.onDropWidget();
      } else if (message.ACTION_NAME === "REPLACE_WIDGET") {
        (<any>this._dashboard).replaceWidget(
          message.MESSAGE.widgetToBeReplaced,
          message.MESSAGE.widgetToReplace
        );
        this._dashboard = this.tabregister
          .getTabByName(this.currTabId)
          .getCurrentDashboard();
        const emitMessage: Emitmessage = {
          ACTION_NAME: "UPDATE_DASHBOARD_ON_CHANGE_DATA_SOURCE",
          MESSAGE: ""
        };
        this.updateDashabordEventEmitter.emit(emitMessage);
      }
    });

    this.unsubscribeEmmitter("dashboardFullyLoader"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "dashboardFullyLoader"
    ] = this.dashboarFullyLoadedEmmiter.subscribe((objMessage: Emitmessage) => {
      if (
        this._dashboard.dashboardId === (<any>objMessage.MESSAGE).dashboardId
      ) {
        this.dashboarFullyLoaded = true;
        this.callUpwardGravityOnDashLoad();
        this.callChangeDetector();
        this.callChangeDetectorMarkForCheck();
      }
    });

    /* event chanel to get filter updates
       mostly used to get flag on filter load and update
    */
    this.unsubscribeEmmitter("onfilterbar_loaded"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "onfilterbar_loaded"
    ] = this.filterUpdatesEventEmitter.subscribe((message: Emitmessage) => {
      const data: any = message.MESSAGE;

      // on filter load init loading of further dashboard
      if (message.ACTION_NAME === "FILTER_LOADED") {
        if (!this.filterBarLoaded) {
          this.setDashboardInitialUi();
        }

        if (data.dashboardTimePeriodToBeShown) {
          this.dashboardTimePeriodToBeShown = data.dashboardTimePeriodToBeShown;
        }

        this.filterBarLoaded = true;
        this.callChangeDetector();
        this.callChangeDetectorMarkForCheck();
      }

      /* on filter load, if filter contains the time period filter then the dashboard period need to be shown
             at the top to dashboard according to selection of time period.
             it update on load of filter and change of filter.
          */
      if (message.ACTION_NAME === "FILTER_UPDATED") {
        if (data.dashboardTimePeriodToBeShown) {
          this.dashboardTimePeriodToBeShown = data.dashboardTimePeriodToBeShown;
        }
      }
    });

    this.unsubscribeEmmitter("updateScreenSubscreeption"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "updateScreenSubscreeption"
    ] = this.tabStripBrodcast.subscribe((message: Emitmessage) => {
      if (message.ACTION_NAME === "UPDATE_SCREEN_WIDTH") {
        this.updateScreenWidth();
        const ua = window.navigator.userAgent;
        const msie = ua.indexOf("MSIE ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
          this.commonUtility.windowEvent();
        } else {
          window.dispatchEvent(new Event("resize"));
          this.zoneService.runOutsideAngular(() => {
            setTimeout(() => {
              window.dispatchEvent(new Event("resize"));
            }, 100);
            setTimeout(() => {
              window.dispatchEvent(new Event("resize"));
            }, 200);
          });
        }
      }
    });

    // email pdf event
    this.unsubscribeEmmitter("emailPdfReport"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "emailPdfReport"
    ] = this.generateAndMailPdfEmmitter.subscribe((objMessage: Emitmessage) => {
      if (objMessage.ACTION_NAME === "EMAIL_PDF_REPORT") {
        this.reportDir
          .saveAsHandler("mail_pdf", objMessage.MESSAGE)
          .then(response => {
            this.zoneService.runOutsideAngular(() => {
              (<any>document.querySelector("#pageLoading")).classList.add(
                "hide"
              );
              (<any>document.querySelector("#pageLoading")).classList.remove(
                "show"
              );
            });
            var message = response.error.text;
            if (message === "EMAIL_SENT") {
              this.emailSent = true;
              document.getElementById("okEmailButtonDash").focus();
            } else if (message === "SMTP_RELAY_ERROR") {
              this.smtpRelay = true;
              document.getElementById("okEmailButtonDash").focus();
            } else if (message === "SMTP_PORT_ERROR") {
              this.smtpPort = true;
              document.getElementById("okEmailButtonDash").focus();
            } else if (message === "EMAIL_SENDER_ERROR") {
              this.senderEmail = true;
              document.getElementById("okEmailButtonDash").focus();
            } else {
              this.emailNotSent = true;
              document.getElementById("okEmailButtonDash").focus();
            }
            this.callChangeDetector();
            this.emailPdfTemplate.show();
          });
      }
    });

    // Global Message subscription to save the messages, reset dashboard on confirmation
    /* const showGlobalMessageResponseEmitter =
    this.commonUtility.getBroadcastChannel(`${this._dashboard.dashboardId}_GLOBAL_MESSAGE_RESPONSE`);
    this.arrSubscription['showGlobalMessageResponseEmitter'] =
    showGlobalMessageResponseEmitter.subscribe( (objMessage) => {
      if ( objMessage.ACTION_NAME === 'SHOW_MESSAGE_RESPONSE' && this.resetDashboardInProgress === false ) {
        // this.isWidgetDragged = false;
        this.resetDashboardInProgress = true;
        this.tabregister.resetLayout( this.currTabId, this._dashboard.dashboardId ).then( (result) => {
          // this.filterBarLoaded = false;
          // this.dashboardLoaded = false;
          this._dashboard = this.tabregister.getActiveTab().getCurrentDashboard();
          this.setDashboard( this._dashboard );
          // this.dashboard = this.tabregister.getActiveTab().getCurrentDashboard();
          this.dashboardState.updateState( this._dashboard );
          this.resetDashboardInProgress = false;
          this.callChangeDetector();
          this.callChangeDetectorMarkForCheck();
        } );
      }
    });*/

    // update dashboard state on update size/location of widget in dashboard through freeform
    this.unsubscribeEmmitter("onUpdateWidgetSizeOrLocation"); // unsubscribe emmitter before subscribe it
    this.arrSubscription[
      "onUpdateWidgetSizeOrLocation"
    ] = this.widgetBroadCastChanel.subscribe((objMessage: Emitmessage) => {
      this.zoneService.runOutsideAngular(() => {
        setTimeout(() => {
          const tempDashbObj = this.tabregister
          .getTabByName(this.dashTitle)
          .getCurrentDashboard();
          if (tempDashbObj.dashboardId === this._dashboard.dashboardId) {
            this._dashboard = tempDashbObj;
            this.dashboardState.updateState(this._dashboard);
            this.callChangeDetector();
            this.callChangeDetectorMarkForCheck();
          }
        });
      });
    });
  }

  setDashboard(dashboard: Dashboard): void {
    this._dashboard = dashboard;
  }

  getDashboard(): Dashboard {
    return this._dashboard;
  }

  // getters
  get leftOffset(): number {
    return this._leftOffset;
  }

  get topOffset(): number {
    return this._topOffset;
  }

  get position(): string {
    return this._position;
  }

  get screenWidth(): number {
    return this._screenWidth;
  }

  get dashboardPadding(): number {
    return this._dashboardPadding;
  }

  get dashboard(): Dashboard {
    return <any>this._dashboard;
  }

  // setters
  set leftOffset(value: number) {
    this._leftOffset = value;
  }

  set topOffset(value: number) {
    this._topOffset = value;
  }

  set position(value: string) {
    this._position = value;
  }

  set screenWidth(value: number) {
    this.screenWidth = value;
  }

  set dashboardPadding(value: number) {
    this.dashboardPadding = value;
  }

  set dashboard(value: Dashboard) {
    this.dashboard = value;
  }

  saveDashState() {
    /*const SaveViewSucessMsg = this.i18nDirective.getTranslatedValue('SaveViewSucessMsg', 'View Saved Successfully');
    this.dashStateManager.saveDashboardState(this.dashboard.pageId).then(res => {
     if (res === 1) {
      this.commonUtility.showGlobalMessagePopup(MessageType.successMsg.toString(),
      '', SaveViewSucessMsg);
     }
    });*/

    if (this.dashboard.freeFlowDashboard) {
      if (this.dashboard.dashboardViewMode) {
        this.dashboardService
          .getPublishDashInfo(this._dashboard.dashboardId)
          .then(result => {
            if (!result) {
              this.resetDashState(true);
            } else {
              this.saveLayout();
            }
          });
      } else {
        this.saveLayout();
      }
    }
  }

  saveLayout() {
    this.tabregister
      .saveLayout(this.currTabId, this._dashboard.dashboardId)
      .then(result => {
        const SaveViewSucessMsg = this.i18nDirective.getTranslatedValue(
          "SaveViewSucessMsg",
          "View Saved Successfully"
        );
        const confMessage: ConfGlobalMessage = {
          confirmation: false,
          messageType: MessageType.successMsg,
          callbackEmmitterChannel: `${this.dashboard.dashboardId}_resetdashboard`,
          popupTitle: "Success",
          message: SaveViewSucessMsg,
          timeout: 5000,
          autoClose: true,
          dashboardId: this._dashboard.dashboardId
        };

        this.commonUtility.showGlobalMessagePopup(confMessage);

        // code to maintain dashboard state
        this._dashboard = this.tabregister
        .getTabByName(this.dashTitle)
        .getCurrentDashboard();
        this.dashboardState.setLandingJsonObject(this._dashboard);
        this.dashboardState.updateState(this._dashboard);
        this.dashboardState.maintainLandingState();
      });
  }

  resetDashState(isResetFromSave: boolean = false) {
    let messageType = isResetFromSave
      ? MessageType.confirmationMsgOnlyWithOk
      : MessageType.confirmationMsg;
    let translationID = isResetFromSave
      ? "ResetDashboardConfirmMsgOnlyWithOk"
      : "ResetDashboardConfirmMsg";
    let confirmationMessageOnlyWithOK =
      "This Dashboard is republished. Your current changes cannot be saved.";
    let confirmationMessage = "Are you sure you want to discard the changes?";
    let sourceMesasge = isResetFromSave
      ? confirmationMessageOnlyWithOK
      : confirmationMessage;
    const ResetDashboardConfirmMsg = this.i18nDirective.getTranslatedValue(
      translationID,
      sourceMesasge
    );

    const confMessage: ConfGlobalMessage = {
      confirmation: true,
      messageType: messageType,
      callbackEmmitterChannel: `${this._dashboard.dashboardId}_resetdashboard`,
      popupTitle: "Warning",
      message: ResetDashboardConfirmMsg,
      autoClose: false,
      messagePopupUId: `ResetDashboard-' + ${this._dashboard.dashboardId}`
    };
    this.commonUtility.showGlobalMessagePopup(confMessage);

    // on ok call back
    this.resetDashboardEmmitter = this.commonUtility.getBroadcastChannel(
      `${this._dashboard.dashboardId}_resetdashboard`
    );
    if (this.arrSubscription["reset_dashboard_subscribe"] !== undefined) {
      this.arrSubscription["reset_dashboard_subscribe"].unsubscribe();
    }
    this.arrSubscription[
      "reset_dashboard_subscribe"
    ] = this.resetDashboardEmmitter.subscribe((message: Emitmessage) => {
      if (message.ACTION_NAME === "SHOW_MESSAGE_RESPONSE") {
        this.resetDashboardInProgress = true;
        this.tabregister
          .resetLayout(this.currTabId, this._dashboard.dashboardId.toString())
          .then(result => {
            this._dashboard =this.tabregister
            .getTabByName(this.dashTitle)
            .getCurrentDashboard();
            this.setDashboard(this._dashboard);
            this._dashboard.refreshWidgetObject();
            this.computeTitleDescription();

            // code to maintain dashboard state
            this.dashboardState.setLandingJsonObject(this._dashboard);
            this.dashboardState.updateState(this._dashboard);
            this.callChangeDetector();
            this.callChangeDetectorMarkForCheck();

            this.resetDashboardInProgress = false; // release reset dashboard process
          });
      }
    });
  }

  isDashboardStateChanged(): boolean {
    return this.dashStateManager.isDashboardStateChangedForDashboardId(
      this.dashboard.pageId
    );
  }
  getTimeInterval() {
    this.userPreference.getUserPreferences(this.loggedInUserID).then(result => {
      result.forEach(pref => {
        if (pref.field === "AUTOREFRESH") {
          this.selectedTimeInterval = pref.preferences;
          if (this.selectedTimeInterval === undefined) {
            this.selectedTimeInterval = 1;
            this.timeInterval = this.selectedTimeInterval;
            this.dashboard.timeInterval = this.timeInterval;
          } else {
            this.timeInterval = this.selectedTimeInterval;
            this.dashboard.timeInterval = this.timeInterval;
            return this.timeInterval;
          }
        }
      });
    });
  }
  changeTimeInterval() {
    this.userPreferenceBrodcast = this.dashboardService.getBroadcastChannel(
      "USER_PREFERENCES"
    );
    this.arrSubscription[
      "timeIntervalSubscription"
    ] = this.userPreferenceBrodcast.subscribe(message => {
      if (message.action === "TIME_INTERVAL") {
        this.timeInterval = message.params.timeInterval;
      }
    });
  }

  autoRefreshDashboard() {
    this.autoRefresh = !this.autoRefresh;
    this._dashboard = this.tabregister
    .getTabByName(this.dashTitle)
    .getCurrentDashboard();
    this._dashboard["autoRefresh"] = this.autoRefresh;
    const elementsArray = document.querySelectorAll(".engine-widget-filter");
    for (let l = 0; l < elementsArray.length; l++) {
      elementsArray[l]["style"].display = "none";
    }
    this.PageFilterApplyButtonClicked();
    this.autoRefreshClicked = this.commonUtility.getBroadcastChannel(
      "AUTO_REFRESH_CLICKED"
    );
    this.autoRefreshClicked.emit({
      ACTION_NAME: "AUTO_REFRESH_CLICKED",
      MESSAGE: { autoRefresh: "true" }
    });
    this.filterValueUpdateOnautorefresh();

    if (typeof this.timeInterval === "undefined") {
      this.timeInterval = "1";
      this.dashboard.timeInterval = "1";
    }
    if (this.autoRefresh) {
      // this.dashboard.refreshDashboard();
      this.tabregister
        .getTabByName(this.dashTitle)
        .getCurrentDashboard();
      this.autoRefreshValue = setInterval(() => {
        if (this.activeTab) {
          // this.dashboard.refreshDashboard();
          for (let l = 0; l < elementsArray.length; l++) {
            elementsArray[l]["style"].display = "none";
          }
          this.PageFilterApplyButtonClicked();
          //   this.autoRefreshClicked =  this.commonUtility.getBroadcastChannel('AUTO_REFRESH_CLICKED');
          this.autoRefreshClicked.emit({
            ACTION_NAME: "AUTO_REFRESH_CLICKED",
            MESSAGE: { autoRefresh: "true" }
          });
          //const filterObj = this.filterbarserv.getFilterValuesObject(this.tabregister.getActiveTab().getCurrentDashboard());
          // if (filterObj !== undefined) {
          //   this.filterbarObj.getFilterList('autoRefresh');
          //   this.filterbarObj.getFilterList('autoRefresh');
          //   this.filterbarserv.setFilterBar(this.filterbarserv.getFilterValuesObject(this.tabregister.getActiveTab().getCurrentDashboard())
          //                                    , filterObj);
          // }
          this.filterValueUpdateOnautorefresh();
          this.tabregister
          .getTabByName(this.dashTitle)
          .getCurrentDashboard()
            .refreshDashboard();
        }
      }, 1000 * 60 * Number(this.timeInterval));
      this.autoRefreshState = "On";
      this.refresh = "Auto Refresh" + ":" + this.autoRefreshState;
    } else {
      clearInterval(this.autoRefreshValue);
      this.autoRefreshValue = undefined;
      this.autoRefreshState = "Off";
      this.refresh = "Auto Refresh" + ":" + this.autoRefreshState;
    }
  }

  /*function to hide/show dashboard buttons accordion to user settings in json or database*/
  procesButtonsVisibility() {
    this.dashButtonPreferences = {
      autoRefresh: "false",
      emailPDF: "false",
      saveAsMenu: "false",
      saveDashboardState: "false",
      rateDashboard: "false",
      addWidget: !(this.isPreviewMode === true),
      saveThisView: !(this.isPreviewMode === true),
      openView: !(this.isPreviewMode === true),
      resetDashboard: !(this.isPreviewMode === true)
    };
    this.dashboardService.getDashboardButtonPreference().then(res => {
      const records = res;
      if (records && records[0]) {
        this.dashButtonPreferences = records[0].preferences;
        const dbPref = this.dashButtonPreferences;
        const jsonPref = this._dashboard.dashboardbuttons || {};
        if (jsonPref["autoRefresh"] !== undefined) {
          this.dashButtonPreferences["autoRefresh"] = jsonPref["autoRefresh"];
        } else {
          this.dashButtonPreferences[
            "autoRefresh"
          ] = this.dashButtonPreferences.autoRefresh;
        }
        if (jsonPref["emailPDF"] !== undefined) {
          this.dashButtonPreferences["emailPDF"] = jsonPref["emailPDF"];
        } else {
          this.dashButtonPreferences[
            "emailPDF"
          ] = this.dashButtonPreferences.emailPDF;
        }
        if (jsonPref["saveAsMenu"] !== undefined) {
          this.dashButtonPreferences["saveAsMenu"] = jsonPref["saveAsMenu"];
        } else {
          this.dashButtonPreferences[
            "saveAsMenu"
          ] = this.dashButtonPreferences.saveAsMenu;
        }
        if (jsonPref["saveDashboardState"] !== undefined) {
          this.dashButtonPreferences["saveDashboardState"] =
            jsonPref["saveDashboardState"];
        } else {
          this.dashButtonPreferences[
            "saveDashboardState"
          ] = this.dashButtonPreferences.saveDashboardState;
        }
        if (jsonPref["rateDashboard"] !== undefined) {
          this.dashButtonPreferences["rateDashboard"] =
            jsonPref["rateDashboard"];
        } else {
          this.dashButtonPreferences[
            "rateDashboard"
          ] = this.dashButtonPreferences.rateDashboard;
        }
      }
      this.dashButtonPreferences.addWidget = !(this.isPreviewMode === true);
      this.dashButtonPreferences.saveThisView = !(this.isPreviewMode === true);
      this.dashButtonPreferences.openView = !(this.isPreviewMode === true);
      this.dashButtonPreferences.resetDashboard = !(
        this.isPreviewMode === true
      );
    });
  }

  // function to call change detector
  // this function checks if changeDector is not destroyed befor calling it.
  callChangeDetector() {
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

  PageFilterApplyButtonClicked(filterData?: any) {
    this.pageApplyButtonClick = this.commonUtility.getBroadcastChannel(
      "PAGE_FILTER_APPLYBUTTON_CLICKED"
    );
    const emitMessage: Emitmessage = {
      ACTION_NAME: "PAGE_FILTER_APPLYBUTTON_CLICKED",
      MESSAGE: { FilterValue: "any" }
    };
    this.pageApplyButtonClick.emit(emitMessage);
  }

  // function to unsubscribe emmitter
  unsubscribeEmmitter(emmitterName: string) {
    if (this.arrSubscription[emmitterName] !== undefined) {
      this.arrSubscription[emmitterName].unsubscribe();
    }
  }

  saveAsClick() {
    if (this._dashboard.intermittentLoading > 0) {
      const SaveAsOptionsMsg = this.i18nDirective.getTranslatedValue(
        "SaveAsOptionsMsg",
        "Dashboard couldnot save as one of the widgets are in Loading State."
      );
      const confMessage: ConfGlobalMessage = {
        confirmation: false,
        messageType: MessageType.confirmationMsgOnlyWithOk,
        callbackEmmitterChannel: `${this.dashboard.dashboardId}_resetdashboard`,
        popupTitle: "Warning",
        message: SaveAsOptionsMsg,
        timeout: 5000,
        autoClose: false,
        messagePopupUId: "SaveAsOptions-" + this._dashboard.dashboardId,
        dashboardId: this._dashboard.dashboardId
      };

      this.commonUtility.showGlobalMessagePopup(confMessage);
      this.downloadDropdown
        ? this.downloadDropdown.hide()
        : this.downloadDropdownMob.hide();
    } else {
      this.saveAsDropdownToggle();
    }
  }

  // this function is used for save as dropdown toggle
  private saveAsDropdownToggle() {
    this.saveAsDropdownMob = !this.saveAsDropdownMob;
    if (
      this.downloadDropdownMob &&
      !this.downloadDropdown &&
      this.saveAsDropdownMob
    ) {
      this.downloadDropdownMob.show();
    } else if (
      this.downloadDropdownMob &&
      !this.downloadDropdown &&
      !this.saveAsDropdownMob
    ) {
      this.downloadDropdownMob.hide();
    } else if (this.downloadDropdown && !this.downloadDropdownMob) {
      this.downloadDropdown.show();
    }
  }

  // function to open the LIC message box and creating the URL of dashboard
  openLicMsgBox(event) {
    this.inValidEmailMsg = this.i18nDirective.getTranslatedValue(
      "InvalidEmailMsg",
      LIC_STRINGS.INVALID_EMAIL_MSG
    );
    const id = this.dashboardService.getDashboardId(this.dashboard.pageId);
    const dashName = this.dashboard.pageId;
    this.fullUrl = document.createElement("input");
    let dynamicUrl = false;
    if (event.currentTarget.id === "shareDashboard") {
      dynamicUrl = false;
    } else {
      dynamicUrl = true;
    }
    const winOrigin = window.location.origin;
    const winPathname = window.location.pathname;
    let consolidatedFilters = "";
    if (this.dashboard.filterBarValues !== undefined) {
      const filterBarValues = this.dashboard.filterBarValues;
      const filterKeys = Object["keys"](filterBarValues);
      const filterValues = Object.keys(filterBarValues).map(
        item => filterBarValues[item]
      );
      let pageFilterObj = this.dashboard.filterbar.icons;
      let pageFilterKeys = Object["keys"](this.dashboard.filterbar.icons);

      if (pageFilterObj.Datetime) {
        for (let i = filterKeys.length - 1; i >= 0; i = i - 1) {
          if (filterKeys[i] === "timeFrom" || filterKeys[i] === "timeTo") {
            if (!dynamicUrl) {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "=" + filterValues[i] + "&"
              );
            } else {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "={" + filterKeys[i] + "}&"
              );
            }
          }
        }
      }
      if (pageFilterObj.Aggregation || pageFilterObj.Summarization) {
        for (let i = filterKeys.length - 1; i >= 0; i = i - 1) {
          if (
            filterKeys[i] === DefaultFilters.AGGREGATION ||
            filterKeys[i] === DefaultFilters.SUMMARIZATION
          ) {
            if (!dynamicUrl) {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "=" + filterValues[i] + "&"
              );
            } else {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "={" + filterKeys[i] + "}&"
              );
            }
          }
        }
      }
      let newFilterNamesArr = [];
      for (let i = 0; i < pageFilterKeys.length; i++) {
        if (
          pageFilterKeys[i] !== DefaultFilters.DATETIME &&
          pageFilterKeys[i] !== DefaultFilters.INTERVAL &&
          pageFilterKeys[i] !== DefaultFilters.AGGREGATION &&
          pageFilterKeys[i] !== DefaultFilters.SUMMARIZATION
        ) {
          newFilterNamesArr.push(pageFilterKeys[i]);
        }
      }
      for (let x = 0; x < newFilterNamesArr.length; x++) {
        for (let i = filterKeys.length - 1; i >= 0; i = i - 1) {
          if (filterKeys[i] == newFilterNamesArr[x]) {
            if (!dynamicUrl) {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "=" + filterValues[i] + "&"
              );
            } else {
              consolidatedFilters = consolidatedFilters.concat(
                filterKeys[i] + "={" + filterKeys[i] + "}&"
              );
            }
          }
        }
      }
      consolidatedFilters = consolidatedFilters.substring(
        0,
        consolidatedFilters.length - 1
      );
      for (let i = 0; i < filterKeys.length; i++) {
        this.fullUrl.value =
          winOrigin +
          winPathname +
          "?dashboardName=" +
          dashName +
          "&dashboardId=" +
          id +
          "&m=0&" +
          consolidatedFilters;
      }
    } else {
      this.fullUrl.value =
        winOrigin +
        winPathname +
        "?dashboardName=" +
        dashName +
        "&dashboardId=" +
        id +
        "&m=0";
    }
    this.commonUtility.setDashboardUrl(this.fullUrl.value);
    if (event.currentTarget.id === "shareDashboard") {
      this.isStaticDashboardShared = true;
      this.preUrlLicMessage = this.i18nDirective.getTranslatedValue(
        "preUrlLicStaticMessage",
        LIC_STRINGS.PRE_URL_LIC_STATIC_MSG
      );
      // this.postUrlLicMessage = this.i18nDirective.getTranslatedValue(
      //   "postUrlLicStaticMessage",
      //   LIC_STRINGS.POST_URL_LIC_STATIC_MSG
      // );
      this.emailLinkHeader = this.i18nDirective.getTranslatedValue(
        "shareLinkDashboard",
        LIC_STRINGS.SHARE_LINK_DASHBOARD
      );
      this.post1UrlLicMessage = this.i18nDirective.getTranslatedValue(
        "postUrlLicStaticMessageStart",
        LIC_STRINGS.POST_CHANGED_LIC_STATIC_MSG_START
      );
      this.post2UrlLicMessage = this.i18nDirective.getTranslatedValue(
        "postUrlLicStaticMessageEnd",
        LIC_STRINGS.POST_CHANGED_LIC_STATIC_MSG_END
      );

      //PRD - White label - custom application name / LIC message
      this.postUrlLicMessage =
        this.post1UrlLicMessage +
        this.AppName.appLongName +
        " " +
        this.post2UrlLicMessage;
    } else if (event.currentTarget.id === "generateDashboardUrl") {
      this.isStaticDashboardShared = false;
      this.preUrlLicMessage = this.i18nDirective.getTranslatedValue(
        "preUrlLicLaunchMessage",
        LIC_STRINGS.PRE_URL_LIC_LAUNCH_MSG
      );
      this.postUrlLicMessage =
        "\n" +
        this.i18nDirective.getTranslatedValue(
          "postUrlLicDynamicMessage",
          LIC_STRINGS.POST_URL_LIC_DYNAMIC_MSG
        );
      this.emailLinkHeader = this.i18nDirective.getTranslatedValue(
        "generateShareLinkDashboard",
        LIC_STRINGS.GENERATE_LINK_DASHBOARD
      );
    }

    this.preUrlLicMessage = this.preUrlLicMessage.replace(",", ",\n");
    this.shareDashboardUrl = this.fullUrl.value;
    this.licFormObj.subject = "";
    this.licFormObj.emailIds = "";
    this.submitAttempt = false;
    this.InvalidFields = false;
    this.zoneService.runOutsideAngular(() => {
      setTimeout(() => {
        this.isStaticDashboardShared
          ? document.getElementById("licSubject").focus()
          : document.getElementById("licFormDropdown").focus();
        this.licOldMsg = this.licMessageTempl.nativeElement.innerHTML;
      }, 300);
    });
  }

  // function to disable the LIC list for drilldown dashboard
  openShareDashboardModal() {
    this.isKebabMenuClicked = true;
    this.saveAsDropdownMob = false;
    const activeTabtitle = this.tabComponentInstance.getActiveTabTitle();
    this.isShareDashboardPopover = true;
    if (
      this.showBackbutton ||
      this.dashboard.title === this.drillDownservice.idTitlePair[activeTabtitle]
    ) {
      this.isDisabledShareDashboard = true;
    } else {
      this.isDisabledShareDashboard = false;
    }
  }

  // function to close the LIC message popover
  closeShareDashPopOver(event) {
    this.onHidePopover();
    if (this.shareDashModalref) {
      this.shareDashModalref.hide();
    } else if (
      this.shareDashboardPopover ||
      this.shareDynamicDashbPopoverTmpl
    ) {
      this.shareDashboardPopover.hide();
      this.shareDynamicDashbPopoverTmpl.hide();
    }
    this.isKebabMenuClicked = false;
    if (
      event &&
      (event === "Esc" ||
        event.target.textContent === "Cancel" ||
        event.target.title === "Close")
    ) {
      this.kebabMenuDropdown.nativeElement.focus();
    }
  }

  // function to open lic message modal on mobile device
  openModal(shareDashboardUrlModal: TemplateRef<any>) {
    this.shareDashModalref = this.shareDashboardModalService.show(
      shareDashboardUrlModal
    );
  }

  // function to change to dropdown of dynamic LIC message
  onChangeLic(event) {
    this.licMessageValue = "";
    this.licMessageTempl.nativeElement.textContent = "";
    if (
      event.currentTarget.value ===
      this.i18nDirective.getTranslatedValue(
        "embedDashboard",
        LIC_STRINGS.EMBED_DASHBOARD
      )
    ) {
      this.preUrlLicMessage = this.i18nDirective.getTranslatedValue(
        "preUrlLicEmbedMessage",
        LIC_STRINGS.PRE_URL_LIC_EMBED_MSG
      );
      // this.postUrlLicMessage = this.i18nDirective.getTranslatedValue('postUrlLicDynamicMessage', LIC_STRINGS.postUrlLicDynamicMessage);
      this.isEmbedUrl = true;
      this.shareDashboardUrl = this.shareDashboardUrl.replace("&m=0", "&m=1");
    } else if (
      event.currentTarget.value ===
      this.i18nDirective.getTranslatedValue(
        "launchDashboard",
        LIC_STRINGS.LAUNCH_DASHBOARD
      )
    ) {
      this.preUrlLicMessage = this.i18nDirective.getTranslatedValue(
        "preUrlLicLaunchMessage",
        LIC_STRINGS.PRE_URL_LIC_LAUNCH_MSG
      );
      this.isEmbedUrl = false;
      this.shareDashboardUrl = this.fullUrl.value;
    }
    this.preUrlLicMessage = this.preUrlLicMessage.replace(",", ",\n");
    this.postUrlLicMessage =
      "\n" +
      this.i18nDirective.getTranslatedValue(
        "postUrlLicDynamicMessage",
        LIC_STRINGS.POST_URL_LIC_DYNAMIC_MSG
      );
    this.setLicMsgElement();
  }

  // this method is used for setting lic message field element while changing the dropdown of 'Generate a link'.
  private setLicMsgElement() {
    const licMsgSpan = document.createElement("span");
    const lisMsgSpanAttribute = document.createAttribute("style");
    lisMsgSpanAttribute.value = "color: blue";
    licMsgSpan.setAttributeNode(lisMsgSpanAttribute);
    licMsgSpan.textContent = this.shareDashboardUrl;
    const preUrlLicMsgTextNode = document.createTextNode(<string>(
      this.preUrlLicMessage
    ));
    const postUrlLicMsgTextNode = document.createTextNode(<string>(
      this.postUrlLicMessage
    ));
    this.licMessageTempl.nativeElement.appendChild(preUrlLicMsgTextNode);
    this.licMessageTempl.nativeElement.appendChild(
      document.createElement("br")
    );
    this.licMessageTempl.nativeElement.appendChild(licMsgSpan);
    this.licMessageTempl.nativeElement.appendChild(postUrlLicMsgTextNode);
  }

  // function to call email validation function from email service
  validateEmailId() {
    this.isEmailValid = this.emailService.validateEmailAddress(
      this.licEmailField.nativeElement.value
    );
    if (this.isEmailValid) {
      this.emailErrorMessageTmpl.hide();
    } else {
      this.emailErrorMessageTmpl.show();
      // this.licEmailField.nativeElement.focus();
    }
  }

  // function to validate all the lic form fields.
  validateAllFields() {
    this.validateEmailId();
    if (!this.licFormObj["subject"] || this.licFormObj["subject"] === "") {
      this.licSubjectField.nativeElement.focus();
    } else if (
      !this.licFormObj["emailIds"] ||
      this.licFormObj["emailIds"] === "" ||
      !this.isEmailValid
    ) {
      this.licEmailField.nativeElement.focus();
    } else if (
      !this.licMessageTempl ||
      this.licMessageTempl.nativeElement.textContent === ""
    ) {
      this.licMessageTempl.nativeElement.focus();
    }
  }

  // Function to call email service
  sendLicEmail() {
    this.submitAttempt = true;
    let bodyContent = "";
    let responseMessage = "";
    let licResponseMessageType = MessageType.successMsg;
    const isInValidValue =
      this.licFormObj["subject"] === undefined ||
      this.licFormObj["emailIds"] === undefined ||
      this.licMessageTempl === undefined ||
      this.licFormObj["subject"] === "" ||
      this.licFormObj["emailIds"] === "" ||
      this.licMessageTempl.nativeElement.textContent === "";
    if (isInValidValue) {
      this.InvalidFields = true;
    } else {
      this.InvalidFields = false;
    }
    if (
      this.isEmailValid &&
      this.licFormObj["emailIds"].length > 0 &&
      !this.InvalidFields
    ) {
      if (this.isStaticDashboardShared) {
        let splitDashboardURL = this.shareDashboardUrl.split('?');
        bodyContent = this.licMessageTempl.nativeElement.innerText.replace(
          this.dashboard.title,
          " <a href=" +
             splitDashboardURL[0] + '?' + encodeURI(splitDashboardURL[1]) +
            ">" +
            this.dashboard.title +
            "</a> "
        );
      } else {
        bodyContent = this.licMessageTempl.nativeElement.innerText;
      }
      bodyContent = bodyContent.split("\n").join("<br>");
      const emailParams = {
        emailId: this.licFormObj["emailIds"],
        subject: this.licFormObj["subject"],
        bodyContent: bodyContent
      };
      this.emailService
        .sendEmailWithoutAttachment(emailParams)
        .then(response => {
          this.closeShareDashPopOver(null);
          this.zoneService.runOutsideAngular(() => {
            (<any>document.querySelector("#pageLoading")).classList.add("hide");
            (<any>document.querySelector("#pageLoading")).classList.remove(
              "show"
            );
          });
          var message = response.error.text;
          switch (message) {
            case "EMAIL_SENT":
              responseMessage = "Email is sent.";
              licResponseMessageType = MessageType.successMsg;
              const themesavedMsg = this.i18nDirective.getTranslatedValue(
                "emailSent",
                responseMessage
              );
              const confMessage: ConfGlobalMessage = {
                message: themesavedMsg,
                messagePopupUId: "lic_response",
                messageType: licResponseMessageType,
                autoClose: true
              };
              this.commonUtility.showGlobalMessagePopup(confMessage);
              break;

            case "SMTP_RELAY_ERROR":
              this.smtpRelay = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            case "SMTP_PORT_ERROR":
              this.smtpPort = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            case "EMAIL_SENDER_ERROR":
              this.senderEmail = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;

            default:
              this.emailNotSent = true;
              this.callChangeDetector();
              this.emailPdfTemplate.show();
              break;
          }
          this.kebabMenuDropdown.nativeElement.removeAttribute("aria-haspopup");
          this.zoneService.runOutsideAngular(() => {
            document.getElementById("okEmailButtonDash").focus();
          });
        });
    }
  }

  // function to limit the character to enter for mbile device
  checkInputChar(evt: any, count: number) {
    let inputTextValue = evt.target.value;
    const textContent = evt.target.textContent;
    if (inputTextValue && inputTextValue.length > count) {
      inputTextValue = inputTextValue.substring(0, count);
    } else if (
      textContent &&
      textContent.length > count &&
      !(evt.ctrlKey && evt.keyCode === 65) &&
      evt.keyCode !== 46 &&
      evt.keyCode !== 8 &&
      evt.keyCode !== 37 &&
      evt.keyCode !== 38 &&
      evt.keyCode !== 39 &&
      evt.keyCode !== 40
    ) {
      // evt.target.textContent = this.licOldMsg;
      this.licMessageTempl.nativeElement.innerHTML = this.licOldMsg;
    } else if (textContent && textContent.length <= count) {
      this.licOldMsg = evt.target.innerHTML;
    }
  }

  // function to fire onhidden event for lic
  onHiddenLicDropdown() {
    setTimeout(() => {
      this.isKebabMenuClicked = false;
    });
  }

  // function to fire onshown event for lic
  onShownLicDropdown() {
    this.isKebabMenuClicked = true;
  }

  filterValueUpdateOnautorefresh() {
    const filterObj = this.filterbarserv.getFilterValuesObject(
      this.tabregister
      .getTabByName(this.dashTitle)
      .getCurrentDashboard()
    );

    if (filterObj !== undefined) {
      this.filterbarObj.FilterDurationUpdateonAutorefresh();
      const dashboardObj = this.tabregister
        .getTabByName(this.dashTitle)
        .getCurrentDashboard();
      this.dashboardTimePeriodToBeShown = this.filterbarserv.getDashboardTimeDuration(
        dashboardObj
      );
    }
  }
  setDashTime(evt: any) {
    this.dashboardTimePeriodToBeShown = evt;
  }

  onShowPopover(){
    this.DashboardFactoryService.popoverSubject.next('block');
  }
  onHidePopover(){
    this.DashboardFactoryService.popoverSubject.next('none');
  }
}
