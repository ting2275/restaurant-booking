<template>
  <div class='main-box'>
    <div class='hint-box'>
      <BaseButton variant='secondary' size='sm'>提醒</BaseButton>
      <p>
        請設定欲開放預訂的桌型。考量 Google 審核時間，修改後新設定需<span
        >24 - 48小時</span
        >生效，此前系統將維持前次設定。
      </p>
    </div>
    <!-- 新增區域按鈕 -->
    <div class='add-new-area-box'>
      <button :disabled='isViewOnly' :class="{ 'disabled-btn': isViewOnly }" @click='handleAddArea'>新增區域</button>
    </div>
    <div class='edit-buttons-box'>
      <button :class='{ notActive: !editMode }' @click='cancelEdit'>取消</button>
      <button :class='{ active: editMode,"edit-view-only": isViewOnly }' @click='handleEdit'>編輯</button>
    </div>
    <!-- 區域列表 -->
    <div class='areas-container'>
      <draggable v-model='areas' item-key='areaId' :disabled='!editMode' handle='.drag-handle' @change='handleDataChange'>
        <template #item='{ element, index }'>
          <div class='area-item' :class="{ 'clickable': canClickArea }" @click='!editMode && handleAreaClick(element.areaId)'>
            <AreaModeEdit
              v-show='editMode'
              :area='element'
              :is-duplicate='duplicateAreaIndexes.includes(index)'
              @data-change='handleDataChange' @delete='handleDeleteArea'/>
            <AreaModeView v-show='!editMode' :area='element'/>
          </div>
        </template>
      </draggable>
    </div>
    <!-- 儲存按鈕 -->
    <div v-show='editMode' class='save-button-container'>
      <BaseButton v-for='(button, index) in buttons' :key='index' :variant='button.variant' :size='button.size' :is-view-only='isViewOnly' :disabled='hasEmptyAreaName' @on-click='handleSaveClick'>{{ button.label }}</BaseButton>
    </div>
    <!-- 新增區域彈窗 -->
    <AddAreaManager
      v-model='showAddAreaPopup'
      :area-name='areaName'
      @close='handleCloseAddArea'
      @confirm='handleConfirmAddArea'
    />
    <!-- 新增桌子彈窗 -->
    <AddTableManager
      v-model='showEditTableInfoPopup'
      :step='AddTableStep'
      :table-data='tableData'
      :new-tables-data='newTablesData'
      :duplicate-indexes='duplicateIndexes'
      :party-size-options='partySizeOptions'
      :is-quantity-empty='isQuantityEmpty'
      @close='handleClosePopup'
      @update:model-value='handleClosePopup'
      @next-step='handleNextStep'
      @previous-step='goToPreviousStep'
      @confirm='confirmUpdateTableInfo'
      @handle-table-quantity-input='handleTableQuantityInput'
      @decrease-table-quantity='decreaseTableQuantity'
      @increase-table-quantity='increaseTableQuantity'
    />
    <!-- 單一按鈕彈窗 -->
    <BasePopUp v-model='basePopup.show' teleport-to='#popup-layer-2' :esc-button='true'>
      <template #title>{{ basePopup.title }}</template>
      <template #content>
        <div v-html='basePopup.content'></div>
      </template>
      <template #button>
        <BaseButton variant='check' size='md' @on-click='handleBasePopupConfirm'>
          {{ basePopup.buttonText }}
        </BaseButton>
      </template>
    </BasePopUp>
    <!-- 雙按鈕彈窗 -->
    <DoubleCheckPopUp v-model='doubleCheckPopup.show' teleport-to='#popup-layer-2' :esc-button='true'>
      <template #title>{{ doubleCheckPopup.title }}</template>
      <template #content>
        <div v-html='doubleCheckPopup.content'></div>
      </template>
      <template #buttons>
        <BaseButton variant='cancel' size='sm' @on-click='handleDoubleCheckCancel'>
          {{ doubleCheckPopup.cancelText }}
        </BaseButton>
        <BaseButton variant='check' size='sm' @on-click='handleDoubleCheckConfirm'>
          {{ doubleCheckPopup.confirmText }}
        </BaseButton>
      </template>
    </DoubleCheckPopUp>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from "vue";
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable'
import { useTitle } from "@vueuse/core"
import { useTokenWatcher } from "@/composables/useTokenWatcher";
import { useSystemStore } from '@/stores/systemStore';
import { usePopup } from '@/composables/usePopup';
import { useNotification } from '@/composables/notification';
import { useCheckTableName } from '@/composables/modules/businessSetting/useCheckTableName';
import { useAccountStore } from '@/stores/accountStore';
import { addArea, getAreaList, addTableNames, updateAreaData, deleteArea, getTotalTableQuantity } from "@/services/api/shop";
import AddTableManager from '@businessSettings/Tables/TableManagement/AddTableManager.vue'
import AreaModeView from '@businessSettings/Tables/AreaModeView.vue'
import AreaModeEdit from '@businessSettings/Tables/AreaModeEdit.vue'
import AddAreaManager from '@businessSettings/Tables/AddAreaManager.vue'

