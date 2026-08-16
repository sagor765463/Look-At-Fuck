import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import ProductForm from '@/components/admin/ProductForm';
import ProductTable from '@/components/admin/ProductTable';
import CategoryForm from '@/components/admin/CategoryForm';
import CategoryTable from '@/components/admin/CategoryTable';
import Orders from '@/pages/Orders';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                apiClient.entities.Product.list('-created_date', 100),
                apiClient.entities.Category.list()
            ]);
            setProducts(p);
            setCategories(c);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your orders, catalog, and categories all in one place.</p>

            <Tabs defaultValue="orders" className="mt-8">
                <TabsList className="mb-6 inline-flex w-full justify-start overflow-x-auto border-b border-border bg-transparent p-0 rounded-none">
                    <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Orders</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Products</TabsTrigger>
                    <TabsTrigger value="categories" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6">Categories</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-0 outline-none">
                    <div className="-mx-4 -my-8 sm:mx-0 sm:my-0">
                        <Orders isEmbedded={true} />
                    </div>
                </TabsContent>

                <TabsContent value="products" className="mt-0 outline-none">
                    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
                        <ProductForm 
                            onCreated={() => {
                                setEditingProduct(null);
                                loadData();
                            }} 
                            initialData={editingProduct}
                            onCancel={() => setEditingProduct(null)}
                        />
                        <div>
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <ProductTable 
                                    products={products} 
                                    onChange={loadData} 
                                    onEdit={setEditingProduct}
                                    editingId={editingProduct?.id}
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="categories" className="mt-0 outline-none">
                    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
                        <CategoryForm onCreated={loadData} />
                        <div>
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <CategoryTable categories={categories} onChange={loadData} />
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}