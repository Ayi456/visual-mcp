import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query'
import { ApiResponse } from '@/types/api'
import { getUserFriendlyMessage, standardizeError } from '@/utils/errors'

export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<ApiResponse<TData>, any, TVariables>, 'mutationFn'> & {
    showFriendlyError?: boolean
    onFriendlyError?: (message: string, error: any) => void
  }
): UseMutationResult<ApiResponse<TData>, any, TVariables> & {
  friendlyError: string | null
} {
  const { showFriendlyError = true, onFriendlyError, ...mutationOptions } = options || {}

  const mutation = useMutation({
    mutationFn,
    onError: (error, variables, context) => {
      // 调用原始的 onError 回调
      mutationOptions.onError?.(error, variables, context)

      // 处理用户友好的错误消息
      if (showFriendlyError || onFriendlyError) {
        const friendlyMessage = getUserFriendlyMessage(error)
        onFriendlyError?.(friendlyMessage, error)
      }
    },
    ...mutationOptions
  })

  // 计算用户友好的错误消息
  const friendlyError = mutation.error ? getUserFriendlyMessage(mutation.error) : null

  return {
    ...mutation,
    friendlyError
  }
}

/**
 * 带有自动重试的 API Mutation Hook
 */
export function useApiMutationWithRetry<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    maxRetries?: number
    retryDelay?: number
    retryCondition?: (error: any, attempt: number) => boolean
  } & Omit<UseMutationOptions<ApiResponse<TData>, any, TVariables>, 'mutationFn'>
) {
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    retryCondition = (error: any) => error?.status >= 500,
    ...mutationOptions 
  } = options || {}

  const mutationWithRetry = async (variables: TVariables): Promise<ApiResponse<TData>> => {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await mutationFn(variables)
      } catch (error) {
        lastError = error
        
        // 如果是最后一次尝试，或者不满足重试条件，直接抛出错误
        if (attempt === maxRetries || !retryCondition(error, attempt)) {
          throw error
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
    
    throw lastError
  }

  return useApiMutation(mutationWithRetry, mutationOptions)
}

/**
 * 批量 API 操作的 Hook
 */
export function useBatchApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    batchSize?: number
    delayBetweenBatches?: number
    onBatchComplete?: (results: ApiResponse<TData>[], batchIndex: number) => void
    onAllComplete?: (allResults: ApiResponse<TData>[]) => void
  }
) {
  const { 
    batchSize = 5, 
    delayBetweenBatches = 100,
    onBatchComplete,
    onAllComplete
  } = options || {}

  const batchMutation = useMutation({
    mutationFn: async (variablesArray: TVariables[]): Promise<ApiResponse<TData>[]> => {
      const results: ApiResponse<TData>[] = []
      
      // 分批处理
      for (let i = 0; i < variablesArray.length; i += batchSize) {
        const batch = variablesArray.slice(i, i + batchSize)
        const batchIndex = Math.floor(i / batchSize)
        
        // 并行执行当前批次
        const batchPromises = batch.map(variables => mutationFn(variables))
        const batchResults = await Promise.allSettled(batchPromises)
        
        // 处理批次结果
        const successfulResults = batchResults
          .filter((result): result is PromiseFulfilledResult<ApiResponse<TData>> => 
            result.status === 'fulfilled'
          )
          .map(result => result.value)
        
        results.push(...successfulResults)
        onBatchComplete?.(successfulResults, batchIndex)
        
        // 批次间延迟
        if (i + batchSize < variablesArray.length && delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
        }
      }
      
      onAllComplete?.(results)
      return results
    }
  })

  return batchMutation
}

/**
 * 带有乐观更新的 API Mutation Hook
 */
export function useOptimisticApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: {
    optimisticUpdate: (variables: TVariables) => TData
    onOptimisticUpdate?: (optimisticData: TData) => void
    onRevert?: (originalData: TData) => void
  } & Omit<UseMutationOptions<ApiResponse<TData>, any, TVariables>, 'mutationFn'>
) {
  const { optimisticUpdate, onOptimisticUpdate, onRevert, ...mutationOptions } = options

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // 执行乐观更新
      const optimisticData = optimisticUpdate(variables)
      onOptimisticUpdate?.(optimisticData)
      
      // 调用原始的 onMutate
      return mutationOptions.onMutate?.(variables)
    },
    onError: (error, variables, context) => {
      // 回滚乐观更新
      if (context) {
        onRevert?.(context as TData)
      }
      
      // 调用原始的 onError
      mutationOptions.onError?.(error, variables, context)
    },
    ...mutationOptions
  })
}
