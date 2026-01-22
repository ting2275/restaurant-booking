import { checkDuplicateName } from '@/services/api/shop'

export const useCheckEditTableName = () => {
  const hasDuplicateInInput = tables => {
    const names = tables.map(t => t.tableName.trim())
    return names.length !== new Set(names).size
  }

  // 前端檢查（全店唯一）
  const hasDuplicateInAll = (tables, allTableNames) => {
    const editingNames = tables.map(t => t.tableName.trim())
    const otherTableNames = allTableNames.filter(name => !tables.some(t => t.tableName.trim() === name))
    const totalNames = otherTableNames.concat(editingNames)
    return totalNames.length !== new Set(totalNames).size
  }

  // 後端檢查（只檢查有改名的桌子）
  const checkAllNamesDuplicate = async (tables, originalTables = []) => {
    const namesToCheck = tables
      .filter(table => {
        const original = originalTables.find(t => t.tableId === table.tableId)
        return original && original.tableName.trim() !== table.tableName.trim()
      })
      .map(table => table.tableName.trim())
    if (namesToCheck.length === 0) return { hasDuplicate: false, duplicateNames: [] }
    const checkResults = await Promise.all(namesToCheck.map(name => checkDuplicateName(name)))
    const duplicateNames = checkResults.filter(res => res.status === 'error').map(res => res.duplicateName)
    return { hasDuplicate: duplicateNames.length > 0, duplicateNames }
  }

  // 統一檢查流程
  const checkEditTableNames = async (tables, allTableNames, originalTables) => {
    if (hasDuplicateInInput(tables)) {
      const nameCount = {}
      tables.forEach(table => {
        const name = table.tableName.trim()
        nameCount[name] = (nameCount[name] || 0) + 1
      })
      const duplicateNames = []
      for (const name in nameCount) {
        if (nameCount[name] > 1) {
          duplicateNames.push(name)
        }
      }
      return {
        isDuplicate: true,
        duplicateNames,
        error: {
          title: '桌號不能重複',
          content: '請修改重複的桌名'
        }
      }
    }
    if (hasDuplicateInAll(tables, allTableNames)) {
      const editingNames = tables.map(t => t.tableName.trim())
      const duplicateNames = allTableNames.filter(name => editingNames.includes(name))
      return {
        isDuplicate: true,
        duplicateNames,
        error: {
          title: '桌號不能重複',
          content: '目前名稱已有桌號使用，請使用其他命名'
        }
      }
    }
    const { hasDuplicate, duplicateNames } = await checkAllNamesDuplicate(tables, originalTables)
    if (hasDuplicate) {
      return {
        isDuplicate: true,
        duplicateNames,
        error: {
          title: '桌號不能重複',
          content: '目前名稱已有桌號使用，請使用其他命名'
        }
      }
    }
    return { isDuplicate: false }
  }

  return {
    hasDuplicateInAll,
    checkAllNamesDuplicate,
    checkEditTableNames
  }
}
