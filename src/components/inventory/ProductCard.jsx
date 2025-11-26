import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, AlertTriangle, Package, Eye } from 'lucide-react';

const categoryColors = {
  electronics: 'bg-blue-100 text-blue-700',
  clothing: 'bg-purple-100 text-purple-700',
  food: 'bg-green-100 text-green-700',
  furniture: 'bg-amber-100 text-amber-700',
  tools: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function ProductCard({ product, onEdit, onDelete }) {
  const isLowStock = product.quantity <= (product.low_stock_threshold || 10) && product.quantity > 0;
  const isOutOfStock = product.quantity === 0;

  const getStockStatus = () => {
    if (isOutOfStock) return { text: 'Out of Stock', class: 'bg-red-100 text-red-700' };
    if (isLowStock) return { text: 'Low Stock', class: 'bg-amber-100 text-amber-700' };
    return { text: 'In Stock', class: 'bg-emerald-100 text-emerald-700' };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="aspect-square bg-slate-50 relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300" />
          </div>
        )}
        
        {(isLowStock || isOutOfStock) && (
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              {isOutOfStock ? 'Out' : 'Low'}
            </div>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="gap-2">
                  <Eye className="w-4 h-4" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)} className="gap-2">
                <Edit className="w-4 h-4" /> Quick Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(product.id)} className="gap-2 text-red-600">
                <Trash2 className="w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
        </div>
        
        <p className="text-xs text-slate-500 mb-3">SKU: {product.sku}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className={categoryColors[product.category] || categoryColors.other}>
            {product.category?.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="secondary" className={stockStatus.class}>
            {stockStatus.text}
          </Badge>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">${product.price?.toFixed(2)}</p>
            {product.cost > 0 && (
              <p className="text-xs text-slate-500">Cost: ${product.cost?.toFixed(2)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-700">{product.quantity}</p>
            <p className="text-xs text-slate-500">in stock</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}