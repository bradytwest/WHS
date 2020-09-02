import { Injectable } from '@angular/core';
import { ModelService, CustomPropertyService, IBaseComponentViewModel, IBaseControl, ControlKind } from '@blaise/core';
import { CustomCalendarComponent } from 'src/app/components/custom-calendar/custom-calendar.component';
import { CONSTANS } from 'src/app/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class CustomModelService extends ModelService {

  constructor(private customPropertyService: CustomPropertyService) {
    super();
  }

  /**
     * Creates the component
     * @param object
     * @param {string} parent
     * @returns {IBaseComponentViewModel}
     */
  public createChild(object: any, parent: string): IBaseComponentViewModel {

    // 
    if(object && (object as IBaseControl).Kind === ControlKind.SetTextBox && this.customPropertyService.hasCustomProperties(object)) {
      if(this.customPropertyService.hasCustomProperty(object, CONSTANS.CUSTOM_PROPERTY_NAME)) {
        const child: IBaseComponentViewModel = { type: null, dataObject: null, style: null, cssClass: null, parentId: parent };
        child.type = CustomCalendarComponent;
        child.dataObject = object;
        return child;
      }            
    }
    return super.createChild(object, parent);
  }
}
