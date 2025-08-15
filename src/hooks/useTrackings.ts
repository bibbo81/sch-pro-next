'use client'

import { useState, useEffect } from 'react'
import { TrackingService, Tracking } from '@/lib/trackingService'

// Mock user ID per ora - in futuro useremo auth reale
const MOCK_USER_ID = '21766c53-a16b-4019-9a11-845ecea8cf10'

export function useTrackings() {
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carica tracking dal database
  const loadTrackings = async () => {
    try {
      setLoading(true)
      const data = await TrackingService.getAll(MOCK_USER_ID)
      setTrackings(data)
      setError(null)
    } catch (err) {
      setError('Errore nel caricamento dei tracking')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Aggiungi tracking
  const addTracking = async (trackingData: any) => {
    try {
      // Controlla se esiste già
      const exists = await TrackingService.exists(trackingData.tracking_number, MOCK_USER_ID)
      if (exists) {
        throw new Error('Tracking già esistente')
      }

      // Mappa i dati al formato database
      const mappedTracking: Partial<Tracking> = {
        user_id: MOCK_USER_ID,
        tracking_number: trackingData.tracking_number,
        tracking_type: trackingData.tracking_type || 'container',
        carrier_code: trackingData.carrier_code,
        carrier_name: trackingData.carrier_name,
        reference_number: trackingData.reference_number,
        status: trackingData.status || 'registered',
        origin_port: trackingData.origin_port,
        destination_port: trackingData.destination_port,
        eta: trackingData.eta,
        vessel_name: trackingData.vessel_name,
        voyage_number: trackingData.voyage_number,
        container_count: trackingData.container_count || 1,
        metadata: {
          source: trackingData.source || 'manual',
          events: trackingData.events || [],
          last_update: new Date().toISOString()
        }
      }

      const newTracking = await TrackingService.create(mappedTracking)
      setTrackings(prev => [newTracking, ...prev])
      return newTracking
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta del tracking')
      throw err
    }
  }

  // Aggiungi tracking multipli
  const addTrackings = async (trackingsData: any[]) => {
    try {
      const mappedTrackings = trackingsData.map(trackingData => ({
        user_id: MOCK_USER_ID,
        tracking_number: trackingData.tracking_number,
        tracking_type: trackingData.tracking_type || 'container',
        carrier_code: trackingData.carrier_code,
        carrier_name: trackingData.carrier_name,
        reference_number: trackingData.reference_number,
        status: trackingData.status || 'registered',
        origin_port: trackingData.origin_port,
        destination_port: trackingData.destination_port,
        eta: trackingData.eta,
        vessel_name: trackingData.vessel_name,
        voyage_number: trackingData.voyage_number,
        container_count: trackingData.container_count || 1,
        metadata: {
          source: trackingData.source || 'manual',
          events: trackingData.events || [],
          last_update: new Date().toISOString()
        }
      }))

      const newTrackings = await TrackingService.createMany(mappedTrackings)
      setTrackings(prev => [...newTrackings, ...prev])
      return newTrackings
    } catch (err) {
      setError('Errore nell\'aggiunta dei tracking')
      throw err
    }
  }

  // Elimina tracking
  const deleteTracking = async (id: string) => {
    try {
      await TrackingService.delete(id)
      setTrackings(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError('Errore nell\'eliminazione del tracking')
      throw err
    }
  }

  // Carica al mount
  useEffect(() => {
    loadTrackings()
  }, [])

  return {
    trackings,
    loading,
    error,
    loadTrackings,
    addTracking,
    addTrackings,
    deleteTracking
  }
}