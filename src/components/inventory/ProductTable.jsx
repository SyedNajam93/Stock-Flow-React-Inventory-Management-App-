import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, AlertTriangle, Package, Eye } from 'lucide-react';

const categoryColors = {
  electronics: 'bg-blue-100 text-blue-700',
  clothing: 'bg-purple-100 text-purple-700',
  food: 'bg-green-100 text-green-700',
  furniture: 'bg-amber-100 text-amber-700',
  tools: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ProductTable({ products, onEdit, onDelete }) {
  const getStockStatus = (product) => {
    if (product.quantity === 0) return { text: 'Out of Stock', class: 'bg-red-100 text-red-700', alert: true };
    if (product.quantity <= (product.low_stock_threshold || 10)) return { text: 'Low Stock', class: 'bg-amber-100 text-amber-700', alert: true };
    return { text: 'In Stock', class: 'bg-emerald-100 text-emerald-700', alert: false };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="p-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{product.name}</span>
                      {stockStatus.alert && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={categoryColors[product.category] || categoryColors.other}>
                      {product.category?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">${product.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">{product.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={stockStatus.class}>
                      {stockStatus.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-700">
                    ${(product.quantity * product.price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
      
      {products.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}