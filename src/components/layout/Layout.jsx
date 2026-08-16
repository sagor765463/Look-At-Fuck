import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '@/components/CartDrawer';

export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1"><Outlet /></main>
            <Footer />
            <CartDrawer />
        </div>
    );
}