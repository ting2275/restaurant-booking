<template>
  <div class='main-box' :class='backgroundClass'>
    <div class='background-box'>
      <div class='table-management'>
        <!-- 返回按鈕和標題 -->
        <div class='area-name-box'>
          <button class='back-button' @click='handleBack'>
            <img src='@/assets/images/icons/back-arrow.svg' alt='返回'>
          </button>
          <span class='area-name'>{{ areaName }}</span>
        </div>
        <div class='add-new-table-box'>
          <button :disabled='isViewOnly' :class='{"disabled-btn": isViewOnly }' @click='handleAddTable'>新增桌子</button>
        </div>
        <div class='edit-buttons-box'>
          <button :class='{ notActive: !editMode }' @click='cancelEdit'>取消</button>
          <button :class='{ active: editMode, "edit-view-only": isViewOnly }' @click='handleEdit'>編輯</button>
        </div>
        <!-- 桌子列表 -->
        <div class='table-list' :class="{ 'editMode': editMode }">
          <div class='table-header' :class="{ 'editMode': editMode }">
            <div v-for='header in tableHeaders' :key='header.key' :class='`table-${header.key}`'>{{ header.label }}</div>
          </div>
          <!-- 表格內容 -->
          <div ref='tableBodyRef' class='table-body'>
            <draggable v-model='tables' item-key='tableId' :disabled='!editMode' handle='.drag-handle' class='toBottom' @change='handleDataChange'>
              <template #item='{ element }'>
                <div>
                  <TableModeEdit
                    v-show='editMode'
                    v-bind='getTableModeEditProps(element)'
                  />
                  <TableModeView v-show='!editMode' :table='element'/>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        <div v-show='editMode' class='save-button-container'>
          <BaseButton
            v-for='(button, index) in buttons'
            :key='index' :variant='button.variant' :size='button.size' :is-view-only='isViewOnly'
            :disabled='hasEmptyTableName' @on-click='handleSaveClick'>{{ button.label }}</BaseButton>
        </div>
      </div>

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
  </div>
</template>

<script setup>
import { ref, provide, onMounted, computed, nextTick } from 'vue';
import { useTokenWatcher } from '@/composables/useTokenWatcher';
import draggable from 'vuedraggable';
import { useTitle } from '@vueuse/core';
import { useTheme } from '@/stores/themeStore';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { useSystemStore } from '@/stores/systemStore';
import { getTableNameList, updateTableInfo, addTableNames, deleteTable, getTotalTableQuantity, checkTableBooked } from '@/services/api/shop';
import { useAccountStore } from '@/stores/accountStore';

import { useCheckTableName } from '@/composables/modules/businessSetting/useCheckTableName'
import { useCheckEditTableName } from '@/composables/modules/businessSetting/useCheckEditTableName'
import AddTableManager from '@businessSettings/Tables/TableManagement/AddTableManager.vue';
import TableModeEdit from '@businessSettings/Tables/TableManagement/TableModeEdit.vue';
import TableModeView from '@businessSettings/Tables/TableManagement/TableModeView.vue';

// 路由相關
const router = useRouter();
const route = useRoute();
const areaName = ref(route.params.areaName);

// 頁面設置
const title = useTitle();
title.value = '店家營業設定-桌型設定';
const themeStore = useTheme();
const backgroundClass = computed(() => themeStore.backgroundClass);
themeStore.setBackgroundClass('bg-gray');
const systemStore = useSystemStore();

import { usePopup } from '@/composables/usePopup';
import { useNotification } from '@/composables/notification';
// 彈窗
const {
  basePopup,
  doubleCheckPopup,
  showBasePopup,
  showDoubleCheckPopup,
  handleBasePopupConfirm,
  handleDoubleCheckConfirm,
  handleDoubleCheckCancel
} = usePopup();
const { toggleServicePopup } = useNotification();

// TableModeEdit 的 props
const getTableModeEditProps = (element) => ({
  ref: (el) => setChildRef(el, element.tableId),
  table: element,
  partySizeOptions,
  isDuplicate: element.isDuplicate,
  onDataChange: handleDataChange,
  onDelete: handleDeleteTable,
  onMounted: onTableEditMounted,
  onScrollToBottom: () => handleScrollToBottom(element.tableId),
});

