import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { InvoiceModal } from './components/InvoiceModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { FloatingAssistant } from './components/FloatingAssistant';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { WishlistDrawer } from './components/WishlistDrawer';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CmsGuidePage } from './pages/CmsGuidePage';
import { PolicyPage } from './pages/PolicyPage';

// Admin Modules
import { AdminLayout, AdminTab } from './admin/AdminLayout';
import { DashboardModule } from './admin/modules/DashboardModule';
import { ProductsModule } from './admin/modules/ProductsModule';
import { OrdersModule } from './admin/modules/OrdersModule';
import { InventoryModule } from './admin/modules/InventoryModule';
import { CustomersModule } from './admin/modules/CustomersModule';
import { WholesaleModule } from './admin/modules/WholesaleModule';
import { ComplaintsModule } from './admin/modules/ComplaintsModule';
import { TasksModule } from './admin/modules/TasksModule';
import { NotificationsModule } from './admin/modules/NotificationsModule';
import { PaymentsModule } from './admin/modules/PaymentsModule';
import { ReportsModule } from './admin/modules/ReportsModule';
import { MarketingOffersModule } from './admin/modules/MarketingOffersModule';
import { AiAgentModule } from './admin/modules/AiAgentModule';
import { ContentBannersModule } from './admin/modules/ContentBannersModule';
import { CmsStoriesModule } from './admin/modules/CmsStoriesModule';
import { CommerceSettingsModule } from './admin/modules/CommerceSettingsModule';
import { AdminStaffSystemModule } from './admin/modules/AdminStaffSystemModule';
import { LandingPageModule } from './admin/modules/LandingPageModule';
import { GtmPixelModule } from './admin/modules/GtmPixelModule';
import { ReviewsModule } from './admin/modules/ReviewsModule';
import { ProfitLossModule } from './admin/modules/ProfitLossModule';
import { FraudSecurityModule } from './admin/modules/FraudSecurityModule';
import { StoreDesignModule } from './admin/modules/StoreDesignModule';
import { VideoGalleryModule } from './admin/modules/VideoGalleryModule';
import { SuppliersPurchasesModule } from './admin/modules/SuppliersPurchasesModule';
import { UserAccessModule } from './admin/modules/UserAccessModule';
import { ComboOffersModule } from './admin/modules/ComboOffersModule';
import { FooterManagementModule } from './admin/modules/FooterManagementModule';
import { CategoryManagementModule } from './admin/modules/CategoryManagementModule';
import { SizeChartManagementModule } from './admin/modules/SizeChartManagementModule';
import { InvoiceGeneratorModule } from './admin/modules/InvoiceGeneratorModule';
import { LandingPageView } from './pages/LandingPageView';
import { AdminLoginPage } from './pages/AdminLoginPage';

