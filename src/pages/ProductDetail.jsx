import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Package, 
  Save, 
  Trash2, 
  Loader2, 
  Plus, 
  Minus,
  AlertTriangle,
  DollarSign,
  Layers,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'other', label: 'Other' },
];

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [quickAdjust, setQuickAdjust] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setHasChanges(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Product.delete(productId),
    onSuccess: () => {
      window.location.href = createPageUrl('Inventory');
    },
  });

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
    }
  }, [product]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const data = {
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      cost: Number(form.cost),
      low_stock_threshold: Number(form.low_stock_threshold),
    };
    await updateMutation.mutateAsync(data);
  };

  const handleQuickAdjust = async (adjustment) => {
    const newQuantity = Math.max(0, (form?.quantity || 0) + adjustment);
    setForm(prev => ({ ...prev, quantity: newQuantity }));
    await updateMutation.mutateAsync({ quantity: newQuantity });
  };

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Product not found</h2>
        <Link to={createPageUrl('Inventory')}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>
    );
  }

  const isLowStock = form.quantity <= form.low_stock_threshold && form.quantity > 0;
  const isOutOfStock = form.quantity === 0;
  const totalValue = form.quantity * form.price;
  const profit = form.price - form.cost;
  const profitMargin = form.price > 0 ? ((profit / form.price) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Inventory')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-slate-500">SKU: {product.sku}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image & Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-square bg-slate-100 rounded-t-xl overflow-hidden">
                  {form.image_url ? (
                    <img src={form.image_url} alt={form.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Label className="text-slate-700">Image URL</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stock Adjustment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Quick Stock Adjustment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuickAdjust(-1)}
                    disabled={form.quantity === 0}
                    className="h-12 w-12 rounded-full"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900">{form.quantity}</p>
                    <p className="text-sm text-slate-500">units</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuickAdjust(1)}
                    className="h-12 w-12 rounded-full"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Adjust by..."
                    value={quickAdjust || ''}
                    onChange={(e) => setQuickAdjust(Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (quickAdjust) {
                        handleQuickAdjust(quickAdjust);
                        setQuickAdjust(0);
                      }
                    }}
                    disabled={!quickAdjust}
                  >
                    Apply
                  </Button>
                </div>

                {(isLowStock || isOutOfStock) && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                    isOutOfStock ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isOutOfStock ? 'Out of stock!' : `Low stock (below ${form.low_stock_threshold})`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Value</span>
                  <span className="font-semibold">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unit Profit</span>
                  <span className={`font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Profit Margin</span>
                  <span className={`font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {profitMargin}%
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last Updated
                  </span>
                  <span className="text-sm text-slate-500">
                    {product.updated_date ? format(new Date(product.updated_date), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Product Details Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-slate-700">Product Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter product name"
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
                      onChange={(e) => handleChange('quantity', Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="low_stock_threshold" className="text-slate-700">Low Stock Alert Threshold</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      min="0"
                      value={form.low_stock_threshold}
                      onChange={(e) => handleChange('low_stock_threshold', Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price" className="text-slate-700">Selling Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cost" className="text-slate-700">Cost Price ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cost}
                      onChange={(e) => handleChange('cost', Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-slate-700">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Product description..."
                      rows={4}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}