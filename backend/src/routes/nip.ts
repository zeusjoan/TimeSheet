import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Zmieniamy nazwę parametru na 'nip', żeby było zgodne z logiką
router.get('/:nip', async (req: Request, res: Response) => {
    const { nip } = req.params;
    const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`;

    try {
        const apiResponse = await axios.get(url);
        
        const subject = apiResponse.data?.result?.subject;

        if (!subject) {
            return res.status(404).json({ message: 'Nie znaleziono firmy o podanym numerze NIP w rejestrze VAT.' });
        }

        // Zwracamy nazwę i opcjonalnie adres
        res.json({ 
            name: subject.name,
            address: subject.residenceAddress || ''
        });

    } catch (e: any) {
        const error = e as any;
        console.error('Błąd podczas pobierania danych z API MF:', error.response?.data || error.message);
        if (error.response?.status === 404) {
             return res.status(404).json({ message: 'Nie znaleziono firmy o podanym numerze NIP.' });
        }
        if (error.response?.status === 400) {
            return res.status(400).json({ message: 'Nieprawidłowy format numeru NIP.' });
        }
        res.status(500).json({ message: 'Wystąpił błąd serwera podczas komunikacji z API Ministerstwa Finansów.' });
    }
});

export default router;