const MainApp: React.FC = () => {
  const { currentView, isAdminAuthenticated } = useShop();
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // If in Admin Mode
  if (currentView === 'admin') {
    if (!isAdminAuthenticated) {
      return <AdminLoginPage />;
    }

    return (
      <AdminLayout activeTab={activeAdminTab} setActiveTab={setActiveAdminTab}>
        {activeAdminTab === 'dashboard' && (
          <DashboardModule
            onNavigateToOrders={() => setActiveAdminTab('orders')}
            onNavigateToProducts={() => setActiveAdminTab('products')}
            onNavigateToInventory={() => setActiveAdminTab('inventory')}
          />
        )}

        {/* 1. STORE & CATALOG */}
        {activeAdminTab === 'products' && <ProductsModule />}
        {activeAdminTab === 'categories' && <CategoryManagementModule />}
        {activeAdminTab === 'size_charts' && <SizeChartManagementModule />}
        {activeAdminTab === 'inventory' && <InventoryModule />}
        {activeAdminTab === 'orders' && <OrdersModule initialFilter="all" />}
        {activeAdminTab === 'invoice_generator' && <InvoiceGeneratorModule />}
        {activeAdminTab === 'orders_pending' && <OrdersModule initialFilter="pending" />}
        {activeAdminTab === 'orders_confirmed' && <OrdersModule initialFilter="confirmed" />}
        {activeAdminTab === 'orders_processing' && <OrdersModule initialFilter="processing" />}
        {activeAdminTab === 'orders_shipped' && <OrdersModule initialFilter="shipped" />}
        {activeAdminTab === 'orders_delivered' && <OrdersModule initialFilter="delivered" />}
        {activeAdminTab === 'orders_cancelled' && <OrdersModule initialFilter="cancelled" />}
        {activeAdminTab === 'returns_refunds' && <OrdersModule initialFilter="return_requested" />}
        {activeAdminTab === 'customers' && <CustomersModule />}
        {activeAdminTab === 'reviews' && <ReviewsModule />}

        {/* 2. OPERATIONS & B2B */}
        {activeAdminTab === 'suppliers_purchases' && <SuppliersPurchasesModule />}
        {activeAdminTab === 'wholesale' && <WholesaleModule />}
        {activeAdminTab === 'complaints' && <ComplaintsModule />}
        {activeAdminTab === 'tasks' && <TasksModule />}
        {activeAdminTab === 'customer_alerts' && (
          <NotificationsModule onNavigateToTab={(tab) => setActiveAdminTab(tab as any)} />
        )}
        {activeAdminTab === 'fraud_security' && <FraudSecurityModule />}

        {/* 3. SALES & FINANCE */}
        {activeAdminTab === 'payments' && <PaymentsModule />}
        {activeAdminTab === 'reports' && <ReportsModule initialReportTab="overview" />}
        {activeAdminTab === 'profit_loss' && <ProfitLossModule />}
        {activeAdminTab === 'coupons' && <CommerceSettingsModule initialTab="coupons" />}

        {/* 4. MARKETING */}
        {activeAdminTab === 'combo_offers' && <ComboOffersModule />}
        {activeAdminTab === 'campaigns' && <MarketingOffersModule initialTab="campaigns" />}
        {activeAdminTab === 'timer_offers' && <MarketingOffersModule initialTab="timer_offers" />}
        {activeAdminTab === 'landing_pages' && <LandingPageModule />}
        {activeAdminTab === 'gtm_pixel' && <GtmPixelModule />}
        {activeAdminTab === 'product_feed' && <GtmPixelModule />}

        {/* 5. CUSTOMER SERVICE */}
        {activeAdminTab === 'customer_messages' && (
          <NotificationsModule onNavigateToTab={(tab) => setActiveAdminTab(tab as any)} />
        )}
        {activeAdminTab === 'notifications' && (
          <NotificationsModule onNavigateToTab={(tab) => setActiveAdminTab(tab as any)} />
        )}
        {activeAdminTab === 'ai_assistant' && <AiAgentModule initialTab="overview" />}

        {/* 6. CONTENT */}
        {activeAdminTab === 'store_design' && <StoreDesignModule />}
        {activeAdminTab === 'banners' && <ContentBannersModule initialSubTab="hero" />}
        {activeAdminTab === 'cat_banners' && <ContentBannersModule initialSubTab="cat_banners" />}
        {activeAdminTab === 'menus' && <ContentBannersModule initialSubTab="navigation" />}
        {activeAdminTab === 'offers' && <ContentBannersModule initialSubTab="offers" />}
        {activeAdminTab === 'cms_pages' && <CmsStoriesModule initialTab="cms_pages" />}
        {activeAdminTab === 'order_guides' && <CmsStoriesModule initialTab="order_guide" />}
        {activeAdminTab === 'videos' && <VideoGalleryModule />}
        {activeAdminTab === 'brand_stories' && <CmsStoriesModule initialTab="partner_stories" />}
        {activeAdminTab === 'homepage_sections' && <ContentBannersModule initialSubTab="collections" />}
        {activeAdminTab === 'footer_settings' && <FooterManagementModule />}

        {/* 7. ANALYTICS (Dedicated Specialised Analytics Engines) */}
        {activeAdminTab === 'analytics_sales' && <ReportsModule initialReportTab="sales" />}
        {activeAdminTab === 'analytics_products' && <ReportsModule initialReportTab="products" />}
        {activeAdminTab === 'analytics_customers' && <ReportsModule initialReportTab="customers" />}
        {activeAdminTab === 'analytics_marketing' && <ReportsModule initialReportTab="marketing" />}
        {activeAdminTab === 'analytics_inventory' && <ReportsModule initialReportTab="inventory" />}

        {/* 8. SETTINGS & SECURITY */}
        {activeAdminTab === 'store_settings' && <CommerceSettingsModule initialTab="delivery" />}
        {activeAdminTab === 'payment_settings' && <CommerceSettingsModule initialTab="payments" />}
        {activeAdminTab === 'courier_settings' && <CommerceSettingsModule initialTab="courier" />}
        {activeAdminTab === 'admin_users' && <UserAccessModule />}
        {activeAdminTab === 'roles_permissions' && <UserAccessModule />}
        {activeAdminTab === 'ai_settings' && <AiAgentModule initialTab="settings" />}
        {activeAdminTab === 'integrations' && <CommerceSettingsModule initialTab="courier" />}
        {activeAdminTab === 'audit_logs' && <AdminStaffSystemModule initialTab="audit" />}
        {activeAdminTab === 'backup_database' && <AdminStaffSystemModule initialTab="backup" />}
        {activeAdminTab === 'system_settings' && <AdminStaffSystemModule initialTab="settings" />}

        {/* Global printable invoice modal also available from Admin */}
        <InvoiceModal />
      </AdminLayout>
    );
  }

  // Storefront Mode
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] text-[#1A1A1A] font-sans selection:bg-[#E5E5E5] selection:text-[#1A1A1A]">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'category' && <CategoryPage />}
        {currentView === 'product_details' && <ProductDetailsPage />}
        {currentView === 'checkout' && <CheckoutPage />}
        {currentView === 'order_tracking' && <OrderTrackingPage />}
        {currentView === 'landing_page' && <LandingPageView />}
        {currentView === 'policy' && <PolicyPage />}
        {(currentView === 'how_to_order' || currentView === 'clothing_guide') && <CmsGuidePage />}
      </main>

      <Footer />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <WishlistDrawer />
      <InvoiceModal />
      <AiAssistantModal />
      <SizeGuideModal />
      <CustomerAuthModal />
      <CustomerAccountModal />
      <FloatingAssistant />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainApp />
    </ShopProvider>
  );
}
