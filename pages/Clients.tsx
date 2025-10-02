
import React, { useState, useEffect } from 'react';
import type { Client, Contact } from '../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EditIcon from '../components/icons/EditIcon';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface ClientsProps {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: number) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, addClient, updateClient, deleteClient }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nip, setNip] = useState('');
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState<Partial<Contact>[]>([{ name: '', email: '' }]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email);
      setNip(editingClient.nip);
      setPhone(editingClient.phone || '');
      setContacts(editingClient.contacts && editingClient.contacts.length > 0 ? editingClient.contacts : [{ name: '', email: '' }]);
      setShowForm(true);
    }
  }, [editingClient]);

  const handleNipBlur = async () => {
    if (nip.trim().length > 0) {
      setIsFetching(true);
      setFetchError(null);
      try {
        const response = await fetch(`/api/company-data/${nip}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Nie udało się pobrać danych firmy.');
        }

        if (data.name) {
          setName(data.name);
          // Można by tu również zaktualizować pole adresu, gdyby istniało w formularzu
        }
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : 'Wystąpił nieznany błąd.');
      } finally {
        setIsFetching(false);
      }
    }
  };
  
  const handleCancel = () => {
      setShowForm(false);
      setEditingClient(null);
      setName('');
      setEmail('');
      setNip('');
      setPhone('');
      setContacts([{ name: '', email: '' }]);
  };
  
  const handleAddNew = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setNip('');
    setPhone('');
    setContacts([{ name: '', email: '' }]);
    setShowForm(true);
  }
  
  const handleEdit = (client: Client) => {
      setEditingClient(client);
  };

  const handleDeleteClick = (clientId: number) => {
    setClientToDelete(clientId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
    }
    setIsConfirmOpen(false);
    setClientToDelete(null);
  };

  const handleContactChange = (index: number, field: 'name' | 'email', value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setContacts(newContacts);
  };

  const addContactInput = () => {
    setContacts([...contacts, { name: '', email: '' }]);
  };

  const removeContactInput = (index: number) => {
    if (contacts.length > 1) {
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
    } else {
        setContacts([{ name: '', email: '' }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nip) {
      const filteredContacts = contacts.filter(c => c.name?.trim() && c.email?.trim());
      
      const clientData = {
        name,
        email,
        nip,
        phone,
        contacts: filteredContacts as Contact[],
      };

      if (editingClient) {
        updateClient({ ...editingClient, ...clientData });
      } else {
        addClient(clientData as Omit<Client, 'id'>);
      }
      handleCancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary dark:text-white">Klienci</h1>
        <Button onClick={showForm && !editingClient ? handleCancel : handleAddNew}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {showForm && !editingClient ? 'Anuluj' : 'Dodaj Klienta'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClient ? 'Edytuj Klienta' : 'Nowy Klient'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nazwa Klienta"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Global Tech Inc."
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. contact@globaltech.com"
                required
              />
              <Input
                label="NIP"
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                onBlur={handleNipBlur}
                placeholder="np. 123-456-78-90"
                required
              />
              {isFetching && <p className="text-sm text-gray-500">Pobieranie danych...</p>}
              {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}
              <Input
                label="Telefon"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="np. 111-222-333"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kontakty</label>
                {contacts.map((contact, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 items-center">
                        <Input
                            className="md:col-span-5"
                            type="text"
                            value={contact.name || ''}
                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                            placeholder="Imię i nazwisko"
                        />
                         <Input
                            className="md:col-span-6"
                            type="email"
                            value={contact.email || ''}
                            onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                            placeholder="np. contact@example.com"
                        />
                        <Button className="md:col-span-1" type="button" variant="destructive" size="icon" onClick={() => removeContactInput(index)}>
                            <TrashIcon />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addContactInput}>
                    <PlusIcon className="w-4 h-4 mr-2"/> Dodaj Kontakt
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={handleCancel}>Anuluj</Button>
                <Button type="submit">{editingClient ? 'Zapisz Zmiany' : 'Zapisz Klienta'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Lista Klientów</CardTitle>
            <CardDescription>Zarządzaj swoimi klientami.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nazwa Klienta</TableHead>
                        <TableHead>NIP</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Kontakty</TableHead>
                        <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.nip}</TableCell>
                            <TableCell>{client.phone}</TableCell>
                            <TableCell>
                                {(client.contacts || []).length > 0 ? (
                                    (client.contacts).map(contact => (
                                        <div key={contact.id} className="text-xs">
                                            <span className="font-semibold">{contact.name}</span> ({contact.email})
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                               <div className="flex gap-2 justify-end">
                                   <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                                       <EditIcon />
                                   </Button>
                                   <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(client.id)}>
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

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Potwierdzenie usunięcia"
        description="Czy na pewno chcesz usunąć tego klienta? Usunięcie klienta spowoduje również usunięcie wszystkich powiązanych zamówień i rozliczeń."
      />
    </div>
  );
};

export default Clients;