const router = useRouter();
const accountStore = useAccountStore();

const systemStore = useSystemStore();
const title = useTitle();
title.value = "店家營業設定-桌型設定";
const isEditing = inject('isEditing');
const editMode = ref(false);

//彈窗
const {basePopup,doubleCheckPopup,showBasePopup,showDoubleCheckPopup,handleBasePopupConfirm,handleDoubleCheckConfirm,handleDoubleCheckCancel} = usePopup();
const { toggleServicePopup } = useNotification();

const showAddAreaPopup = ref(false);
const showEditTableInfoPopup = ref(false);
const originalAreas = ref([]);
const isQuantityEmpty = computed(() => tableData.value.tableQuantity === '');

// 聯絡服務專員
const handleContactService = () => {
  toggleServicePopup();
  showEditTableInfoPopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
};

const partySizeOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}人桌`,
  value: i + 1
}));

const confirmCancelEdit = (callback) => {
  areas.value = JSON.parse(JSON.stringify(originalAreas.value));
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  showDoubleCheckPopup.value = false;
  editMode.value = false;
  if (callback) callback();
};
const cancelCancelEdit = () => {
  doubleCheckPopup.show = false;
};

const handleDataChange = () => {
  if (editMode.value) {
    areas.value = areas.value.map((area, index) => ({
      ...area,
      areaOrder: index + 1
    }));
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
  }
};

// {{新增區域功能}}
const areas = ref([]);
const areaName = ref('');
const areaData = ref({
  areaName: '',
  areaOrder: 0
});
const tableData = ref({
  tableName: '',
  partySize: 1,
  isOnlineBooking: '1',
  tableQuantity: 1
});

const fetchAreas = async () => {
  try {
    const response = await getAreaList();
    areas.value = response.area;
  } catch (error) {
    showBasePopup({title: '獲取區域資料失敗',content: '請重新嘗試'});
  }
};

const handleAddArea = () => {
  if (isEditing.value) {
    showDoubleCheckPopup({
      title: '尚有資料未儲存',
      content: '目前編輯資料未儲存，新增區域會清除現有編輯，確定要繼續嗎？',
      confirmText: '是',
      cancelText: '否',
      onConfirm: () => confirmCancelEdit(() => {
        resetFormData();
        showAddAreaPopup.value = true;
      }),
      onCancel: cancelCancelEdit
    });
  } else {
    editMode.value = false;
    isEditing.value = false;
    systemStore.setSystemIsEditing(false);
    resetFormData();
    showAddAreaPopup.value = true;
  }
};

const handleCloseAddArea = () => {
  showAddAreaPopup.value = false;
  areaName.value = '';
};

const duplicateAreaIndexes = computed(() => {
  const nameCount = {};
  const result = [];
  areas.value.forEach((item) => {
    const name = item.areaName.trim();
    if (!name) return;
    nameCount[name] = (nameCount[name] || 0) + 1;
  });
  areas.value.forEach((item, idx) => {
    const name = item.areaName.trim();
    if (name && nameCount[name] > 1) {
      result.push(idx);
    }
  });
  return result;
});

const handleConfirmAddArea = (name) => {
  const newAreaName = name.trim();
  const allAreaNames = areas.value.map(a => a.areaName.trim());
  if (allAreaNames.includes(newAreaName)) {
    showBasePopup({title: '區域名稱重複',content: '此區域名稱已存在，請重新命名'});
    return;
  }
  const maxOrder = areas.value.length > 0
  ? Math.max(...areas.value.map(area => area.areaOrder)): 0;
  const newArea = {
    areaName: newAreaName,
    areaOrder: maxOrder + 1,
  };
  areaData.value = newArea;
  tableData.value = {
    partySize: 1,
    isOnlineBooking: '1',
    tableQuantity: 1
  };
  showAddAreaPopup.value = false;
  showEditTableInfoPopup.value = true;
};

const handleTableQuantityInput = (e) => {
  const rawValue = e.target.value;
  if (rawValue === '') {
    tableData.value.tableQuantity = '';
    return;
  }
  let value = Number(rawValue);
  if (value < 1) {
    tableData.value.tableQuantity = 1;
  } else {
    tableData.value.tableQuantity = value;
  }
};

const decreaseTableQuantity = () => {
  let value = Number(tableData.value.tableQuantity) || 0;
  if (value > 1) {
    tableData.value.tableQuantity = value - 1;
  } else if (value === 1) {
    tableData.value.tableQuantity = '';
  }
};

const increaseTableQuantity = () => {
  let value = Number(tableData.value.tableQuantity) || 0;
  tableData.value.tableQuantity = value + 1;
};

const { checkTableNames } = useCheckTableName();

const getDuplicateIndexes = (tables, duplicateNames) => {
  return tables.reduce((indexes, table, idx) => {
    const tableName = String(table.tableName).trim();
    if (duplicateNames.includes(tableName)) {
      indexes.push(idx);
    }
    return indexes;
  }, []);
};

const confirmUpdateTableInfo = async () => {
  try {
    const duplicateCheck = await checkTableNames(newTablesData.value);
    if (duplicateCheck.isDuplicate) {
      const duplicateNames = duplicateCheck.duplicateNames || [];
      duplicateIndexes.value = getDuplicateIndexes(newTablesData.value, duplicateNames);

      showBasePopup(duplicateCheck.error);
      return;
    }
    let areaResponse;
    try {
      areaResponse = await addArea({
        areaName: areaData.value.areaName,
        areaOrder: areaData.value.areaOrder,
        tablesQuantity: newTablesData.value.length
      });
      if (!areaResponse.success || !areaResponse.data?.areaId) {
        throw new Error('新增區域失敗：無法獲取區域ID');
      }
      const tablesWithAreaId = newTablesData.value.map(table => ({
        ...table,
        areaId: areaResponse.data.areaId
      }));
      const response = await addTableNames(tablesWithAreaId);
      if (!response.success) {
        if (areaResponse.data.areaId) {
          await deleteArea(areaResponse.data.areaId);
        }
        throw new Error('批次新增桌子失敗');
      }
      showEditTableInfoPopup.value = false;
      showBasePopup({title: '儲存成功',content: '資料已儲存完成'});
      resetFormData();
      await fetchAreas();
      duplicateIndexes.value = [];
    } catch (error) {
      if (areaResponse?.data?.areaId) {
        try {
          await deleteArea(areaResponse.data.areaId);
        } catch (deleteError) {
          showBasePopup({title: '儲存失敗',content: '請重新嘗試'});
        }
      }
      throw error;
    }
  } catch (error) {
    showEditTableInfoPopup.value = false;
    showBasePopup({title: '儲存失敗',content: '請重新嘗試'});
  }
};

const resetFormData = () => {
  areaName.value = '';
  tableData.value = {
    tableName: '',
    partySize: 1,
    isOnlineBooking: '1',
    tableQuantity: ''
  };
  AddTableStep.value = 1;
  newTablesData.value = [];
};

const handleClosePopup = () => {
  showAddAreaPopup.value = false;
  showEditTableInfoPopup.value = false;
  duplicateIndexes.value = [];
  resetFormData();
};

const goToPreviousStep = () => {
  duplicateIndexes.value = [];
  AddTableStep.value = 1;
};
const handleNextStep = async () => {
  const success = await batchNamingTables(tableData.value.partySize, tableData.value.tableQuantity);
  if (success) {
    AddTableStep.value = 2;
  }
};

const AddTableStep = ref(1);
const newTablesData = ref([]);
const duplicateIndexes = ref([]);

const batchNamingTables = async (partySize, tableQuantity) => {
  try{
    if (!partySize || !tableQuantity) {
      showBasePopup({title: '儲存失敗',content: '請填寫完整的桌子資訊'});
      return false;
    }
    const totalQuantity = Number(await getTotalTableQuantity());
    const wantToAdd = Number(tableQuantity);
    if (totalQuantity + wantToAdd > 100) {
      showBasePopup({
        title: '桌數已達上限',
        content: '最多可新增100張桌數，<br>如欲新增更多桌型請洽詢業務專員',
        buttonText: '聯繫服務專員',
        onConfirm: handleContactService
      });
      return false;
    }
    const quantity = Number(tableQuantity);
    newTablesData.value = Array(quantity).fill(null).map((_, index) => ({
      partySize: tableData.value.partySize,
      isOnlineBooking: tableData.value.isOnlineBooking,
      tableOrder: index + 1,
      tableQuantity: tableData.value.tableQuantity,
      tableName: ''
    }));
    return true;
  } catch (error) {
    showBasePopup({title: '儲存失敗',content: '請重新嘗試'});
    return false;
  }
};

const hasDuplicateAreaName = (areas) => {
  const names = areas.map(a => a.areaName.trim());
  return names.length !== new Set(names).size;
};

const handleSaveClick = async () => {
  try {
    if (hasDuplicateAreaName(areas.value)) {
      showBasePopup({title: '區域不可重複', content: '請修改重複的區域名稱'});
      return;
    }
    for (const id of deletedAreaIds.value) {
      const response = await deleteArea(id);
      if (response.status !== 'success') {
        showBasePopup({
          title: '無法刪除區域',
          content: '<p class="subtitle delete-area-subtitle">桌位總數不足因應目前訂單</p><br><p>桌位刪除後將不足以應對目前訂單數量，請取消多餘訂單，或於其他區域新增桌位</p>'
        });
        return;
      }
    }
    deletedAreaIds.value = [];

    const updatedAreas = areas.value.map((area, index) => ({
      areaId: area.areaId,
      areaName: area.areaName,
      areaOrder: index + 1
    }));

    const response = await updateAreaData(updatedAreas);
    if (!response.success) {
      throw new Error('更新失敗');
    }

    showBasePopup({title: '儲存成功', content: '資料已儲存完成'});
    editMode.value = false;
    isEditing.value = false;
    systemStore.setSystemIsEditing(false);
    await fetchAreas();
  } catch (error) {
    showBasePopup({title: '儲存失敗', content: '請重新嘗試'});
  }
};

const canClickArea = computed(() => {
  return !isEditing.value;
});

const handleAreaClick = (areaId) => {
  if (!canClickArea.value) {
    return;
  }
  const currentArea = areas.value.find(area => area.areaId === areaId);
  router.push({
    name: 'TableManagement',
    params: {
      areaId: areaId,
      areaName: currentArea.areaName
    }
  });
};

const GOOGLE_STATUS = 8;
const isViewOnly = computed(() => accountStore.googleStatus === GOOGLE_STATUS);

onMounted(() => {
  fetchAreas();
});

const hasEmptyAreaName = computed(() => {
  return areas.value.some(area => !area.areaName.trim());
});

const buttons = computed(() => [{
  variant: "check",
  size: "md",
  label: "儲存"
}]);

const reloadFunction = () => {
  fetchAreas();
  confirmCancelEdit();
};

const handleEdit = () => {
  originalAreas.value = JSON.parse(JSON.stringify(areas.value));
  editMode.value = true;

};

const cancelEdit = () => {
  if (isEditing.value) {
    showDoubleCheckPopup({
      title: '確定要取消？',
      content: '資料尚未儲存，取消後資料不保留',
      confirmText: '是',
      cancelText: '否',
      onConfirm: confirmCancelEdit,
      onCancel: cancelCancelEdit
    });
  } else {
    editMode.value = false;
    isEditing.value = false;
    systemStore.setSystemIsEditing(false);
  }
};

// {{ 刪除區域 }}
const deletedAreaIds = ref([]);
const areaIdToDelete = ref(null);

const handleDeleteArea = (areaId) => {
  areaIdToDelete.value = areaId;
  showDoubleCheckPopup({
    title: '請確認是否刪除此區域?',
    content: '刪除區域時，區域內桌子也將一併刪除，請確認是否刪除區域',
    confirmText: '是',
    cancelText: '否',
    onConfirm: confirmDeleteArea,
    onCancel: cancelDeleteArea
  });
};

const cancelDeleteArea = () => {
  doubleCheckPopup.show = false;
  areaIdToDelete.value = null;
};

const confirmDeleteArea = () => {
  if (areas.value.length === 1) {
    showBasePopup({
      title: '無法刪除區域',
      content: '至少需保留一個區域，請勿全部刪除。'
    });
    doubleCheckPopup.show = false;
    areaIdToDelete.value = null;
    return;
  }
  deletedAreaIds.value.push(areaIdToDelete.value);
  areas.value = areas.value.filter(area => area.areaId !== areaIdToDelete.value);
  areas.value = areas.value.map((area, idx) => ({
    ...area,
    areaOrder: idx + 1
  }));
  handleDataChange();
  doubleCheckPopup.show = false;
  areaIdToDelete.value = null;
};

useTokenWatcher(reloadFunction);
</script>

<style lang="scss" scoped>
@import '@/assets/scss/pages/businessSettings/_common.scss';
</style>
