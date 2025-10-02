
import React, { useState, useEffect, useMemo } from 'react';
import type { Client, Order, OrderItem, Attachment } from '../types';
import { OrderStatus, OrderItemType } from '../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import PaperclipIcon from '../components/icons/PaperclipIcon';
import EyeIcon from '../components/icons/EyeIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import XIcon from '../components/icons/XIcon';
import Dropzone from '../components/ui/Dropzone';

interface OrdersProps {
  orders: Order[];
  clients: Client[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (orderId: number) => void;
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
        if (!response.ok) {
            console.error('Failed to fetch data URI:', response.statusText);
            return null;
        }
        return await response.blob();
    } catch (error) {
        console.error('Error converting data URI to Blob:', error);
        return null;
    }
};

const initialOrderState: Omit<Order, 'id'> = {
  clientId: 0,
  contactId: undefined,
  orderNumber: '',
  supplierNumber: '',
  description: '',
  documentDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  contractNumber: '',
  items: [{ type: OrderItemType.CONSULTATIONS, hours: 0, rate: 0 }],
  status: OrderStatus.ACTIVE,
  attachments: [],
};


const Orders: React.FC<OrdersProps> = ({ orders, clients, addOrder, updateOrder, deleteOrder }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderData, setOrderData] = useState<Omit<Order, 'id'>>(initialOrderState);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  const availableContacts = useMemo(() => {
    if (!orderData.clientId) return [];
    const client = clients.find(c => c.id === orderData.clientId);
    return client?.contacts || [];
  }, [orderData.clientId, clients]);

  useEffect(() => {
    if (editingOrder) {
      const { id, ...dataToEdit } = editingOrder;
      setOrderData({
        ...dataToEdit,
        attachments: dataToEdit.attachments || []
      });
      setShowForm(true);
    }
  }, [editingOrder]);

  useEffect(() => {
    if (orderData.clientId) {
      const isContactStillAvailable = availableContacts.some(contact => contact.id === orderData.contactId);
      if (!isContactStillAvailable) {
        setOrderData(prev => ({ ...prev, contactId: undefined }));
      }
    } else {
      setOrderData(prev => ({ ...prev, contactId: undefined }));
    }
  }, [orderData.clientId, availableContacts]);

  const getClientName = (clientId: number) => {
    return clients.find(c => c.id === clientId)?.name || 'Nieznany';
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'clientId' || name === 'contactId') ? (value ? Number(value) : undefined) : value;
    setOrderData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderData.items];
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'type' ? value : numericValue };
    setOrderData(prev => ({ ...prev, items: updatedItems }));
  };
  
  const addItem = () => {
    const availableTypes = Object.values(OrderItemType).filter(type => !orderData.items.some(item => item.type === type));
    if (availableTypes.length > 0) {
       setOrderData(prev => ({
        ...prev,
        items: [...prev.items, { type: availableTypes[0], hours: 0, rate: 0 }],
      }));
    }
  };
  
  const removeItem = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    setOrderData(initialOrderState);
  };
  
  const handleAddNew = () => {
      setEditingOrder(null);
      setOrderData(initialOrderState);
      setShowForm(true);
  };
  
  const handleEdit = (order: Order) => {
      setEditingOrder(order);
  };

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (orderToDelete) {
        deleteOrder(orderToDelete);
    }
    setIsConfirmOpen(false);
    setOrderToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(orderData.clientId && orderData.orderNumber) {
        if (editingOrder) {
            updateOrder({ ...orderData, id: editingOrder.id });
        } else {
            addOrder(orderData);
        }
        handleCancel();
    } else {
        alert("Proszę wybrać klienta i podać numer zamówienia.");
    }
  };

  const handleAttachmentDrop = async (file: File) => {
    if (!file) return;

    try {
        const fileContent = await fileToBase64(file);
        const newAttachment: Attachment = {
            id: crypto.randomUUID(),
            fileName: file.name,
            fileContent,
        };
        setOrderData(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), newAttachment],
        }));
    } catch (error) {
        console.error("Błąd podczas konwersji pliku:", error);
        alert("Wystąpił błąd podczas dodawania pliku.");
    }
  };

  const handleAttachmentRemove = (attachmentId: string) => {
      setOrderData(prev => ({
          ...prev,
          attachments: prev.attachments?.filter(att => att.id !== attachmentId),
      }));
  };

  const handleViewAttachment = async (fileContent: string) => {
    const blob = await dataUriToBlob(fileContent);
    if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } else {
        alert('Nie udało się otworzyć pliku.');
    }
  };

  const handleDownloadAttachment = async (fileContent: string, fileName: string) => {
      const blob = await dataUriToBlob(fileContent);
      if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } else {
          alert('Nie udało się pobrać pliku.');
      }
  };
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case OrderStatus.INACTIVE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case OrderStatus.ARCHIVED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary dark:text-white">Zamówienia</h1>
        <Button onClick={showForm && !editingOrder ? handleCancel : handleAddNew}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {showForm && !editingOrder ? 'Anuluj' : 'Dodaj Zamówienie'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingOrder ? 'Edytuj Zamówienie' : 'Nowe Zamówienie'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Klient" name="clientId" value={orderData.clientId} onChange={handleInputChange} required>
                    <option value="">Wybierz klienta</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Input label="Numer Zamówienia" name="orderNumber" value={orderData.orderNumber} onChange={handleInputChange} required />
                <Input label="Numer Dostawcy" name="supplierNumber" value={orderData.supplierNumber} onChange={handleInputChange} />
                <Input label="Data Dokumentu" name="documentDate" type="date" value={orderData.documentDate} onChange={handleInputChange} />
                <Input label="Data Dostawy" name="deliveryDate" type="date" value={orderData.deliveryDate} onChange={handleInputChange} />
                <Input label="Numer Umowy" name="contractNumber" value={orderData.contractNumber} onChange={handleInputChange} />
                <Select 
                    label="Osoba Zamawiająca" 
                    name="contactId" 
                    value={orderData.contactId || ''} 
                    onChange={handleInputChange}
                    disabled={!orderData.clientId || availableContacts.length === 0}
                  >
                    <option value="">Wybierz osobę kontaktową</option>
                    {availableContacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.email})
                      </option>
                    ))}
                  </Select>
                <Input label="Opis" name="description" value={orderData.description} onChange={handleInputChange} required />
                <Select label="Status" name="status" value={orderData.status} onChange={handleInputChange}>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>

              <div className="space-y-2 pt-4">
                  <h4 className="font-medium">Pozycje w zamówieniu</h4>
                  {orderData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded-md">
                          <Select label="Typ" value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)}>
                              {Object.values(OrderItemType).map(t => <option key={t} value={t}>{t}</option>)}
                          </Select>
                          <Input label="Ilość godzin" type="number" value={item.hours} onChange={e => handleItemChange(index, 'hours', e.target.value)} />
                          <Input label="Stawka PLN" type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
                          <Button variant="destructive" type="button" onClick={() => removeItem(index)} disabled={orderData.items.length <= 1}>
                              <TrashIcon />
                          </Button>
                      </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addItem} disabled={orderData.items.length >= Object.values(OrderItemType).length}>
                    <PlusIcon className="w-4 h-4 mr-2"/> Dodaj Pozycję
                  </Button>
              </div>
              
              <div className="space-y-2 pt-4">
                <h4 className="font-medium">Załączniki (.pdf)</h4>
                <div className="p-2 border rounded-md space-y-2">
                    {orderData.attachments?.map(att => (
                        <div key={att.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <span className="text-sm truncate pr-2">{att.fileName}</span>
                            <Button type="button" variant="destructive" size="icon" onClick={() => handleAttachmentRemove(att.id)}><TrashIcon /></Button>
                        </div>
                    ))}
                    <Dropzone
                        onFileDrop={handleAttachmentDrop}
                        accept="application/pdf"
                        maxSizeMB={5}
                    />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" type="button" onClick={handleCancel}>Anuluj</Button>
                <Button type="submit">{editingOrder ? 'Zapisz Zmiany' : 'Zapisz Zamówienie'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Lista Zamówień</CardTitle>
            <CardDescription>Zarządzaj zamówieniami klientów.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klient</TableHead>
                <TableHead>Nr Zamówienia</TableHead>
                <TableHead>Data Dokumentu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Załączniki</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{getClientName(order.clientId)}</TableCell>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.documentDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {order.attachments && order.attachments.length > 0 ? (
                      <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)}>
                        <PaperclipIcon className="w-5 h-5" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                     <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(order)}>
                            <EditIcon />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(order.id)}>
                            <TrashIcon />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true">
          <Card className="w-full max-w-2xl mx-4 relative">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Załączniki</CardTitle>
                  <CardDescription>Zamówienie: {viewingOrder.orderNumber}</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => setViewingOrder(null)}>
                  <XIcon />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {viewingOrder.attachments && viewingOrder.attachments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa Pliku</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingOrder.attachments.map(att => (
                      <TableRow key={att.id}>
                        <TableCell className="font-medium truncate max-w-xs">{att.fileName}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="icon" variant="ghost" onClick={() => handleViewAttachment(att.fileContent)} title="Podgląd"><EyeIcon /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDownloadAttachment(att.fileContent, att.fileName)} title="Pobierz"><DownloadIcon /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">Brak załączników.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Potwierdzenie usunięcia"
        description="Czy na pewno chcesz usunąć to zamówienie? Usunięcie zamówienia spowoduje również usunięcie wszystkich powiązanych rozliczeń."
      />
    </div>
  );
};

export default Orders;
