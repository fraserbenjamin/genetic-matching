import React from "react";
import { IConfig } from "../types";

interface IProps {
    config: IConfig;
    setConfig: (config: IConfig) => void;
}

const Config: React.FC<IProps> = ({ config, setConfig }) => {

    return (
        <div className="border border-blue-500 rounded-lg p-3 flex flex-col space-y-3">
            <h2 className="text-lg">Configure</h2>


            <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Manager Weighting {config.managerWeighting}%
            </label>
            <input
                id="steps-range"
                type="range"
                min={0}
                max={100}
                value={config.managerWeighting}
                onChange={(e) => setConfig({ ...config, managerWeighting: Number(e.target.value) })}
                step={10}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />

            <div className="flex flex-wrap my-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg flex h-full overflow-hidden">
                    <input
                        type="number"
                        min={1}
                        max={100000}
                        value={config.populationSize}
                        onChange={(e) => setConfig({ ...config, populationSize: Number(e.target.value) })}
                        className="p-3 bg-transparent flex-grow border-l border-t border-b border-gray-400 overflow-hidden rounded-l-lg"
                    />
                    <label className="bg-blue-700 text-white p-3 flex flex-col justify-center flex-shrink text-center">
                        Population Size
                    </label>
                </div>

                <div className="rounded-lg flex h-full overflow-hidden">
                    <input
                        type="number"
                        min={1}
                        max={1000000}
                        value={config.iterations}
                        onChange={(e) => setConfig({ ...config, iterations: Number(e.target.value) })}
                        className="p-3 bg-transparent flex-grow border-l border-t border-b border-gray-400 overflow-hidden rounded-l-lg"
                    />
                    <label className="bg-blue-700 text-white p-3 flex flex-col justify-center flex-shrink text-center">
                        Iterations
                    </label>
                </div>
            </div>
        </div>
    );
}

export default Config;
