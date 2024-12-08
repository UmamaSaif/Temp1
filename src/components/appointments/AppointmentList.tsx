import React from 'react';
import { Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Appointment } from '../../types/doctor';

interface AppointmentListProps {
  appointments: Appointment[];
}

export default function AppointmentList({ appointments }: AppointmentListProps) {
  const columns: GridColDef[] = [
    {
      field: 'doctor',
      headerName: 'Doctor',
      flex: 1,
      valueGetter: (params) => `Dr. ${params.row.doctor.name}`
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      flex: 1,
      valueGetter: (params) => new Date(params.row.date).toLocaleString()
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      valueGetter: (params) => params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)
    },
    {
      field: 'consultationType',
      headerName: 'Type',
      flex: 1,
      valueGetter: (params) => params.row.consultationType.replace('-', ' ').charAt(0).toUpperCase() + params.row.consultationType.slice(1)
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      flex: 1,
      valueGetter: (params) => params.row.paymentStatus.charAt(0).toUpperCase() + params.row.paymentStatus.slice(1)
    }
  ];

  return (
    <Paper sx={{ height: 400 }}>
      <DataGrid
        rows={appointments}
        columns={columns}
        getRowId={(row) => row._id}
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
      />
    </Paper>
  );
}