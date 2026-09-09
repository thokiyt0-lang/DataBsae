import React, { useState, useMemo } from 'react';
import { useDb } from '../context/DbContext';
import type { DatabaseRecord, RecordStatus } from '../types/database';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Database
} from 'lucide-react';

export const DatabaseRecordsPage: React.FC = () => {
  const { 
    records, 
    isLoadingRecords, 
    fetchRecords, 
    setActiveModal, 
    setSelectedRecord
  } = useDb();


  // Search & Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'status' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        // Status filter
        if (statusFilter !== 'All' && record.status !== statusFilter) {
          return false;
        }

        // Search term filter
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          return (
            record.name.toLowerCase().includes(query) ||
            record.email.toLowerCase().includes(query) ||
            (record.phone && record.phone.toLowerCase().includes(query)) ||
            (record.address && record.address.toLowerCase().includes(query)) ||
            record.id.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';

        if (sortBy === 'created_at' || sortBy === 'updated_at') {
          const dateA = new Date(valA).getTime();
          const dateB = new Date(valB).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }

        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [records, searchTerm, statusFilter, sortBy, sortOrder]);

  // Paginated records slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIdx, startIdx + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setSelectedRecord(null);
    setActiveModal('add');
  };

  const handleOpenView = (record: DatabaseRecord) => {
    setSelectedRecord(record);
    setActiveModal('details');
  };

  const handleOpenEdit = (record: DatabaseRecord) => {
    setSelectedRecord(record);
    setActiveModal('edit');
  };

  const handleOpenDelete = (record: DatabaseRecord) => {
    setSelectedRecord(record);
    setActiveModal('delete');
  };

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'Archived':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, phone, address, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="created_at">Created Date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="updated_at">Updated Date</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>

          {/* Refresh Table Button */}
          <button
            onClick={() => fetchRecords()}
            disabled={isLoadingRecords}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Database Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRecords ? 'animate-spin text-cyan-500' : ''}`} />
          </button>

          {/* Add Record Primary Action */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>

        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4">Name & Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Updated Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              
              {isLoadingRecords ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-1"></div><div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedRecords.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Database className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No records found</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchTerm || statusFilter !== 'All'
                          ? 'Try clearing your search term or status filters.'
                          : 'No entries currently exist in the database table.'}
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Record</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                paginatedRecords.map(record => {
                  const createdFormatted = record.created_at
                    ? new Date(record.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A';
                  const updatedFormatted = record.updated_at
                    ? new Date(record.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A';

                  return (
                    <tr 
                      key={record.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID column */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-cyan-600 dark:text-cyan-400 font-semibold" title={record.id}>
                          {record.id.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {record.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {record.email} {record.phone ? `• ${record.phone}` : ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {createdFormatted}
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {updatedFormatted}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View */}
                          <button
                            onClick={() => handleOpenView(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                            title="View Record Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDelete(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredRecords.length}</span> entries
          </div>

          <div className="flex items-center space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 font-semibold text-slate-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
