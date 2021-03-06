<div class="frm-time-period">
  <fieldset>
    <legend class="sr-only">Filter Dropdown</legend>
    <div id="text-search-filter" class="text-search-filter-wrapper" *ngIf="textboxWithSearch" [ngClass]="{ 'has-error': !isTBValid }">
      <input
        matInput
        aria-label="filters"
        autocomplete="off"
        [matAutocomplete]="auto"
        [disableOptionCentering]="true"
        [disableRipple]="true"
        id="{{ parentDashboard.pageId + config.name }}"
        [(ngModel)]="selectedValue"
        name="dropdown"
        panelClass="custom-dropdown-panel"
        autocomplete="off"
        role="combobox"
        (input)="fetchData($event);"
        (keyup.backspace)="fetchData($event);validateTextSearch();"
        #autcompleteTextbox="bs-tooltip"
        [tooltip]="invalidErrorMsg"
        triggers=""
        placement="top"
        containerClass="tooltip-error filter-error-tooltip"
        placeholder="{{inputPlaceHolder}}"
        class="form-control"
        [ngClass]="{ 'has-error': !isTBValid }"
      />

      <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete" class="text-filter-autocomplete">
        <ng-container *ngFor="let option of filteredData; trackBy: trackFunction">
        <mat-option
          *ngIf = "option.label !==''"
          [value]="option.value"
          (click)="selectItem($event, widgetid)"
          (keydown)="selectItem($event, widgetid)"
          [ngClass]="{
            selectedOptionAutcomplete: option.label == selectedValue
          }"
        >
          <span
            i18n="@@option"
            appI18nDirective
            [i18nParams]="
              'textId=' + option + ';pageId=' + parentDashboard.pageId
            "
            >{{ option.label }}</span
          >
        </mat-option>
      </ng-container>
      </mat-autocomplete>
    </div>

    <!-- Drop-down list with search and multiple mode support -->
    <div id="dropdown-search-filter" *ngIf="dropdownFilterWithSearch">
      <mat-select
        #matSelectDropDown
        [(multiple)] = "multiSelect"
        role="listbox"
        [(value)]="selectedValue"
        id="{{ parentDashboard.pageId + config.name }}"
        [disableRipple]="true"
        [disableOptionCentering]="true"
        aria-label="filters"
        name="dropdown"
        [panelClass]="multiSelect ? 'multi-select-panel custom-dropdown-panel custom-filter-dropdown-panel': 'custom-dropdown-panel custom-filter-dropdown-panel'"
        [ngClass]="{ 'multi-select': multiSelect }"
        (openedChange)="changedDropDown($event)"
        (selectionChange)="focusElement(event, 'DropDownChange')"
      >
          <mat-select-trigger *ngIf="multiSelect">
            <ng-container *ngTemplateOutlet="multiSelectCustomTrigger"></ng-container>
          </mat-select-trigger>
          <div class="mat-option search-group-wrapper">
            <div id="dropdown-search-filter-input-wrapper" class="input-group">
              <input
                #dropDownSearch
                matInput
                type="text"
                aria-label="filters"
                [(ngModel)]="selectedValueDDSearch"
                (click)="$event.stopPropagation()"
                (keydown.space)="$event.stopPropagation()"
                (input)="getFilterData(selectedValueDDSearch);"
                autocomplete="off"
                class="form-control"
                placeholder="{{inputPlaceHolder}}"
                [attr.select-trigger-id]="parentDashboard.pageId + config.name"
              />
              <span class="input-group-addon">
                <span
                  class="wrap-svg-ico ico-search"
                  appSvgIcon
                  [svgIconID]="'search'"
                ></span>
              </span>
            </div>
          </div>
          <div class="search-checkbox-wrapper select-all-checkbox-wrapper">
            <mat-checkbox *ngIf="selectAllEnabled"
              class="select-all-checkbox mat-option"
              [(ngModel)]="selectAllChecked"
              (change)="toggleSelectionAll($event)">
              Select All
            </mat-checkbox>
          </div>
          <mat-option
          *ngFor="let option of filteredOptions"
          [value]="option.value"
          [disabled]="!selectAllEnabled && selectedValue.length === multiSelectLimit && !selectedValue.includes(option.value)"
          (click)="selectItem($event, widgetid)"
        >
          <span
            i18n="@@option.value"
            appI18nDirective
            [i18nParams]="
              'textId=' + option.value + ';pageId=' + parentDashboard.pageId
            "
            >{{ option.label }}</span
          >
        </mat-option>
        <mat-option *ngIf="noDataFoundFilter">
          <span
          i18n="@@noResult"
          appI18nDirective
          [i18nParams]="'textId=noResult;'"
          >No Result Found</span
        >
        </mat-option>
      </mat-select>
    </div>

    <!-- Drop-down list with multiple mode support -->
    <div id="dropdown-filter" *ngIf="dropdownFilter">
      <mat-select
        [(multiple)] = "multiSelect"
        [(value)]="selectedValue"
        id="{{ parentDashboard.pageId + config.name }}"
        (keyup.enter)="openCustomDateSelectionPopup($event, widgetid)"
        (keyup.space)="openCustomDateSelectionPopup($event, widgetid)"
        [disableRipple]="true"
        [disableOptionCentering]="true"
        name="dropdown"
        #datetimeFilter
        [ngClass]="{ 'multi-select': multiSelect }"
        [panelClass]="multiSelect ? 'multi-select-panel custom-dropdown-panel': 'custom-dropdown-panel'"
        (openedChange)="changedDropDown($event)"
      >
        <mat-select-trigger *ngIf="multiSelect">
          <ng-container *ngTemplateOutlet="multiSelectCustomTrigger"></ng-container>
        </mat-select-trigger>
        <div class="select-all-checkbox-wrapper">
          <mat-checkbox *ngIf="selectAllEnabled"
            class="select-all-checkbox mat-option"
            [(ngModel)]="selectAllChecked"
            (change)="toggleSelectionAll($event)">
            Select All
          </mat-checkbox>
        </div>
        <mat-option
          *ngFor="let option of dropDownValues"
          [value]="option.value"
          [disabled]="!selectAllEnabled && selectedValue.length === multiSelectLimit && !selectedValue.includes(option.value)"
          (click)="selectItem($event, widgetid)"
        >
          <span
            i18n="@@option.value"
            appI18nDirective
            [i18nParams]="
              'textId=' + option.value + ';pageId=' + parentDashboard.pageId
            "
            >{{ option.label }}</span
          >
        </mat-option>
      </mat-select>
    </div>
  </fieldset>
</div>

<!-- Reusable filter component templates-->

<!-- Custom trigger for multi-select filters -->
<ng-template #multiSelectCustomTrigger>
  <span class="filter-selected-values">{{selectedValue ? selectedValue[0] : ''}}</span>
  <span *ngIf="selectedValue?.length > 1" class="selected-values-more-count">
  +{{selectedValue.length - 1+ " more"}}
  </span>
  <button *ngIf="multiSelect" (keydown)="$event.stopPropagation()" (click)="clearSelection();$event.stopPropagation()" class="btn-clear-selection">
    <span 
      appSvgIcon
      [svgIconID]="'close'"
      class="wrap-svg-ico ico-close">
    </span>
  </button>
</ng-template>

<app-custom-popup
  [widgetid]="widgetid"
  [dashBoard]="dashBoard"
  *ngIf="config.isTimeperiodFilter === true"
  #customPopupModal
></app-custom-popup>
<div appI18nDirective></div>
