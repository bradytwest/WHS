import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ICategoryCheckboxControl, ServiceProviderService, ReferenceComponent, IDataValueSubscription, SetFieldConverterService, ISetTextBoxControl, ICategory, ICultureInfo } from '@blaise/core';
import moment from 'moment-es6';

interface IMonth extends ICategory {
  selected: boolean,
  enabled: boolean,
  preselected: boolean,
  source: string,
  text: string
}

@Component({
  selector: 'app-custom-calendar',
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomCalendarComponent extends ReferenceComponent<ISetTextBoxControl> implements OnInit {

  /**
   * Constant for the Custom Properties
   */
  private readonly monthSelectorColumns = 'MonthSelectorColumns';
  private readonly monthSelectorDelay = 'MonthSelectorDelay';
  private readonly monthSelectorStartDate = 'MonthSelectorStartDate';
  private readonly monthSelectorSelectedMonths = 'MonthSelectorSelectedMonths';
  private readonly monthSelectorCheckmarksForSelected = 'MonthSelectorCheckmarksForSelected';
  private readonly monthSelectorImageDimensions = 'MonthSelectorImageDimensions';

  public months: IMonth[];
  /**
   * Represents the checked state of the category checkbox.
   */
  public isChecked: boolean;

  /**
   * The CultureInfo of the current survey
   */
  private currentCultureInfo: ICultureInfo;
  private lastClickedMonth: IMonth;
  /**
   * The click intertval which is seen as a double click
   */
  private clickInterval: number = 2000;
  private columns: number = 3;
  // default image width 80 px
  public imageDimensions: string = '80';
  private startDate: string;
  private selectedMonths: number[];
  private useCheckmarks: boolean;

  // timeOut var
  private timeOut;  
  private clickedTwice: boolean = false;

  constructor(
    protected sp: ServiceProviderService,
    protected element: ElementRef,
    protected cd: ChangeDetectorRef,
    /**
      * converter Set field converter service
      */
    protected converter: SetFieldConverterService,
  ) {
    super(sp, element, cd);
  }

  ngOnInit() {
    super.ngOnInit();   
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
  
  }

  public getCssClasses() {
    let result = super.getCssClasses();
    result.push('CustomCalendarComponent');
    return result;
  }

  /**
   * HandleFieldUpdate will occur after handleControlUpdate
   * @param dvs
   */
  handleFieldUpdate(dvs: IDataValueSubscription) {
    super.handleFieldUpdate(dvs);

    // list of empty months
    this.months = [];

    // startDate
    const startDateYear = parseInt(this.startDate.split('|')[0]);
    const startDateMonth = parseInt(this.startDate.split('|')[1]);
    // startDate of calendar, 25 months before current
    let startMonth = moment(`${startDateYear}-${('0' + startDateMonth).slice(-2)}-01`).subtract(1, 'M');
    //console.log('startMonth', moment(startMonth).format());
    // startMonth of selectable area current month - 23 months
    const startMonthSelectable = moment(startMonth).subtract(23, 'M');
    //console.log('startMonthSelectable',  moment(startMonthSelectable).format());
    const modulus = (moment(startMonthSelectable).month()) % this.columns;
    //console.log('modulus', modulus);
    // substract the modulus
    startMonth = moment(startMonthSelectable).subtract(modulus, 'M');
    //console.log('startMonth', moment(startMonth).format());
    // endMonth of selectable are
    const endmonthSelectable = moment(startMonthSelectable).add(24, 'M');
    //console.log('endmonthSelectable',  moment(endmonthSelectable).format());
    // only set once
    if (!this.currentCultureInfo) {
      this.currentCultureInfo = this.sp.cultureInfoService.cultureInfo;
    }
    // while startMonth < startDatemonth add disabled months
    let monthCounter = moment(startMonth);
    while (monthCounter.isBefore(startMonthSelectable)) {

      this.months.push({
        Code: null,
        Name: null,
        selected: false,
        source: `${this.sp.helperService.getBaseHref(true)}Content/calendar_disabled.png`,
        enabled: false,
        preselected: false,
        text: `${this.currentCultureInfo.ShortestMonthNames[monthCounter.month()]} ${monthCounter.year()}`
      });
      monthCounter.add(1, 'M');
    }
    // add selectable area
    let categoryCounter = 0;
    while (monthCounter.isBefore(endmonthSelectable)) {
      this.months.push(this.createMonth(dvs.ValueType.Categories[categoryCounter], dvs, `${this.currentCultureInfo.ShortestMonthNames[monthCounter.month()]} ${monthCounter.year()}`));
      categoryCounter++;
      monthCounter.add(1, 'M');
    }
    // determine disabled
    const endMonth = moment(endmonthSelectable).add(this.columns - modulus, 'M').format();
    //console.log('endMonth',endMonth);
    // add disabled months
    while (monthCounter.isBefore(endMonth)) {
      this.months.push({
        Code: null,
        Name: null,
        selected: false,
        source: `${this.sp.helperService.getBaseHref(true)}Content/calendar_disabled.png`,
        enabled: false,
        preselected: false,
        text: `${this.currentCultureInfo.ShortestMonthNames[monthCounter.month()]} ${monthCounter.year()}`
      });
      monthCounter.add(1, 'M');
    }
  }

  handleControlUpdate(control: ICategoryCheckboxControl) {
    super.handleControlUpdate(control);

    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorImageDimensions)) {
      this.imageDimensions = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorImageDimensions);
    }
    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorColumns)) {
      this.columns = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorColumns)
    }
    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorDelay)) {
      this.clickInterval = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorDelay)
    }
    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorStartDate)) {
      this.startDate = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorStartDate)
    }
    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorSelectedMonths) && this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorSelectedMonths) != '') {
      const arrayOfStrings = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorSelectedMonths).split('-');
      this.selectedMonths = arrayOfStrings.map(x => parseInt(x));
    }
    if (this.sp.customPropertyService.hasCustomProperty(control, this.monthSelectorCheckmarksForSelected)) {
      this.useCheckmarks = this.sp.customPropertyService.getValueForCustomProperty(control, this.monthSelectorCheckmarksForSelected)
    }
  }

  /**
   * handles the clicks
   * @param event
   */
  onClick(month: IMonth, event: MouseEvent | TouchEvent) {    
    if(!this.clickedTwice) {
      this.clickedTwice = true;
      this.timeOut = setTimeout(() => { 
        this.clickedTwice = false;        
        // execute single click
        this.doOnClick(month);
      }, this.clickInterval);
      return false;
    }

    event.preventDefault();    
    // remove the single click execution path
    clearTimeout(this.timeOut);
    this.timeOut = null;
    // reset
    this.clickedTwice = false;
    // execute cbldClick
    this.doOnDblClick(month);
  } 

  doOnDblClick = (month: IMonth) => {
    if (this.lastClickedMonth) {
      // get the referenceSubject
      const dvs: IDataValueSubscription = this.referenceSubject.getValue();
      const cats: number[] = [month.Code, this.lastClickedMonth.Code].sort((a, b) => a - b);
      const filtered = dvs.ValueType.Categories.filter((c) => {
        return c.Code >= cats[0] && c.Code <= cats[1];
      });
      filtered.forEach((f) => {
        this.executeClick(f.Code, this.converter.isSelected(dvs, this.lastClickedMonth.Code));
      });
      // clear the lastClickedMonth
      this.lastClickedMonth = null;
      // execute the default actions after changing field
      this.executeDefaultActions();
    } else {
      this.doOnClick(month);
    }

  }

  doOnClick = (month: IMonth) => {
    if (month && month.Code && month.enabled) {
      // execute the click
      this.executeClick(month.Code)
      // store the new state
      this.lastClickedMonth = month;
      // execute the default actions after changing field
      this.executeDefaultActions();
    }
  }

  private executeClick(code: number, selected?: boolean) {
    const dvs: IDataValueSubscription = this.referenceSubject.getValue();
    const currentlySelected: boolean = selected == null ? this.converter.isSelected(dvs, code) : !selected;
    if (currentlySelected) {
      // Remove selected category
      this.converter.removeCategory(dvs, code);
    } else {
      // Add selected category (if allowed)
      if (!this.converter.addCategory(dvs, code)) { }
    }
  }

  private executeDefaultActions() {
    // get the referenceSubject
    const dvs: IDataValueSubscription = this.referenceSubject.getValue();
    // Notify observers of changed field
    this.triggerSubscriptionUpdate(dvs);
    // Switch keyboard navigation to insert mode
    this.sp.navigationService.setInsertMode();
    // Execute corresponding actions
    this.executeActions(this.dataObject.OnValueChanged);
    // If needed auto-enter
    this.applyAutoEnter(this.dataObject.AutoEnter, this.converter, dvs);
  }

  private createMonth = (category: ICategory, dvs: IDataValueSubscription, text: string): IMonth => {
    const isSelected = this.converter.isSelected(dvs, category.Code);
    const isPreselected = this.selectedMonths ? this.selectedMonths.indexOf(category.Code) > -1 : false

    let source = `${this.sp.helperService.getBaseHref(true)}Content/`;

    if (this.useCheckmarks) {
      // when using checkmarks
      // default: calendar.png
      // preselected: calendar_green.png
      // selected: calendar_white_selected.png
      // selected && preselected: calendar_green_selected.png
      source = isSelected ? (isPreselected ? `${source}calendar_green_selected.png` : `${source}calendar_white_selected.png`) : (isPreselected ? `${source}calendar_green.png` : `${source}calendar.png`);
    } else {
      // when not using checkmarks
      // default: calendar.png
      // selected: calendar_green.png
      source = isSelected ? `${source}calendar_green.png` : `${source}calendar.png`;
    }
    const result = Object.assign({
      selected: isSelected,
      source: source,
      enabled: true,
      preselected: isPreselected,
      text: text
    }, category);
    return result;
  }
}
