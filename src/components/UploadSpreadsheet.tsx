import { useState } from "react";
import ReactSpreadsheet from "react-spreadsheet";
import * as xlsx from "xlsx";
import { IPreview } from "../types";

interface IProps {
    onLoad: (preview: IPreview) => void;
    onClose: () => void;
}

const UploadSpreadsheet: React.FC<IProps> = ({ onLoad, onClose }) => {
    const [preview, setPreview] = useState<any>(null);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event?.target?.files?.length && event?.target?.files?.length > 0) {
            const file = event.target.files[0];

            readFile(file).then(data => {
                console.log(data);
                setPreview(data);
            });
        }
    }

    const csvToArray = (csv: string): string[][] => {
        const rows = csv.split("\n");

        return rows.map((row: string) => {
            return row.split(",");
        });
    }

    const arrayToReactSpreadsheet = (array: string[][]): any[][] => {
        return array.map((row: string[]) => {
            return row.map((cell: string) => {
                return { value: cell, readOnly: true };
            });
        });
    }

    const readFile = async (inputFile: File): Promise<IPreview | null> => {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async (e: any) => {
                const data = e.target.result;
                const workbook = xlsx.read(data, { type: "binary" })
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                const json = xlsx.utils.sheet_to_json(sheet);
                const csv = xlsx.utils.sheet_to_csv(sheet);
                resolve({
                    json,
                    csv,
                    name: inputFile.name,
                });
            };
            reader.onerror = () => reject(null);
            reader.onabort = () => reject(null);
            reader.readAsBinaryString(inputFile);
        });
    }

    return (
        <div tabIndex={-1} className="fixed top-0 left-0 z-50 w-full h-full flex justify-center bg-opacity-70 bg-gray-900">
            <div className="relative p-4 w-full max-w-2xl h-full md:h-auto">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex justify-between items-start p-4 rounded-t border-b dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            File Upload
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        {preview ? (
                            <div className="overflow-auto max-h-48">
                                <ReactSpreadsheet data={arrayToReactSpreadsheet(csvToArray(preview.csv))} />
                            </div>
                        ) : (
                            <div className="flex justify-center items-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                    <div className="flex flex-col justify-center items-center pt-5 pb-6">
                                        <svg className="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">XLSX or CSV</p>
                                    </div>
                                    <input onChange={handleChange} id="dropzone-file" type="file" className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>
                    {preview ? (
                        <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                            <button type="button" onClick={() => { onLoad(preview); onClose() }} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Upload</button>
                            <button type="button" onClick={() => setPreview(null)} className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Cancel</button>
                        </div>
                    ) : null}
                </div>
            </div >
        </div >
    );
};

export default UploadSpreadsheet;