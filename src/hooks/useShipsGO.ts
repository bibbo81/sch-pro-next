'use client'

import { useState } from 'react'

export interface TrackingResult {
  tracking_number: string
  found: boolean
  data?: any
  usedCredits: boolean
  source: 'existing' | 'new' | 'error'
}

export function useShipsGO() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creditsUsed, setCreditsUsed] = useState(0)

  const trackSingle = async (trackingNumber: string, forceNew = false): Promise<TrackingResult> => {
    setLoading(true)
    setError(null)

    try {
      if (!forceNew) {
        // Prima controlla se esiste già (GET - no crediti)
        const checkResponse = await fetch('/api/shipsgo/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tracking_numbers: [trackingNumber] }),
        })

        const checkResult = await checkResponse.json()

        if (checkResult.success && checkResult.existing.length > 0) {
          return {
            tracking_number: trackingNumber,
            found: true,
            data: checkResult.existing[0].data,
            usedCredits: false,
            source: 'existing'
          }
        }
      }

      // Se non esiste o forceNew, usa POST (consuma crediti)
      const response = await fetch('/api/shipsgo/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Errore nel tracking')
      }

      setCreditsUsed(prev => prev + 1)

      return {
        tracking_number: trackingNumber,
        found: true,
        data: result.data,
        usedCredits: true,
        source: 'new'
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
      setError(errorMessage)
      
      return {
        tracking_number: trackingNumber,
        found: false,
        usedCredits: false,
        source: 'error'
      }
    } finally {
      setLoading(false)
    }
  }

  const trackBatch = async (trackingNumbers: string[], forceNew = false) => {
    setLoading(true)
    setError(null)

    try {
      let existingData: any[] = []
      let missingNumbers: string[] = trackingNumbers

      if (!forceNew) {
        // Prima controlla quali esistono già (GET - no crediti)
        const checkResponse = await fetch('/api/shipsgo/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tracking_numbers: trackingNumbers }),
        })

        const checkResult = await checkResponse.json()

        if (checkResult.success) {
          existingData = checkResult.existing.map((item: any) => ({
            ...item.data,
            usedCredits: false,
            source: 'existing'
          }))
          missingNumbers = checkResult.missing
        }
      }

      let newData: any[] = []

      // Solo per i tracking mancanti, usa POST (consuma crediti)
      if (missingNumbers.length > 0) {
        const batchResponse = await fetch('/api/shipsgo/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tracking_numbers: missingNumbers }),
        })

        const batchResult = await batchResponse.json()

        if (batchResult.success) {
          newData = batchResult.data.map((item: any) => ({
            ...item,
            usedCredits: item.success,
            source: item.success ? 'new' : 'error'
          }))
          
          const successfulNew = newData.filter(item => item.success).length
          setCreditsUsed(prev => prev + successfulNew)
        }
      }

      const allData = [...existingData, ...newData]

      return {
        data: allData,
        stats: {
          total: trackingNumbers.length,
          existing: existingData.length,
          new: newData.filter(item => item.success).length,
          errors: newData.filter(item => !item.success).length,
          creditsUsed: newData.filter(item => item.success).length
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetCredits = () => setCreditsUsed(0)

  return { 
    trackSingle, 
    trackBatch, 
    loading, 
    error, 
    creditsUsed, 
    resetCredits 
  }
}