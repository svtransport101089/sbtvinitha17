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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [editingInvoiceMemo, setEditingInvoiceMemo] = useState<string | null>(null);
  const [printOnLoad, setPrintOnLoad] = useState(false);

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