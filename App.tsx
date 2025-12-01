import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PageWrapper from './components/layout/PageWrapper';
import CustomerCRUD from './components/CustomerCRUD';
import ViewServices from './components/ViewServices';
import InvoiceForm from './components/forms/InvoiceForm';
import { ToastProvider } from './hooks/useToast';
import { Page } from './types';
import Dashboard from './components/Dashboard';
import AreasCRUD from './components/AreasCRUD';
import CalculationsCRUD from './components/CalculationsCRUD';
import InvoiceCRUD from './components/InvoiceCRUD';
import LookupCRUD from './components/LookupCRUD';
import { isKeyMissing, updateSupabaseKey } from './services/googleScriptMock';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [editingInvoiceMemo, setEditingInvoiceMemo] = useState<string | null>(null);
  const [printOnLoad, setPrintOnLoad] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(isKeyMissing());

  const handleNavigate = (page: Page) => {
    setEditingInvoiceMemo(null);
    setPrintOnLoad(false);
    setCurrentPage(page);
  };

  const handleEditInvoice = (memoNo: string) => {
    setEditingInvoiceMemo(memoNo);
    setPrintOnLoad(false);
    setCurrentPage(Page.INVOICE);
  };

  const handleDownloadInvoice = (memoNo: string) => {
    setEditingInvoiceMemo(memoNo);
    setPrintOnLoad(true);
    setCurrentPage(Page.INVOICE);
  };

  const handleInvoiceFormClose = () => {
    setEditingInvoiceMemo(null);
    setPrintOnLoad(false);
    setCurrentPage(Page.MANAGE_INVOICES);
  };

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard />;
      case Page.INVOICE:
        return <InvoiceForm 
                  invoiceMemoToLoad={editingInvoiceMemo} 
                  onSaveSuccess={handleInvoiceFormClose}
                  onCancel={handleInvoiceFormClose} 
                  printOnLoad={printOnLoad}
                  onPrinted={handleInvoiceFormClose}
               />;
      case Page.MANAGE_INVOICES:
        return <InvoiceCRUD onEditInvoice={handleEditInvoice} onDownloadInvoice={handleDownloadInvoice} />;
      case Page.MANAGE_CUSTOMERS:
        return <CustomerCRUD />;
      case Page.VIEW_ALL_SERVICES:
        return <ViewServices />;
      case Page.MANAGE_AREAS:
        return <AreasCRUD />;
      case Page.MANAGE_CALCULATIONS:
        return <CalculationsCRUD />;
      case Page.MANAGE_LOOKUP:
        return <LookupCRUD />;
      default:
        return <Dashboard />;
    }
  }, [currentPage, editingInvoiceMemo, printOnLoad]);

  const pageTitle = useMemo(() => {
    if (currentPage === Page.INVOICE && editingInvoiceMemo) {
      return printOnLoad ? `Download Invoice: ${editingInvoiceMemo}` : `Edit Invoice: ${editingInvoiceMemo}`;
    }
    const pageName = currentPage.replace(/_/g, ' ');
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase();
  }, [currentPage, editingInvoiceMemo, printOnLoad]);

  if (showKeyModal) {
      return (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50 font-sans">
              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Setup Database</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                      To connect to the Supabase backend, please enter your <code>anon</code> (public) API Key.
                  </p>
                  <p className="text-xs text-gray-500 mb-2">Project ID: zcuxxugwmgoifmeahydl</p>
                  <input 
                      type="text" 
                      id="supabase-key-input"
                      className="w-full border border-gray-300 p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                  <button 
                      onClick={() => {
                          const input = document.getElementById('supabase-key-input') as HTMLInputElement;
                          if (input.value.trim()) {
                              updateSupabaseKey(input.value.trim());
                          }
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                      Save & Reload
                  </button>
                  <p className="mt-4 text-xs text-center text-gray-400">This key will be stored in your browser's local storage.</p>
              </div>
          </div>
      );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar currentPage={currentPage} setCurrentPage={handleNavigate} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={pageTitle} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <PageWrapper>
              {renderPage}
            </PageWrapper>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;