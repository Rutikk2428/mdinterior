import React, { useEffect, useState } from 'react';
import { useData } from '../store';
import { useNavigate } from 'react-router-dom';
import { COMPANY_INFO } from '../constants';
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react';

const MDLogo = () => (
  <div className="font-serif font-black text-7xl tracking-tighter leading-none inline-block mb-4 text-black">
    MD
  </div>
);

const InvoicePreview: React.FC = () => {
  const { cart, customerName, cartTotal } = useData();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Redirect if empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/estimator');
    }
  }, [cart, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const element = document.getElementById('invoice-content');
    
    const opt = {
      margin: 0.2, // Small margin to prevent cutting content
      filename: `Estimate_${customerName.replace(/[^a-z0-9]/gi, '_') || 'MD_Interior'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsDownloading(false);
      }).catch((err: any) => {
        console.error(err);
        setIsDownloading(false);
      });
    } else {
      alert("PDF Generator is loading, please try again in a second.");
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen py-6 md:py-10 font-sans print:bg-white print:py-0">
      
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-3xl mx-auto mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-center px-4 gap-4 no-print">
        <button 
          onClick={() => navigate('/estimator')}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Edit Estimate</span><span className="sm:hidden">Edit</span>
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-white text-black border border-gray-300 px-6 py-2 md:py-3 rounded shadow-sm hover:bg-gray-50 transition-colors font-medium tracking-wide disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
            Download PDF
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded shadow-xl hover:bg-gray-800 transition-colors font-medium tracking-wide"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div id="invoice-content" className="max-w-3xl mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none min-h-[11in] print:min-h-0 relative">
        <div className="p-8 md:p-16 print:p-8 h-full flex flex-col">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-12 md:mb-16 gap-8 sm:gap-0">
            <div className="text-black">
               <MDLogo />
               <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">From</div>
               <h1 className="font-serif font-bold text-gray-900 text-lg">{COMPANY_INFO.name}</h1>
               <div className="text-sm text-gray-500 mt-2 leading-relaxed">
                 <p>{COMPANY_INFO.address}</p>
                 <p>{COMPANY_INFO.email}</p>
                 <p>{COMPANY_INFO.phone}</p>
               </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Estimate</h2>
              <div className="text-sm">
                <div className="flex justify-between sm:justify-end gap-8 mb-2">
                   <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Date</span>
                   <span className="font-medium text-gray-900 w-32">{date}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-8">
                   <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Ref #</span>
                   <span className="font-medium text-gray-900 w-32">{Math.floor(Math.random() * 100000)}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-8 md:mb-12 print:border-gray-300" />

          {/* Client Info */}
          <div className="mb-8 md:mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-4">Bill To</div>
            <h3 className="text-2xl md:text-3xl font-serif text-gray-900 break-words">{customerName}</h3>
          </div>

          {/* Items Table */}
          <div className="flex-1">
            <table className="w-full mb-12 min-w-full">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-4 text-xs uppercase tracking-widest font-bold text-black w-1/2">Description</th>
                  <th className="py-4 text-xs uppercase tracking-widest font-bold text-black text-right w-1/6">Price</th>
                  <th className="py-4 text-xs uppercase tracking-widest font-bold text-black text-center w-1/6">Qty</th>
                  <th className="py-4 text-xs uppercase tracking-widest font-bold text-black text-right w-1/6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                {cart.map((item) => (
                  <tr key={item.id} className="break-inside-avoid">
                    <td className="py-5 pr-4 align-top">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    </td>
                    <td className="py-5 text-right text-gray-600 text-sm font-mono align-top">
                      ₹{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-5 text-center text-gray-900 text-sm font-bold font-mono align-top">
                      {item.quantity}
                    </td>
                    <td className="py-5 text-right font-medium text-gray-900 text-sm font-mono align-top">
                      ₹{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-12 md:mb-20 break-inside-avoid">
            <div className="w-full sm:w-72">
              <div className="flex justify-between py-3 text-gray-500 text-sm">
                <span>Subtotal</span>
                <span className="font-mono">₹{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-3 text-gray-500 text-sm border-b border-gray-200 mb-4">
                <span>Tax</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-serif font-bold text-gray-900 text-lg md:text-xl">Total</span>
                <span className="font-bold text-black text-2xl md:text-3xl font-mono">
                  ₹{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 border-t-2 border-black flex flex-col md:flex-row justify-between items-start md:items-end text-sm text-gray-500 gap-4 break-inside-avoid">
            <div>
              <p className="font-serif italic text-black mb-1">"Timeless design, modern living"</p>
              <p className="text-xs">Estimate valid for 30 days. This is a computer generated estimate.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-medium text-black">{COMPANY_INFO.website}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;