'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Package, Truck, MapPin, Calendar, User, Hash, DollarSign } from 'lucide-react';
import styles from './TrackingTable.module.css';

interface Shipment {
  id: string;
  tracking_number?: string;
  origin_port?: string;
  destination_port?: string;
  departure_date?: string;
  estimated_arrival?: string;
  status?: string;
  carrier?: string;
  vessel_name?: string;
  container_number?: string;
  total_value?: number;
  currency?: string;
  shipper_name?: string;
  consignee_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface TrackingTableProps {
  shipments: Shipment[];
  loading?: boolean;
}

export default function TrackingTable({ shipments, loading = false }: TrackingTableProps) {
  const router = useRouter();

  const handleViewDetails = (shipmentId: string) => {
  router.push(`/shipments/${shipmentId}`);  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'in_transit':
        return '#3b82f6';
      case 'delivered':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'delayed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'pending':
        return 'Pending';
      case 'delayed':
        return 'Delayed';
      default:
        return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Caricamento spedizioni...</p>
      </div>
    );
  }

  if (!shipments || shipments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={48} color="#9ca3af" />
        <h3>Nessuna spedizione trovata</h3>
        <p>Non ci sono spedizioni da mostrare al momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <Hash size={16} />
                Tracking
              </th>
              <th>
                <MapPin size={16} />
                Route
              </th>
              <th>
                <Calendar size={16} />
                Dates
              </th>
              <th>
                <Truck size={16} />
                Carrier
              </th>
              <th>
                <Package size={16} />
                Status
              </th>
              <th>
                <User size={16} />
                Parties
              </th>
              <th>
                <DollarSign size={16} />
                Value
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id}>
                <td>
                  <div className={styles.trackingCell}>
                    <strong>{shipment.tracking_number || 'N/A'}</strong>
                    {shipment.container_number && (
                      <div className={styles.containerNumber}>
                        {shipment.container_number}
                      </div>
                    )}
                  </div>
                </td>
                
                <td>
                  <div className={styles.routeCell}>
                    <div className={styles.portName}>{shipment.origin_port || 'N/A'}</div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.portName}>{shipment.destination_port || 'N/A'}</div>
                  </div>
                </td>
                
                <td>
                  <div className={styles.datesCell}>
                    {shipment.departure_date && (
                      <div className={styles.date}>
                        <small>Dep:</small> {new Date(shipment.departure_date).toLocaleDateString()}
                      </div>
                    )}
                    {shipment.estimated_arrival && (
                      <div className={styles.date}>
                        <small>ETA:</small> {new Date(shipment.estimated_arrival).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                
                <td>
                  <div className={styles.carrierCell}>
                    <div className={styles.carrierName}>{shipment.carrier || 'N/A'}</div>
                    {shipment.vessel_name && (
                      <div className={styles.vesselName}>{shipment.vessel_name}</div>
                    )}
                  </div>
                </td>
                
                <td>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      backgroundColor: getStatusColor(shipment.status) + '20',
                      color: getStatusColor(shipment.status),
                      border: `1px solid ${getStatusColor(shipment.status)}40`
                    }}
                  >
                    {getStatusLabel(shipment.status)}
                  </span>
                </td>
                
                <td>
                  <div className={styles.partiesCell}>
                    {shipment.shipper_name && (
                      <div className={styles.party}>
                        <small>Shipper:</small> {shipment.shipper_name}
                      </div>
                    )}
                    {shipment.consignee_name && (
                      <div className={styles.party}>
                        <small>Consignee:</small> {shipment.consignee_name}
                      </div>
                    )}
                  </div>
                </td>
                
                <td>
                  <div className={styles.valueCell}>
                    {shipment.total_value ? (
                      <>
                        <strong>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: shipment.currency || 'USD'
                          }).format(shipment.total_value)}
                        </strong>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                </td>
                
                <td>
                  <div className={styles.actionsCell}>
                    <button
                      onClick={() => handleViewDetails(shipment.id)}
                      className={styles.actionButton}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}