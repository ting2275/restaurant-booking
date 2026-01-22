<template>
  <div>
    <BaseInput
      v-for='(input, index) in nameInput'
      :key='index'
      v-model='input.model'
      :label='input.label'
      :type='input.type'
      :placeholder='input.placeholder'
      :locked='input.locked'
      :required='input.required'
      :is-view-only='isViewOnly'
      :error-message='input.errorMessage'
    />
    <div class='composible-box'>
      <BaseInput
        v-for='(input, index) in postalCodeInput'
        :key='index'
        v-model='input.model'
        :label='input.label'
        :type='input.type'
        :placeholder='input.placeholder'
        :locked='input.locked'
        :required='input.required'
        :is-view-only='isViewOnly'
        :error-message='input.errorMessage'
      />
      <div class='input-group'>
        <DropdownMenu
          v-model='selectedCity'
          :options='cities'
          label-key='label'
          value-key='value'
          label='縣市'
          :is-view-only='isViewOnly'
          :required='true'
        />
      </div>
      <div class='input-group'>
        <DropdownMenu
          v-model='selectedDistrict'
          :options='districts'
          label-key='label'
          value-key='value'
          label='鄉鎮市區'
          :is-view-only='isViewOnly'
          :required='true'
        />
      </div>
    </div>
    <div v-for='(config, index) in inputConfigs' :key='index'>
      <component
        :is='BaseInput'
        v-if='config.model'
        v-model='inputValues[config.model]'
        v-bind='{
          label: config.label,
          type: config.type,
          placeholder: config.placeholder,
          locked: config.locked,
          required: config.required,
          isViewOnly: isViewOnly
        }'
      />
      <div v-else>
        <component :is='config.render' />
      </div>
    </div>

    <div class='button-box'>
      <BaseButton variant='check' size='md' :is-view-only='isViewOnly' @on-click='handleSave'>儲存</BaseButton>
    </div>

  </div>

  <BasePopUp v-model='showSuccessPopup' :esc-button='false'>
    <template #title>儲存成功</template>
    <template #content>資料已儲存完成</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showSuccessPopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>

  <BasePopUp v-model='showFailurePopup' :esc-button='false'>
    <template #title>儲存失敗</template>
    <template #content>{{ errorMessage }}</template>
    <template #button>
      <BaseButton variant='check' size='md' @on-click='showFailurePopup = false'
      >我知道了</BaseButton
      >
    </template>
  </BasePopUp>
</template>

<script setup>
import { ref, onMounted, watch, inject, reactive, defineComponent, h } from 'vue';
import { useTaiwanZipCode } from '@/composables/useTaiwanZipCode';
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { getTaxData, updateTaxData} from '@/services/api/billing';
import { useUserStore } from '@/stores/userStore';
import { useAccountStore } from '@/stores/accountStore';

const accountStore = useAccountStore();
const scrollToTop = inject('scrollToTop');
const userStore = useUserStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = ref(8);

watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS.value;
  },
  { immediate: true }
);

// 彈窗
const showSuccessPopup = ref(false);
const showFailurePopup = ref(false);
const errorMessage = ref("保存政策失敗，請稍後再試");

const nameInput = ref([
  {
    model: 'name',
    label: '姓名',
    placeholder: '請輸入姓名',
    locked: false,
    required: false
  }
]);

import BaseInput from '@/components/Input/BaseInput/BaseInput.vue';
const inputValues = reactive({
  address: '',
  email: '',
  companyName: '',
  taxId: ''
});

const inputConfigs = [
  {
    model: 'address',
    label: '地址',
    type: 'text',
    placeholder: '請輸入地址',
    locked: false,
    required: true
  },
  {
    model: 'email',
    label: '電子郵件帳號',
    type: 'text',
    placeholder: '請輸入電子郵件帳號',
    locked: false,
    required: true
  },
  {
    render: defineComponent({
      setup() {
        const selectedTaxType = ref('');
        return {
          selectedTaxType
        };
      },
      render() {
        return h('div', { class: 'tax-box' }, [
          h('p', { class: 'tax-label' }, '發票種類'),
          h('p', { class: 'tax-value' }, '電子發票')
        ]);
      }
    })
  },
  {
    model: 'companyName',
    label: '公司抬頭',
    type: 'text',
    placeholder: '請輸入公司抬頭',
    locked: false,
    required: true
  },
  {
    model: 'taxId',
    label: '統一編號',
    type: 'text',
    placeholder: '請輸入統一編號',
    locked: false,
    required: true
  }
];

// 地址區域
const { fetchZipCodeData, fetchCitiesAndDistricts } = useTaiwanZipCode();
const selectedCity = ref('');
const selectedDistrict = ref('');
const cities = ref([]);
const districts = ref([]);
const postalCodeInput = ref([
  {
    model: '',
    label: '郵遞區號',
    type: 'text',
    placeholder: '請輸入郵遞區號',
    locked: false,
    required: true,
    userModified: false
  }
]);

