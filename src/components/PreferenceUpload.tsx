import React from "react";
import UploadSpreadsheet from "../components/UploadSpreadsheet";
import { IPreview } from "../types";

interface IProps {
    preferences: IPreview | null;
    setPreferences: (preferences: IPreview | null) => void;
    label: string;
}

const PreferenceUpload: React.FC<IProps> = ({ preferences, setPreferences, label }) => {
    const [visible, setVisible] = React.useState<boolean>(false);

    return (
        <>
            <div className="border border-blue-500 rounded-lg p-3 flex flex-col space-y-3">
                <h2 className="text-lg">{label}</h2>

                {!preferences ? (
                    <button type="button" onClick={() => setVisible(true)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Upload</button>
                ) : (
                    <div className="flex bg-gray-200 p-3 rounded-lg justify-between px-5">
                        <div className="flex flex-col space-y-1">
                            <p>{preferences.name}</p>
                            <p className="italic text-sm">{preferences.json.length} preferences loaded</p>
                        </div>
                        <button type="button" onClick={() => setPreferences(null)} className="text-gray-400 hover:text-gray-900 text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                )}
            </div>


            {visible ? (
                <UploadSpreadsheet
                    onLoad={(e: IPreview) => setPreferences(e)}
                    onClose={() => setVisible(false)}
                />
            ) : null}
        </>
    );
}

export default PreferenceUpload;