// 滾動下拉選單功能
const tableBodyRef = ref(null);
const childRefs = ref({});

const setChildRef = (el, tableId) => {
  if (el) childRefs.value[tableId] = el;
  else delete childRefs.value[tableId];
};

const mountedTableIds = ref(new Set());

const onTableEditMounted = (tableId) => {
  mountedTableIds.value.add(tableId);
  handleScrollToBottom(tableId);
};

const handleScrollToBottom = (tableId) => {
  setTimeout(() => {
    const tableModeEditInstance = childRefs.value[tableId];
    const dom = tableModeEditInstance.rowRef;
    const container = tableBodyRef.value;
    if (dom && container) {
      const elTop = dom.offsetTop;
      const elBottom = elTop + dom.offsetHeight;
      const viewTop = container.scrollTop;
      const viewBottom = viewTop + container.clientHeight;
      if (elBottom > viewBottom) {
        container.scrollTop = elBottom - container.clientHeight - 70;
      }
    }
  });
};

const handleContactService = () => {
  toggleServicePopup();
  showEditTableInfoPopup.value = false;
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
};

const tables = ref([]);
const originalTables = ref([]);
const showEditTableInfoPopup = ref(false);
const isQuantityEmpty = computed(() => tableData.value.tableQuantity === '');

const tableHeaders = computed(() => {
  if (editMode.value) {
    return [
      { key: 'sort', label: '排序' },
      { key: 'number', label: '桌號' },
      { key: 'type', label: '桌型' },
      { key: 'status', label: '線上預訂' },
      { key: 'actions', label: '刪除' }
    ];
  } else {
    return [
      { key: 'number', label: '桌號' },
      { key: 'type', label: '桌型' },
      { key: 'status', label: '線上預訂' }
    ];
  }
});

const tableData = ref({
  tableName: '',
  partySize: 1,
  isOnlineBooking: '1',
  tableQuantity: ''
});

