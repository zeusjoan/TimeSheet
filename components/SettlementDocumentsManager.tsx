import React, { useState, useEffect } from 'react';
import type { SettlementDocument, Order, Client } from '../types';
import Button from './ui/Button';
import Dropzone from './ui/Dropzone';
import EyeIcon from './icons/EyeIcon';
import DownloadIcon from './icons/DownloadIcon';
import TrashIcon from './icons/TrashIcon';

// TypeScript declaration for the pdf-lib library loaded from CDN
declare global {
    interface Window {
        PDFLib: any;
    }
}

interface DocumentPair {
    orderId: number;
    orderNumber: string;
    clientName: string;
    pozPdf?: string;
    invoicePdf?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const dataUriToBlob = async (dataUri: string): Promise<Blob | null> => {
    if (!dataUri) return null;
    try {
        const response = await fetch(dataUri);
        if (!response.ok) return null;
        return await response.blob();
    } catch (error) {
        console.error('Error converting data URI to Blob:', error);
        return null;
    }
};

interface SettlementDocumentsManagerProps {
    settlementId: number;
    orderIds: number[];
    orders: Order[];
    clients: Client[];
    existingDocuments: SettlementDocument[];
    addOrUpdateSettlementDocument: (doc: Omit<SettlementDocument, 'id'>) => void;
    deleteSettlementDocument: (documentId: number) => void;
}

const SettlementDocumentsManager: React.FC<SettlementDocumentsManagerProps> = ({
    settlementId,
    orderIds,
    orders,
    clients,
    existingDocuments,
    addOrUpdateSettlementDocument,
    deleteSettlementDocument
}) => {
    const [documentPairs, setDocumentPairs] = useState<DocumentPair[]>([]);
    const [mergingPairId, setMergingPairId] = useState<number | null>(null);

    useEffect(() => {
        // Create document pairs for each unique order in the settlement
        const uniqueOrderIds = [...new Set(orderIds)];
        const pairs = uniqueOrderIds.map(orderId => {
            const order = orders.find(o => o.id === orderId);
            const client = clients.find(c => c.id === order?.clientId);
            const existingDoc = existingDocuments.find(d => d.orderId === orderId);
            
            return {
                orderId,
                orderNumber: order?.orderNumber || 'N/A',
                clientName: client?.name || 'N/A',
                pozPdf: existingDoc?.pozPdf,
                invoicePdf: existingDoc?.invoicePdf,
            };
        });
        setDocumentPairs(pairs);
    }, [orderIds, orders, clients, existingDocuments]);

    const handleFileDrop = async (orderId: number, file: File, type: 'poz' | 'invoice') => {
        if (!file) return;

        try {
            const base64 = await fileToBase64(file);
            
            // Update local state
            setDocumentPairs(prev => prev.map(pair => 
                pair.orderId === orderId 
                    ? { ...pair, [type === 'poz' ? 'pozPdf' : 'invoicePdf']: base64 }
                    : pair
            ));

            // Find current document for this order
            const currentDoc = documentPairs.find(p => p.orderId === orderId);
            
            // Save to backend
            addOrUpdateSettlementDocument({
                settlementId,
                orderId,
                pozPdf: type === 'poz' ? base64 : currentDoc?.pozPdf,
                invoicePdf: type === 'invoice' ? base64 : currentDoc?.invoicePdf,
            });
        } catch (error) {
            console.error("Błąd podczas konwersji pliku:", error);
            alert("Wystąpił błąd podczas dodawania pliku.");
        }
    };

    const handleRemoveFile = (orderId: number, type: 'poz' | 'invoice') => {
        const currentDoc = documentPairs.find(p => p.orderId === orderId);
        if (!currentDoc) return;

        // Update local state
        setDocumentPairs(prev => prev.map(pair => 
            pair.orderId === orderId 
                ? { ...pair, [type === 'poz' ? 'pozPdf' : 'invoicePdf']: undefined }
                : pair
        ));

        // Update backend
        addOrUpdateSettlementDocument({
            settlementId,
            orderId,
            pozPdf: type === 'poz' ? undefined : currentDoc.pozPdf,
            invoicePdf: type === 'invoice' ? undefined : currentDoc.invoicePdf,
        });
    };

    const mergePair = async (orderId: number): Promise<string | null> => {
        if (!window.PDFLib) {
            alert("Biblioteka PDF nie została załadowana.");
            return null;
        }

        const pair = documentPairs.find(p => p.orderId === orderId);
        if (!pair || !pair.pozPdf || !pair.invoicePdf) {
            alert("Brak kompletnej pary dokumentów.");
            return null;
        }

        setMergingPairId(orderId);
        try {
            const { PDFDocument } = window.PDFLib;
            const mergedPdfDoc = await PDFDocument.create();

            // Najpierw Faktura
            const invResponse = await fetch(pair.invoicePdf);
            const invBytes = await invResponse.arrayBuffer();
            const invDoc = await PDFDocument.load(invBytes);
            const invPages = await mergedPdfDoc.copyPages(invDoc, invDoc.getPageIndices());
            invPages.forEach(page => mergedPdfDoc.addPage(page));

            // Potem POZ
            const pozResponse = await fetch(pair.pozPdf);
            const pozBytes = await pozResponse.arrayBuffer();
            const pozDoc = await PDFDocument.load(pozBytes);
            const pozPages = await mergedPdfDoc.copyPages(pozDoc, pozDoc.getPageIndices());
            pozPages.forEach(page => mergedPdfDoc.addPage(page));

            return await mergedPdfDoc.saveAsBase64({ dataUri: true });
        } catch (error) {
            console.error("Błąd podczas łączenia plików PDF:", error);
            alert("Wystąpił błąd podczas łączenia plików PDF.");
            return null;
        } finally {
            setMergingPairId(null);
        }
    };

    const handlePreview = async (orderId: number) => {
        const mergedPdf = await mergePair(orderId);
        if (mergedPdf) {
            const blob = await dataUriToBlob(mergedPdf);
            if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
        }
    };

    const handleDownload = async (orderId: number) => {
        const mergedPdf = await mergePair(orderId);
        if (mergedPdf) {
            const blob = await dataUriToBlob(mergedPdf);
            if (blob) {
                const pair = documentPairs.find(p => p.orderId === orderId);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${pair?.orderNumber || orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
    };

    const completePairsCount = documentPairs.filter(p => p.pozPdf && p.invoicePdf).length;

    return (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-md mb-4">Dokumenty Rozliczenia</h4>
            
            <div className="space-y-4">
                {documentPairs.map(pair => {
                    const isComplete = pair.pozPdf && pair.invoicePdf;
                    const isMerging = mergingPairId === pair.orderId;
                    
                    return (
                    <div key={pair.orderId} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h5 className="font-medium mb-3">
                            Zamówienie: {pair.orderNumber} ({pair.clientName})
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            {/* Faktura - NAJPIERW */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Faktura (.pdf)
                                </label>
                                {pair.invoicePdf ? (
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                                        <span className="text-sm flex-1">Faktura.pdf</span>
                                        <Button 
                                            size="icon" 
                                            variant="ghost"
                                            onClick={() => handleRemoveFile(pair.orderId, 'invoice')}
                                        >
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                ) : (
                                    <Dropzone
                                        onFileDrop={(file) => handleFileDrop(pair.orderId, file, 'invoice')}
                                        accept="application/pdf"
                                        maxSizeMB={1.5}
                                        disabled={isMerging}
                                    />
                                )}
                            </div>

                            {/* POZ - POTEM */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    POZ (.pdf)
                                </label>
                                {pair.pozPdf ? (
                                    <div className="flex items-center gap-2 p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                                        <span className="text-sm flex-1">POZ.pdf</span>
                                        <Button 
                                            size="icon" 
                                            variant="ghost"
                                            onClick={() => handleRemoveFile(pair.orderId, 'poz')}
                                        >
                                            <TrashIcon />
                                        </Button>
                                    </div>
                                ) : (
                                    <Dropzone
                                        onFileDrop={(file) => handleFileDrop(pair.orderId, file, 'poz')}
                                        accept="application/pdf"
                                        maxSizeMB={1.5}
                                        disabled={isMerging}
                                    />
                                )}
                            </div>
                        </div>
                        
                        {isComplete && (
                            <div className="flex gap-2 pt-2 border-t">
                                <Button size="sm" onClick={() => handlePreview(pair.orderId)} disabled={isMerging}>
                                    {isMerging ? 'Przetwarzanie...' : <><EyeIcon className="w-4 h-4 mr-2" /> Podgląd</>}
                                </Button>
                                <Button size="sm" onClick={() => handleDownload(pair.orderId)} disabled={isMerging}>
                                    {isMerging ? 'Przetwarzanie...' : <><DownloadIcon className="w-4 h-4 mr-2" /> Pobierz</>}
                                </Button>
                            </div>
                        )}
                    </div>
                )})}
            </div>

            {documentPairs.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Kompletne pary: {completePairsCount} / {documentPairs.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SettlementDocumentsManager;
