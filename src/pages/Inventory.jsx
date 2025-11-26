import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, DollarSign, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { InventoryProvider, useInventory } from '../components/inventory/InventoryContext';
import StatsCard from '../components/inventory/StatsCard';
import SearchFilters from '../components/inventory/SearchFilters';
import ProductCard from '../components/inventory/ProductCard';
import ProductTable from '../components/inventory/ProductTable';
import ProductModal from '../components/inventory/ProductModal';
import StockAlerts from '../components/inventory/StockAlerts';
import CategoryChart from '../components/inventory/CategoryChart';
import DeleteConfirmDialog from '../components/inventory/DeleteConfirmDialog';

function InventoryContent() {
  const { filteredProducts, stats, isLoading, deleteProduct, isDeleting } = useInventory();
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-600 mt-1">Manage your products and track stock levels</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={Package}
            color="indigo"
          />
          <StatsCard
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Low Stock"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            color="amber"
          />
          <StatsCard
            title="Out of Stock"
            value={stats.outOfStockCount}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Alerts and Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StockAlerts onEditProduct={handleEdit} />
          <CategoryChart />
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilters 
            viewMode={viewMode} 
            setViewMode={setViewMode}
            onAddNew={handleAddNew}
          />
        </div>

        {/* Products List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={setDeleteId}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={setDeleteId}
          />
        )}

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No products found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function Inventory() {
  return (
    <InventoryProvider>
      <InventoryContent />
    </InventoryProvider>
  );
}