// 定義座位數選項
const partySizeOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}人桌`,
  value: i + 1
}));

// 編輯狀態管理
const isEditing = ref(false);
provide('isEditing', isEditing);
const editMode = ref(false);
const accountStore = useAccountStore();

const fetchTables = async () => {
  try {
    const areaId = route.params.areaId;
    const response = await getTableNameList(areaId);
    if (response.success) {
      tables.value = response.data.map(table => ({
        tableId: table.tableId,
        tableName: table.tableName,
        partySize: table.partySize,
        isOnlineBooking: table.isOnlineBooking,
        tableOrder: table.tableOrder,
        isDuplicate: false
      }));
    }
  } catch (error) {
    console.error('獲取桌子列表失敗:', error);
  }
};

const handleBack = () => {
  if (isEditing.value) {
    showDoubleCheckPopup({
      title: '尚有資料未儲存',
      content: '目前編輯資料未儲存，離開後資料不保留',
      confirmText: '是',
      cancelText: '否',
      onConfirm: () => {
        confirmCancelEdit();
        router.push({ name: 'BusinessSettings' });
      }
    });
    return;
  }
  router.push({ name: 'BusinessSettings' });
};

onBeforeRouteLeave((to, from, next) => {
  if (isEditing.value) {
    showDoubleCheckPopup({
      title: '資料尚未儲存',
      content: '確定要離開此頁面？',
      confirmText: '確定',
      cancelText: '取消',
      onConfirm: () => {
        confirmCancelEdit();
        next();
      },
      onCancel: () => next(false)
    });
  } else {
    next();
  }
});

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
  if (tableData.value.tableQuantity > 1) {
    tableData.value.tableQuantity--;
  } else if (tableData.value.tableQuantity === 1) {
    tableData.value.tableQuantity = '';
  }
};

const increaseTableQuantity = () => {
  let value = Number(tableData.value.tableQuantity) || 0;
  tableData.value.tableQuantity = value + 1;
};

const handleAddTable = () => {
  if (isEditing.value) {
    showDoubleCheckPopup({
      title: '尚有資料未儲存',
      content: '目前編輯資料未儲存，新增桌子會清除現有編輯，確定要繼續嗎？',
      confirmText: '是',
      cancelText: '否',
      onConfirm: () => confirmCancelEdit(() => {
        resetFormData();
        showEditTableInfoPopup.value = true;
      }),
      onCancel: cancelCancelEdit
    });
  } else {
    editMode.value = false;
    isEditing.value = false;
    systemStore.setSystemIsEditing(false);
    resetFormData();
    showEditTableInfoPopup.value = true;
  }
};

const handleClosePopup = () => {
    showEditTableInfoPopup.value = false;
    duplicateIndexes.value = [];
    resetFormData();
};

const AddTableStep = ref(1);
const newTablesData = ref([]);

// 前端即時輸入時，哪些桌名有重複
const duplicateIndexes = ref([]);

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

// 批次命名桌子
const batchNamingTables = async (partySize, tableQuantity) => {
  try {
    if (!partySize || !tableQuantity) {
      showBasePopup({
        title: '儲存失敗',
        content: '請填寫完整的桌子資訊',
      });
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
    const maxTableOrder = tables.value.length > 0
      ? Math.max(...tables.value.map(table => Number(table.tableOrder)))
      : 0;
    newTablesData.value = Array(quantity).fill(null).map((_, index) => ({
      areaId: Number(route.params.areaId),
      partySize: Number(tableData.value.partySize),
      isOnlineBooking: tableData.value.isOnlineBooking,
      tableOrder: maxTableOrder + index + 1,
      tableName: ''
    }));
    return true;
  } catch (error) {
    showBasePopup({
      title: '儲存失敗',
      content: '批次命名桌子失敗',
    });
    return false;
  }
};

// {{ 新增桌子 }}
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
    // === 完整的重複檢查（包含前端和後端） ===
    const duplicateCheck = await checkTableNames(newTablesData.value);

    // 如果有重複（前端或後端）
    if (duplicateCheck.isDuplicate) {
      // 設置重複的索引
      const duplicateNames = duplicateCheck.duplicateNames || [];
      duplicateIndexes.value = getDuplicateIndexes(newTablesData.value, duplicateNames);

      // 顯示錯誤信息
      showBasePopup(duplicateCheck.error);
      return;
    }

    // === 送出資料 ===
    const response = await addTableNames(newTablesData.value);
    if (!response.success) {
      if (response.isLimitExceeded) {
        showEditTableInfoPopup.value = false;
        showBasePopup({
          title: '桌數已達上限',
          content: '最多可新增100張桌數，<br>如欲新增更多桌型請洽詢業務專員',
        });
        return;
      }
      throw new Error('批次新增桌子失敗');
    }

    // === 成功清空 ===
    duplicateIndexes.value = [];
    showEditTableInfoPopup.value = false;
    showBasePopup({
      title: '儲存成功',
      content: '資料已儲存完成',
    });
    resetFormData();
    await fetchTables();
  } catch (error) {
    showEditTableInfoPopup.value = false;
    showBasePopup({
      title: '儲存失敗',
      content: '操作失敗',
    });
  }
};

const resetFormData = () => {
  tableData.value = {
    tableName: '',
    partySize: 1,
    isOnlineBooking: '1',
    tableQuantity: 1
  };
  AddTableStep.value = 1;
  newTablesData.value = [];
};

// {{ 編輯狀態功能 }}
const handleEdit = () => {
  originalTables.value = JSON.parse(JSON.stringify(tables.value));
  editMode.value = true;
};

const formatTableData = (table, index) => ({
  tableId: table.tableId,
  tableName: table.tableName,
  tableOrder: index + 1,
  partySize: table.partySize,
  isOnlineBooking: table.isOnlineBooking
});

const handleDataChange = () => {
  if (editMode.value) {
    tables.value = tables.value.map((table, index) => ({
      ...table,
      ...formatTableData(table, index)
    }));
    isEditing.value = true;
    systemStore.setSystemIsEditing(true);
  }
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

const confirmCancelEdit = (callback) => {
  tables.value = JSON.parse(JSON.stringify(originalTables.value));
  isEditing.value = false;
  systemStore.setSystemIsEditing(false);
  doubleCheckPopup.show = false;
  showEditTableInfoPopup.value = false;
  AddTableStep.value = 1;
  newTablesData.value = [];
  editMode.value = false;
  if (callback) callback();
};

const cancelCancelEdit = () => {
  doubleCheckPopup.show = false;
};

// {{ 刪除桌子功能 }}
const deletedTableIds = ref([]);
const tableIdToDelete = ref(null);

const handleDeleteTable = (tableId) => {
  tableIdToDelete.value = tableId;
  showDoubleCheckPopup({
    title: '請確認是否刪除此桌號？',
    content: '刪除後資料不保留',
    confirmText: '是',
    cancelText: '否',
    onConfirm: confirmDeleteTable,
    onCancel: cancelDeleteTable
  });
};

const cancelDeleteTable = () => {
  doubleCheckPopup.show = false;
  tableIdToDelete.value = null;
};

// 處理排序桌子
function reorderTables(tables) {
  return tables.map((table, index) => ({
    ...table,
    tableOrder: index + 1
  }));
}

const confirmDeleteTable = async () => {
  if (tables.value.length === 1) {
    showBasePopup({
      title: '桌數不可為零',
      content: '請確實填寫您的桌型設定',
    })
    doubleCheckPopup.show = false;
    tableIdToDelete.value = null;
    return;
  }
  deletedTableIds.value.push(tableIdToDelete.value);
  tables.value = reorderTables(
    tables.value.filter(table => table.tableId !== tableIdToDelete.value)
  );
  handleDataChange();
  doubleCheckPopup.show = false;
  tableIdToDelete.value = null;
};

const { checkEditTableNames } = useCheckEditTableName();

const handleSaveClick = async () => {
  try {
    for (const table of tables.value) {
      const original = originalTables.value.find(t => t.tableId === table.tableId);
      if (original && table.partySize !== original.partySize) {
        const res = await checkTableBooked(table.tableId, table.partySize);
        if (res.booked > Number(table.partySize)) {
          showBasePopup({
            title: '無法修改桌型',
            content: '<p class="subtitle delete-area-subtitle">桌位總數不足因應目前訂單</p><br><p>桌型修改後將無法應對目前訂單數量，<br>請取消多餘訂單，或於其他區域新增桌位</p>',
          });
          return;
        }
      }
    }

    const duplicateCheck = await checkEditTableNames(tables.value,allTableNames.value,originalTables.value);
    if (duplicateCheck.isDuplicate) {
      const duplicateNames = duplicateCheck.duplicateNames || [];
      tables.value.forEach(table => {
        table.isDuplicate = duplicateNames.includes(table.tableName);
      });
      await nextTick();
      showBasePopup(duplicateCheck.error);
      return;
    }

    for (const id of deletedTableIds.value) {
      const response = await deleteTable(id);
      if (response.status !== 'success') {
        showBasePopup({
          title: '無法刪除桌子',
          content: '<p class="subtitle delete-area-subtitle">桌位總數不足因應目前訂單</p><br><p>桌位刪除後將不足以應對目前訂單數量，請取消多餘訂單，或於其他區域新增桌位</p>'
        });
        return;
      }
    }

    deletedTableIds.value = [];

    tables.value = reorderTables(tables.value);
    const updatedTables = tables.value.map((table, index) => formatTableData(table, index));
    const updatePromises = [updateTableInfo(updatedTables)];
    const results = await Promise.all(updatePromises);
    const hasError = results.some(result => !result.success);
    if (hasError) {
      throw new Error('更新失敗');
    }
    showBasePopup({
      title: '儲存成功',
      content: '資料已儲存完成',
    });
    editMode.value = false;
    isEditing.value = false;
    systemStore.setSystemIsEditing(false);
    await fetchTables();
  } catch (error) {
    console.error('儲存失敗:', error);
    showBasePopup({
      title: '儲存失敗',
      content: '請重新嘗試',
    });
  }
};

const allTableNames = ref([]);

// 是否為檢視模式
const GOOGLE_STATUS = 8;
const isViewOnly = computed(() => accountStore.googleStatus === GOOGLE_STATUS);

onMounted(async () => {
  await fetchTables();
});

const hasEmptyTableName = computed(() => {
  return tables.value.some(table => !table.tableName || !table.tableName.trim());
});

const buttons = computed(() => [{
  variant: "check",
  size: "md",
  label: "儲存"
}]);

const reloadFunction = async () => {
  cancelEdit();
  confirmCancelEdit();
  router.push({ name: 'BusinessSettings' });
};

useTokenWatcher(reloadFunction);

</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/businessSettings/_tableManagement.scss' as *;
</style>