import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from './InventoryContext';
import { Loader2, Package } from 'lucide-react';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'other', label: 'Other' },
];

const initialFormState = {
  name: '',
  sku: '',
  category: 'other',
  quantity: 0,
  price: 0,
  cost: 0,
  low_stock_threshold: 10,
  description: '',
  image_url: '',
};

export default function ProductModal({ open, onClose, product }) {
  const [form, setForm] = useState(initialFormState);
  const { createProduct, updateProduct, isCreating, isUpdating } = useInventory();
  const isEditing = !!product;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'other',
        quantity: product.quantity || 0,
        price: product.price || 0,
        cost: product.cost || 0,
        low_stock_threshold: product.low_stock_threshold || 10,
        description: product.description || '',
        image_url: product.image_url || '',
      });
    } else {
      setForm(initialFormState);
    }
  }, [product, open]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      cost: Number(form.cost),
      low_stock_threshold: Number(form.low_stock_threshold),
    };

    if (isEditing) {
      await updateProduct({ id: product.id, data });
    } else {
      await createProduct(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-indigo-600" />
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-slate-700">Product Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter product name"
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="sku" className="text-slate-700">SKU *</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g., PRD-001"
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="category" className="text-slate-700">Category</Label>
              <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity" className="text-slate-700">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="low_stock_threshold" className="text-slate-700">Low Stock Alert</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="price" className="text-slate-700">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="cost" className="text-slate-700">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                className="mt-1.5"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="image_url" className="text-slate-700">Image URL</Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description" className="text-slate-700">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}