// const selectedAddress = ref('')
// const selectedEmail = ref('')
const selectedTaxType = ref('')
// const selectedCompanyName = ref('')
// const selectedTaxId = ref('')

// 獲取電子發票資訊
const fetchInvoiceData = async () => {
  try {
    const response = await getTaxData(userStore.merchantId);
    const data = response.data;
    if (response.success === true) {
      nameInput.value[0].model = data.billingContactName;
      inputValues.address = data.BuyerAddress;
      inputValues.email = data.BuyerEmailAddress;
      inputValues.companyName = data.BuyerName;
      inputValues.taxId = data.BuyerIdentifier;
      selectedTaxType.value = data.CarrierType;
      postalCodeInput.value[0].model = data.postCode;
      selectedCity.value = data.city;
      selectedDistrict.value = data.area;
      await updateCities();
      await updateDistricts();
      await updatePostalCode();
      postalCodeInput.value[0].model = data.postCode;
      postalCodeInput.value[0].userModified = false;
    } else {
      console.log('沒有發票訊息');
    }
  } catch (error) {
    console.error('獲取發票訊息失敗:', error);
  }
};

const updateCities = async () => {
  const response = await fetchCitiesAndDistricts();
  const cityData = response.data;
  if (Array.isArray(cityData)) {
    const uniqueCities = new Map();
    cityData.forEach(item => {
      if (!uniqueCities.has(item.city)) {
        uniqueCities.set(item.city, { label: item.city, value: item.city });
      }
    });
    cities.value = Array.from(uniqueCities.values());
  } else {
    console.error('City data is not an array:', cityData);
  }
};

const updateDistricts = async () => {
  const response = await fetchZipCodeData(selectedCity.value, '');
  const districtData = response.data;
  if (Array.isArray(districtData)) {
    districts.value = districtData
      .filter(item => item.city === selectedCity.value)
      .map(item => ({ label: item.district, value: item.district }));
  } else {
    console.error('District data is not an array:', districtData);
  }
};

// 監聽郵遞區號3碼以上用戶編輯狀態
watch(() => postalCodeInput.value[0].model, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    postalCodeInput.value[0].userModified = true;
  }
});

const updatePostalCode = async () => {
  if (isInitializing.value || postalCodeInput.value[0].userModified) {
    return;
  }
  const response = await fetchZipCodeData(selectedCity.value, selectedDistrict.value);
  const postalData = response.data;
  if (postalData && postalData.length > 0) {
    postalCodeInput.value[0].model = postalData[0].zip_code;
  }
};

watch(selectedCity, async () => {
  await updateDistricts();
  if (selectedDistrict.value) {
    postalCodeInput.value[0].userModified = false;
    await updatePostalCode();
  }
});

watch(selectedDistrict, async () => {
  if (selectedDistrict.value) {
    postalCodeInput.value[0].userModified = false;
    await updatePostalCode();
  }
});

const handleSave = async () => {
  if (!nameInput.value[0].model.trim() ||
      !inputValues.address.trim() ||
      !inputValues.email.trim() ||
      !inputValues.companyName.trim() ||
      !inputValues.taxId.trim() ||
      !postalCodeInput.value[0].model.trim() ||
      !selectedCity.value.trim() ||
      !selectedDistrict.value.trim()) {
    errorMessage.value = "請完整填寫所有必填項目。";
    showFailurePopup.value = true;
    return;
  }

  const taxData = {
    billingContactName: nameInput.value[0].model,
    BuyerAddress: inputValues.address,
    BuyerEmailAddress: inputValues.email,
    CarrierType: selectedTaxType.value,
    BuyerName: inputValues.companyName,
    BuyerIdentifier: inputValues.taxId,
    postCode: postalCodeInput.value[0].model,
    city: selectedCity.value,
    area: selectedDistrict.value
  };

  try {
    const response = await updateTaxData(userStore.merchantId, taxData);
    if (response.success === true) {
      showSuccessPopup.value = true;
      scrollToTop();
      await fetchInvoiceData();
    } else {
      console.error('保存失败:', response.message);
      errorMessage.value = response.message || "保存失敗，請稍後再試";
      showFailurePopup.value = true;
    }
  } catch (error) {
    console.error('保存失败:', error);
    errorMessage.value = "發生錯誤，請稍後再試";
    showFailurePopup.value = true;
  }
};

// 預防初始化時，郵遞區號重複更新
const isInitializing = ref(true);

onMounted(async () => {
  await fetchInvoiceData();
  isInitializing.value = false;
});

const reloadFunction = async () => {
  fetchInvoiceData();
};
useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/popup/_popup-booking.scss' as *;
@use '@/assets/scss/pages/booking/_add_edit.scss' as *;
@use '@/assets/scss/pages/billingArea/invoiceInfo.scss' as *;
</style>