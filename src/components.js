import BaseButton from '@/components/Buttons/BaseButton/BaseButton.vue'
import AddReservationButton from '@/components/Buttons/AddReservationButton.vue'
import BorderTab from '@/components/Buttons/BorderTab.vue'
import FillTab from '@/components/Buttons/FillTab.vue'

import BaseInput from '@/components/Input/BaseInput/BaseInput.vue' //new
import PhoneInput from '@/components/Input/PhoneInput.vue'
import SearchInput from '@/components/Input/SearchInput.vue'

import CheckBox from '@/components/CheckBox/CheckboxInput.vue'
import RadioBox from '@/components/Radio/RadioInput.vue'
import SwitchBox from '@/components/SwitchToggle/SwitchInput.vue'

import TodayButton from '@/components/Calendar/TodayButton.vue'
import ButtonDatePicker from '@/components/Calendar/ButtonDatePicker.vue'
import InputDatePicker from '@/components/Calendar/InputDatePicker.vue'
import RangePicker from '@/components/Calendar/RangePicker.vue'
import DatePickerMonth from '@/components/Calendar/DatePickerMonth.vue'
import DropdownMenu from '@/components/Dropdown/DropdownMenu/DropdownMenu.vue'
import TagReservationStatus from '@/components/Tag/ReservationStatus.vue'
import TagRoleStatus from '@/components/Tag/RoleStatus.vue'
import ReservationStatusCard from '@/components/Card/ReservationStatusCard.vue'

import ConfirmLeavePopUp from '@/components/Navigation/PopUp/ConfirmLeavePopUp.vue'
import ChangeCompanyPopUp from '@/components/Navigation/PopUp/ChangeCompanyPopUp.vue'

import BasePopUp from '@/components/PopUp/BasePopUp.vue'
import BaseAccountNotifyPopUp from '@/components/PopUp/BaseAccountNotifyPopUp.vue'
import CheckReservePopUp from '@/components/PopUp/CheckReservePopUp.vue'
import DoubleCheckPopUp from '@/components/PopUp/DoubleCheckPopUp.vue'
import PlainPopUp from '@/components/PopUp/PlainPopUp.vue'
import SearchPopUp from '@/components/PopUp/SearchPopUp.vue'
import RoleChangePopUp from '@/components/PopUp/RoleChangePopUp.vue'
import ContractChangePopUp from '@/components/PopUp/ContractChangePopUp.vue'
import BasePagination from '@/components/Pagination/BasePagination.vue'
import BaseTable from '@/components/Table/BaseTable.vue'
import DateTimeRangePicker from '@/components/DateTimeRange/DateTimeRangePicker.vue'

export default function registerGlobalComponents(app) {
  app.component('BaseButton', BaseButton)
  app.component('AddReservationButton', AddReservationButton)
  app.component('BorderTab', BorderTab)
  app.component('FillTab', FillTab)
  app.component('BaseInput', BaseInput)
  app.component('PhoneInput', PhoneInput)
  app.component('SearchInput', SearchInput)
  app.component('CheckBox', CheckBox)
  app.component('RadioBox', RadioBox)
  app.component('SwitchBox', SwitchBox)
  app.component('TodayButton', TodayButton)
  app.component('ButtonDatePicker', ButtonDatePicker)
  app.component('InputDatePicker', InputDatePicker)
  app.component('RangePicker', RangePicker)
  app.component('DatePickerMonth', DatePickerMonth)
  app.component('DropdownMenu', DropdownMenu)
  app.component('TagReservationStatus', TagReservationStatus)
  app.component('TagRoleStatus', TagRoleStatus)
  app.component('ReservationStatusCard', ReservationStatusCard)
  app.component('ConfirmLeavePopUp', ConfirmLeavePopUp)
  app.component('ChangeCompanyPopUp', ChangeCompanyPopUp)
  app.component('BasePopUp', BasePopUp)
  app.component('BaseAccountNotifyPopUp', BaseAccountNotifyPopUp)
  app.component('CheckReservePopUp', CheckReservePopUp)
  app.component('DoubleCheckPopUp', DoubleCheckPopUp)
  app.component('PlainPopUp', PlainPopUp)
  app.component('SearchPopUp', SearchPopUp)
  app.component('RoleChangePopUp', RoleChangePopUp)
  app.component('ContractChangePopUp', ContractChangePopUp)
  app.component('BasePagination', BasePagination)
  app.component('BaseTable', BaseTable)
  app.component('DateTimeRangePicker', DateTimeRangePicker)
}
