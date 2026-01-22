import { checkDuplicateName } from '@/services/api/shop'

export const useCheckTableName = () => {
  const hasDuplicateInInput = tables => {
    const nameCount = {}
    const duplicateNames = new Set()
    tables.forEach(t => {
      const name = t.tableName.trim()
      nameCount[name] = (nameCount[name] || 0) + 1
      if (nameCount[name] > 1) {
        duplicateNames.add(name)
      }
    })

    return {
      hasDuplicate: duplicateNames.size > 0,
      duplicateNames: Array.from(duplicateNames)
    }
  }

  const checkAllNamesDuplicate = async tables => {
    const names = tables.map(t => t.tableName.trim())
    const checkResults = await Promise.all(names.map(name => checkDuplicateName(name)))
    const duplicateNames = checkResults.filter(res => res.status === 'error' && res.duplicateName).map(res => res.duplicateName)
    return duplicateNames
  }

  const checkTableNames = async tables => {
    const frontendCheck = hasDuplicateInInput(tables)
    let allDuplicateNames = [...frontendCheck.duplicateNames]
    const backendDuplicateNames = await checkAllNamesDuplicate(tables)
    allDuplicateNames = [...new Set([...allDuplicateNames, ...backendDuplicateNames])]

    if (allDuplicateNames.length > 0) {
      return {
        isDuplicate: true,
        error: {
          title: '桌號不能重複',
          content: '目前名稱已有桌號使用，請使用其他命名'
        },
        duplicateNames: allDuplicateNames
      }
    }

    return { isDuplicate: false }
  }

  return {
    hasDuplicateInInput,
    checkAllNamesDuplicate,
    checkTableNames
  }
}
