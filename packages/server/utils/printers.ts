import fs from 'fs';
import path from 'path';
import { getPrinters as wingetPrinters, PDFPrinter as WinPDFPrint } from '@myteril/node-win-printer';
import { getPrinters as unixgetPrinters, print as unixPrint } from 'unix-print';
import { Logger } from '.';

const logger = new Logger('printer');

let winPrinter: WinPDFPrint;

export interface Printer {
    printer: string;
    description?: string;
    status?: string;
    alerts?: string;
    connection?: string;
}

export function initWinPrinter() {
    if (winPrinter) return;
    const execPath = [
        './SumatraPDF.exe',
        path.resolve(__dirname, 'SumatraPDF.exe'),
        path.resolve(process.cwd(), 'SumatraPDF.exe'),
        'C:\\Program Files\\SumatraPDF\\SumatraPDF.exe',
        'C:\\Program Files (x86)\\SumatraPDF\\SumatraPDF.exe',
    ];
    const sumatraPdfPath = execPath.find((p) => fs.existsSync(p));
    if (!sumatraPdfPath) {
        // eslint-disable-next-line max-len
        throw new Error('SumatraPDF not found, please install it on https://www.sumatrapdfreader.org/download-free-pdf-viewer, or direct download from https://www.sumatrapdfreader.org/dl/rel/3.1.2/SumatraPDF-3.1.2.zip');
    }
    logger.info(`SumatraPDF found at ${sumatraPdfPath}`);
    winPrinter = new WinPDFPrint({
        sumatraPdfPath,
    });
}

const windowsPrinterStatus = {
    3: 'idle',
    4: 'printing',
};

export async function getPrinters(): Promise<Printer[]> {
    if (process.platform === 'win32') {
        const winprinters = await wingetPrinters();
        return winprinters.filter((p: any) => p.DeviceID).map((p: any) => ({
            printer: p.DeviceID,
            description: p.Caption,
            status: windowsPrinterStatus[p.PrinterStatus] ? windowsPrinterStatus[p.PrinterStatus] : 'unknown',
        }));
    }
    return await unixgetPrinters();
}

export async function print(file: string, printer: string, startPage?: number, endPage?: number) {
    if (process.platform === 'win32') {
        return winPrinter.print({
            file,
            printer,
            pages: startPage && endPage ? [{ start: startPage, end: endPage }] : undefined,
        });
    }
    return unixPrint(file, printer, startPage && endPage ? ['-P', `${startPage}-${endPage}`] : []);
}

export async function getWinReceiptPrinter() {
    const winprinters = await wingetPrinters();
    return winprinters.filter((p: any) => p.DeviceID).filter((p: any) => p.ShareName).map((p: any) => ({
        printer: `\\\\${p.SystemName}\\${p.ShareName}`,
        device: p.DeviceID,
        description: p.Caption,
        status: windowsPrinterStatus[p.PrinterStatus] ? windowsPrinterStatus[p.PrinterStatus] : 'unknown',
    }));
}
